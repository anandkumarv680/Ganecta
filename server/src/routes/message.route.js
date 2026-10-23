const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  getAllConversations,
  getChatHistory,
} = require("../controllers/message.controller");

router.get("/conversations", authMiddleware, getAllConversations);
router.get("/:userId", authMiddleware, getChatHistory);

module.exports = router;
