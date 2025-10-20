// routes/presenceRoutes.js
const express = require('express');
const router = express.Router();

const presenceService = require('../services/presenceService');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/snapshot', authMiddleware, async (_req, res) => {
  try {
    const snapshot = await presenceService.getPresenceSnapshot();
    res.json({ success: true, snapshot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;