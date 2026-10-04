const Post = require("../models/post.model");
const Comment = require("../models/comment.model");

const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const comment = new Comment({
      content,
      user: userId,
      post: postId,
    });

    await comment.save();

    res.status(201).json({
      message: "Comment created",
      comment,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getComment = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({
      post: postId,
    }).populate("user", "name username");

    if (comments.length === 0) {
      return res.status(404).json({ error: "No comments yet" });
    }

    res.status(200).json({
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        error: "You are not authorized to delete this comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({
      message: "Successfully deleted",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {getComment, deleteComment, createComment};