const { Challenge, UserChallenge } = require("../models/challenge.modol");
const User = require("../models/user.model");

const getChallengeById = async (req, res) => {
  try {
    const challengeId = req.params.challengeId;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        error: "challenge not found",
      });
    }

    res.status(200).json(challenge);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const joinChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const challengeId = req.params.challengeId;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        error: "challenge not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }

    const alreadyJoined = await UserChallenge.findOne({
      user: userId,
      challenge: challengeId,
    });

    if (alreadyJoined) {
      return res.status(400).json({
        error: "already joined this challenge",
      });
    }

    const userChallenge = new UserChallenge({
      user: userId,
      challenge: challengeId,
    });

    await userChallenge.save();

    res.status(201).json({
      message: "joined successfully",
      userChallenge,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const createChallenge = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }

    const { title, description, difficulty, duration } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "title missing",
      });
    }

    if (!description) {
      return res.status(400).json({
        error: "description missing",
      });
    }

    if (!difficulty) {
      return res.status(400).json({
        error: "select difficulty",
      });
    }

    if (!duration) {
      return res.status(400).json({
        error: "fill duration of challenge",
      });
    }

    const challenge = new Challenge({
      title,
      description,
      difficulty,
      duration,
      author: userId,
    });

    await challenge.save();

    res.status(201).json({
      message: "successfully created",
      challenge,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const updateChallenge = async (req, res) => {
  try {
    const challengeId = req.params.challengeId;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        error: "challenge not found",
      });
    }

    const userId = req.user.id;

    if (challenge.author.toString() !== userId) {
      return res.status(403).json({
        error: "only author can update this challenge",
      });
    }

    const { title, description, difficulty, duration } = req.body;

    if (title !== undefined) {
      challenge.title = title;
    }

    if (description !== undefined) {
      challenge.description = description;
    }

    if (difficulty !== undefined) {
      challenge.difficulty = difficulty;
    }

    if (duration !== undefined) {
      challenge.duration = duration;
    }

    await challenge.save();

    res.status(200).json({
      message: "updated successfully",
      challenge,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
const deleteChallenge = async (req, res) => {
  try {
    const challengeId = req.params.challengeId;
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({ error: "challenge not found" });
    }

    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (userId !== challenge.author.toString()) {
      return res.status(403).json({ error: "only admin can delete" });
    }

    await Challenge.findByIdAndDelete(challengeId);

    res.status(200).json({ message: "challenge delete successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate("author", "name username");

    res.status(200).json(challenges);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  deleteChallenge,
  updateChallenge,
  getChallengeById,
  createChallenge,
  joinChallenge,
  getAllChallenges
};