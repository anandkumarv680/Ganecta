const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const User = require("../models/user.model");

const { createNotification } = require("../services/notification.services");

const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const author = req.user.id;
    if (!content || !content.trim()) {
      return res.status(400).json({ Error: "Content is required" });
    }
    const post = await Post.create({ content, author });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ Error: "Post not found" });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ Error: "Unauthorized" });
    }
    await post.deleteOne();
    res.status(200).json({ Message: "Post deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name username")
      .sort({ createdAt: -1 })
      .lean();

    const postIds = posts.map((post) => post._id);

    const comments = await Comment.find({
      post: { $in: postIds },
    })
      .populate("user", "name username")
      .sort({ createdAt: 1 })
      .lean();

    const commentsByPost = {};

    comments.forEach((comment) => {
      const postId = comment.post.toString();

      if (!commentsByPost[postId]) {
        commentsByPost[postId] = [];
      }

      commentsByPost[postId].push(comment);
    });

    const postsWithComments = posts.map((post) => ({
      ...post,
      comments: commentsByPost[post._id.toString()] || [],
    }));

    res.status(200).json(postsWithComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("author", "name username");

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    const comments = await Comment.find({
      post: postId,
    })
      .populate("user", "name username")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      ...post.toObject(),
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};


const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ Error: "Content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ Error: "Post not found" });
    }
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ Error: "Unauthorized" });
    }

    post.content = content;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        Error: "Post not found",
      });
    }

    const isLiked = post.likes.some((id) => id.toString() === userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    if (!isLiked && post.author.toString() !== userId) {
      const user = await User.findById(userId);

      await createNotification({
        sender: userId,
        receiver: post.author,
        type: "like",
        referenceId: post._id,
        message: `${user.name} liked your post`,
      });
    }
    return res.status(200).json({
      Message: isLiked ? "unliked" : "liked",
      liked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createPost,
  deletePost,
  getAllPosts,
  updatePost,
  getPostById,
  toggleLike,
};
