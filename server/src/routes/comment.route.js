const express = require("express");

const router = express.Router();

const {
  getComment,
  deleteComment,
  createComment,
} = require("../controllers/comment.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post("/:postId", authMiddleware, createComment);

router.get("/:postId", authMiddleware, getComment);

router.delete("/:commentId", authMiddleware, deleteComment);

module.exports = router;
