const mongoose = require("mongoose");
const User = require("./user.model");

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },

  duration: {
    type: Number,
    required: true,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userChallengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Challenge",
    required: true,
  },

  joinedAt: {
    type: Date,
    default: Date.now,
  },

  dailyProgress: [
    {
      date: {
        type: Date,
        required: true,
      },

      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],

  isCompleted: {
    type: Boolean,
    default: false,
  },

  completedAt: {
    type: Date,
    default: null,
  },

  points: {
    type: Number,
    default: 0,
  },
});

userChallengeSchema.index({ user: 1, challenge: 1 }, { unique: true });

const UserChallenge = mongoose.model("UserChallenge", userChallengeSchema);
const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = {
  Challenge,
  UserChallenge,
};
