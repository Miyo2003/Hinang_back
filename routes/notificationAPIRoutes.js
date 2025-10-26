const express = require('express');
const router = express.Router();
const notificationAPIController = require('../controllers/notificationAPIController');
const { authenticate } = require('../middleware/authMiddleware');

// Send custom notification
router.post('/send', authenticate, notificationAPIController.sendCustomNotification);

// Send reminder
router.post('/reminder', authenticate, notificationAPIController.sendReminder);

module.exports = router;
