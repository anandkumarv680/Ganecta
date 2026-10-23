const express = require("express");

const {
  createUser,
  loginUser,
  loginLimiter,
} = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginLimiter, loginUser);

module.exports = router;
