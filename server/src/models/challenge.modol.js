// const mongoose = require("mongoose");

// const challengeSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   difficulty: {
//     type: String,
//     enum: ["Easy", "Medium", "Hard"],
//     required: true,
//   },
//   duration: {
//     type: Number,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   taskDone: {
//     type: Boolean,
//     default: false,
//   },
//   leaderboard: [
//     {
//       user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       score: {
//         type: Number,
//         required: true,
//       },
//       streak: {
//         type: Number,
//         default: 0,
//       },
//     },
//   ],
// });

// const Challenge = mongoose.model("Challenge", challengeSchema);

// module.exports = Challenge;
