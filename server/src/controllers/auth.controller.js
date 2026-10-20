const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    error: "Too many login attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const createUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ Error: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ Error: "Password must be at least 8 characters long" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ Error: "Invalid email format" });
    }

    if (name.length < 3) {
      return res
        .status(400)
        .json({ Error: "Name must be at least 3 characters long" });
    }

    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(409).json({ Error: "Email already exists" });
    }

    const existingUserUsername = await User.findOne({ username });
    if (existingUserUsername) {
      return res.status(409).json({ Error: "Username already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ Message: "User created successfully" });
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        Error: "Both fields are required",
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({
        Error: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        Error: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      Message: "User logged in successfully",
      token,
    });
  } catch (err) {
    return res.status(500).json({
      Error: "Internal server error",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  loginLimiter,
};
