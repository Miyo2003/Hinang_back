// routes/meetingRoutes.js
const express = require('express');
const router = express.Router();

const meetingController = require('../controllers/meetingController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/suggest', authMiddleware, meetingController.suggestSlots);
router.post('/:meetingId/confirm', authMiddleware, meetingController.confirmMeeting);

module.exports = router;