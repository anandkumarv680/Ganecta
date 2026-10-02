const express = require("express");
const router = express.Router();

const {
  getUserById,
  updateUserProfile,
  getUserPost,
  followUser,
  getFollowers,
  getFollowing,
} = require("../controllers/user.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.put("/profile", authMiddleware, updateUserProfile);

router.get("/:userId", getUserById);

router.get("/:userId/posts", getUserPost);

router.put("/follow/:followId", authMiddleware, followUser);

router.get("/:userId/followers", getFollowers);

router.get("/:userId/following", getFollowing);

module.exports = router;
