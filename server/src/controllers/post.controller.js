const Post = require("../models/post.model");

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
      .populate("comments.user", "name username");
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("author", " name username")
      .populate("comments.user", "name username");

    if (!post) {
      return res.status(404).json({ Error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

module.exports = {
  createPost,
  deletePost,
  getAllPosts,
  updatePost,
  getPostById,
};
