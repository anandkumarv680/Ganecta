const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

const {
  deleteChallenge,
  updateChallenge,
  getChallengeById,
  createChallenge,
  joinChallenge,
  getAllChallenges,
  updateDailyProgress,
  getChallengeLeaderboard,
} = require("../controllers/challenge.controller");

router.get("/", authMiddleware, getAllChallenges);
router.get("/:challengeId", authMiddleware, getChallengeById);

router.post("/", authMiddleware, createChallenge);
router.put("/:challengeId", authMiddleware, updateChallenge);
router.delete("/:challengeId", authMiddleware, deleteChallenge);

router.post("/:challengeId/join", authMiddleware, joinChallenge);
router.patch("/:challengeId/progress", authMiddleware, updateDailyProgress);

router.get(
  "/:challengeId/leaderboard",
  authMiddleware,
  getChallengeLeaderboard,
);

module.exports = router;
