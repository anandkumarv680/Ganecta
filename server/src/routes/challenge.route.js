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
} = require("../controllers/challenge.controller");

router.get("/", getAllChallenges);
router.get("/:challengeId", getChallengeById);

router.put("/:challengeId", authMiddleware, updateChallenge);
router.delete("/:challengeId", authMiddleware, deleteChallenge);

router.post("/", authMiddleware, createChallenge);
router.post("/:challengeId/join", authMiddleware, joinChallenge);

module.exports = router;
