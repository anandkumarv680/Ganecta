const express = require("express");
const cors = require("cors");
const app = express();
const loginRoutes = require("./routes/login");

app.use(express.json());
app.use(cors());

app.use("/api/auth/users", loginRoutes);

app.get("/", (req, res) => {
  res.json({ Message: "Welcome to Ganecta " });
});

module.exports = app;
