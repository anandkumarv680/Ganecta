require("dotenv").config();

const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const app = require("./app");

const httpServer = http.createServer(app);

const Message = require("./models/message.model");
const User = require("./models/user.model");
const mongoose = require("mongoose");

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      !decoded.id ||
      typeof decoded.id !== "string" ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return next(new Error("Invalid token payload"));
    }

    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log("Authenticated user connected:", socket.userId);
  socket.join(socket.userId);

  socket.on("send-message", async (data, callback) => {
    try {
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return callback?.({
            success: false,
            error: "Invalid message data",
          });
        }
      }

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return callback?.({
          success: false,
          error: "Invalid message data",
        });
      }

      const { receiverId, content } = data;

      if (
        !receiverId ||
        typeof receiverId !== "string" ||
        !content ||
        typeof content !== "string" ||
        !content.trim()
      ) {
        return callback?.({
          success: false,
          error: "Receiver ID and message content are required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return callback?.({
          success: false,
          error: "Invalid receiver ID",
        });
      }

      if (receiverId === socket.userId) {
        return callback?.({
          success: false,
          error: "You cannot message yourself",
        });
      }

      const receiver = await User.findById(receiverId);

      if (!receiver) {
        return callback?.({
          success: false,
          error: "Receiver not found",
        });
      }

      const message = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        content: content.trim(),
      });

      io.to(receiverId).emit("new-message", message);

      // Acknowledge successful save
      callback?.({
        success: true,
        message,
      });
    } catch (error) {
      console.error("Send message error:", error);

      callback?.({
        success: false,
        error: "Failed to send message",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });
});

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
