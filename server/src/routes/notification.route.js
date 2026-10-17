const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
  getNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

router.get("/", authMiddleware, getNotifications);
router.patch("/:notificationId/read", authMiddleware, markAsRead);
router.delete("/:notificationId", authMiddleware, deleteNotification);

module.exports = router;
