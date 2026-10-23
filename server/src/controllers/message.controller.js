const mongoose = require("mongoose");
const Message = require("../models/message.model");
const User = require("../models/user.model");

const getAllConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          chatPartner: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$chatPartner",
          lastMessage: { $first: "$content" },
          lastMessageAt: { $first: "$createdAt" },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const partnerIds = conversations.map((chat) => chat._id);
    const users = await User.find({ _id: { $in: partnerIds } }).select(
      "name username",
    );

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const result = conversations.map((chat) => ({
      user: userMap.get(chat._id.toString()) || null,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId } = req.params;
    const { limit = 50, before } = req.query;

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const otherUser = await User.findById(otherUserId).select("_id");

    if (!otherUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const filter = {
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    };

    if (before && !Number.isNaN(Date.parse(before))) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .populate("sender", "name username")
      .populate("receiver", "name username")
      .lean();

    res.status(200).json({
      messages: messages.reverse(),
      hasMore: messages.length === parsedLimit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllConversations,
  getChatHistory,
};
