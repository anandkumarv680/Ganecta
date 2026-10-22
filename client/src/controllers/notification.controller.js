const Notification = require("../models/notification.model");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      receiver: userId,
    })
      .populate("sender", "name username profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      receiver: userId,
    });

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      receiver: userId,
    });

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification };
