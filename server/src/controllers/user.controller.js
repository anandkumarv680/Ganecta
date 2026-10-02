const Post = require("../models/post.model");
const User = require("../models/user.model");

const getUserById = async (req, res) => {
  try {

    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, bio, skills, profileUrl } = req.body;


    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (profileUrl !== undefined) user.profilePicture = profileUrl;

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        bio: user.bio,
        skills: user.skills,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getUserPost = async (req, res) => {
  try {

    const { userId } = req.params;


    const posts = await Post.find({ author: userId }).populate(
      "author",
      "name username profilePicture",
    );


    if (posts.length === 0) {
      return res.status(200).json({
        message: "No posts found",
        posts: [],
      });
    }

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const followUser = async (req, res) => {
  try {

    const userId = req.user.id;
    const { followId } = req.params;

    const user = await User.findById(userId);
    const targetUser = await User.findById(followId);

    if (!user || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }


    if (userId === followId) {
      return res.status(400).json({
        error: "You cannot follow yourself",
      });
    }



    const isFollowing = user.following.some((id) => id.toString() === followId);

    if (isFollowing) {

      user.following = user.following.filter(
        (id) => id.toString() !== followId,
      );

      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== userId,
      );

      await user.save();
      await targetUser.save();

      return res.status(200).json({
        message: "Unfollowed successfully",
      });
    }


    user.following.push(followId);
    targetUser.followers.push(userId);

    await user.save();
    await targetUser.save();

    return res.status(200).json({
      message: "Followed successfully",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getFollowers = async (req, res) => {
  try {

    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "followers",
      "name username profilePicture",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user.followers);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getFollowing = async (req, res) => {
  try {

    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "following",
      "name username profilePicture",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user.following);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUserById,
  updateUserProfile,
  getUserPost,
  followUser,
  getFollowers,
  getFollowing,
};
