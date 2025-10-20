// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/kyc/:userId/verify',
  authMiddleware,
  roleMiddleware(['admin']),
  adminController.verifyKyc
);

router.get('/users/:userId/reputation-history',
  authMiddleware,
  roleMiddleware(['admin']),
  adminController.getReputationHistory
);

module.exports = router;