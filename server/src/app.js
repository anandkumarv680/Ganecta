const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const loginRoutes = require("./routes/login.route");
const postRoutes = require("./routes/post.route");
const userRoutes = require("./routes/user.route");
const commentRoutes = require("./routes/comment.route");
const challengeRoutes = require("./routes/challenge.route");
const notificationRoutes = require("./routes/notification.route");
const messageRoutes = require("./routes/message.route");

app.use(express.json());
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use("/api/notifications", notificationRoutes);
app.use("/api/auth/users", loginRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts/comments", commentRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/messages", messageRoutes);


app.use((err, req, res, next) => {
  console.error(err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500 ? err.message : "Internal server error",
  });
});

app.get("/", (req, res) => {
  res.json({ Message: "Welcome to Ganecta " });
});

module.exports = app;
