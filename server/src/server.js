require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const app = require("./app");

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Test message receive karna
  socket.on("test-message", (message) => {
    console.log("Message received:", message);

    socket.emit("test-reply", "Message received successfully!");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
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