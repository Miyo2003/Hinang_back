const notificationAPIService = require('../services/notificationAPIService');

const notificationAPIController = {
  // Send a custom notification
  sendCustomNotification: async (req, res) => {
    try {
      const { type, to, email, inapp, mobile_push } = req.body;

      if (!type || !to || !to.email) {
        return res.status(400).json({
          success: false,
          message: 'Type, recipient email are required'
        });
      }

      const result = await notificationAPIService.sendNotification(type, to, email, inapp, mobile_push);
      res.json({ success: true, result });
    } catch (err) {
      console.error('Error sending custom notification:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Send reminder notification
  sendReminder: async (req, res) => {
    try {
      const { userEmail, message } = req.body;

      if (!userEmail || !message) {
        return res.status(400).json({
          success: false,
          message: 'User email and message are required'
        });
      }

      await notificationAPIService.sendReminder(userEmail, message);
      res.json({ success: true, message: 'Reminder sent successfully' });
    } catch (err) {
      console.error('Error sending reminder:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = notificationAPIController;
