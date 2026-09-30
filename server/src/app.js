const express = require("express");
const cors = require("cors");
const app = express();
const loginRoutes = require("./routes/login.route");
const postRoutes = require('./routes/post.route')

app.use(express.json());
app.use(cors());

app.use("/api/auth/users", loginRoutes);
app.use('/api/posts', postRoutes )

app.get("/", (req, res) => {
  res.json({ Message: "Welcome to Ganecta " });
});

module.exports = app;
