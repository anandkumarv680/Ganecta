const Notification = require('../models/notification.model');

const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    throw new Error('Error creating notification: ' + error.message);
  }
};


module.exports = {createNotification};