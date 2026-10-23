const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");

const {
  createPost,
  deletePost,
  getAllPosts,
  updatePost,
  getPostById,
  toggleLike,
} = require("../controllers/post.controller");

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getAllPosts);

router.get("/:postId", authMiddleware, getPostById);
router.put("/:postId", authMiddleware, updatePost);
router.delete("/:postId", authMiddleware, deletePost);

router.post("/:postId/like", authMiddleware, toggleLike);

module.exports = router;
