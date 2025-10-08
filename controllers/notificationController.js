// controllers/notificationController.js
const notificationModel = require('../models/notificationModel');

const notificationController = {
  // Create a notification (system or admin triggers this)
  create: async (req, res) => {
    try {
      const { userId, type, message, link } = req.body;

      const notification = await notificationModel.createNotification({
        userId,
        type,    // e.g. "message", "job", "payment", "system"
        message, // short text
        link,    // optional URL or resource id
        status: "unread",
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, notification });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get all notifications for logged-in user
  getMy: async (req, res) => {
    try {
      const notifications = await notificationModel.getNotificationsByUserId(req.user.id);
      res.json({ success: true, notifications });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Mark a notification as read
  markAsRead: async (req, res) => {
    try {
      const notification = await notificationModel.updateNotificationStatus(
        req.params.id,
        "read"
      );
      res.json({ success: true, notification });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Delete a notification
  delete: async (req, res) => {
    try {
      const result = await notificationModel.deleteNotificationById(req.params.id);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = notificationController;
