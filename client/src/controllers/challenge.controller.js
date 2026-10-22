const { Challenge, UserChallenge } = require("../models/challenge.modol");
const User = require("../models/user.model");

const { createNotification } = require("../services/notification.services");

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
    if (challenge.author.toString() !== userId) {
      await createNotification({
        sender: userId,
        receiver: challenge.author,
        type: "challenge",
        referenceId: challenge._id,
        message: `${user.name} joined your challenge`,
      });
    }

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
    const challenges = await Challenge.find().populate(
      "author",
      "name username",
    );

    res.status(200).json(challenges);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const updateDailyProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const challengeId = req.params.challengeId;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        error: "challenge not found",
      });
    }

    const userChallenge = await UserChallenge.findOne({
      user: userId,
      challenge: challengeId,
    });

    if (!userChallenge) {
      return res.status(404).json({
        error: "You have not joined this challenge",
      });
    }

    if (userChallenge.isCompleted) {
      return res.status(400).json({
        error: "Challenge already completed",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayProgress = userChallenge.dailyProgress.find(
      (progress) => progress.date.toDateString() === today.toDateString(),
    );

    if (todayProgress?.completed) {
      return res.status(400).json({
        error: "Today's progress is already completed",
      });
    }

    if (todayProgress) {
      todayProgress.completed = true;
    } else {
      userChallenge.dailyProgress.push({
        date: today,
        completed: true,
      });
    }

    const completedDays = userChallenge.dailyProgress.filter(
      (progress) => progress.completed,
    ).length;

    if (completedDays >= challenge.duration) {
      userChallenge.isCompleted = true;
      userChallenge.completedAt = new Date();

      const pointsMap = {
        Easy: 10,
        Medium: 20,
        Hard: 30,
      };

      userChallenge.points = pointsMap[challenge.difficulty];
    }

    await userChallenge.save();

    res.status(200).json({
      message: userChallenge.isCompleted
        ? "Challenge completed successfully"
        : "Daily progress completed successfully",
      completedDays,
      requiredDays: challenge.duration,
      isCompleted: userChallenge.isCompleted,
      userChallenge,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const getChallengeLeaderboard = async (req, res) => {
  try {
    const challengeId = req.params.challengeId;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        error: "challenge not found",
      });
    }

    const leaderboard = await UserChallenge.find({
      challenge: challengeId,
    })
      .sort({ points: -1, joinedAt: 1 })
      .populate("user", "name username profilePicture")
      .select("user points isCompleted completedAt");

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.user,
      points: entry.points,
      isCompleted: entry.isCompleted,
      completedAt: entry.completedAt,
    }));

    res.status(200).json({
      challenge: challenge.title,
      leaderboard: rankedLeaderboard,
    });
  } catch (error) {
    res.status(500).json({
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
  getAllChallenges,
  updateDailyProgress,
  getChallengeLeaderboard,
};
