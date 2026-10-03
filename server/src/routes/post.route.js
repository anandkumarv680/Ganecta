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
router.post("/:postId/like", authMiddleware, toggleLike);
router.get("/", getAllPosts);
router.get("/:postId", getPostById);
router.put("/:postId", authMiddleware, updatePost);
router.delete("/:postId", authMiddleware, deletePost);

module.exports = router;