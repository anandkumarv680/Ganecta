const express = require("express");
const router = express.Router();

const {
  getUserById,
  updateUserProfile,
  getUserPost,
  followUser,
  getFollowers,
  getFollowing,
  searchUser,
} = require("../controllers/user.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/search", authMiddleware, searchUser);

router.put("/profile", authMiddleware, updateUserProfile);

router.put("/follow/:followId", authMiddleware, followUser);

router.get("/:userId", authMiddleware, getUserById);

router.get("/:userId/posts", authMiddleware, getUserPost);

router.get("/:userId/followers", authMiddleware, getFollowers);

router.get("/:userId/following", authMiddleware, getFollowing);

module.exports = router;
