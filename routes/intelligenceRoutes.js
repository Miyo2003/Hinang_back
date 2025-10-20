// routes/intelligenceRoutes.js
const express = require('express');
const router = express.Router();

const intelligenceController = require('../controllers/intelligenceController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/auto-match/:jobId', roleMiddleware(['client', 'admin']), intelligenceController.autoMatch);
router.get('/predictive-timeline/:jobId', roleMiddleware(['client', 'admin']), intelligenceController.predictiveTimeline);
router.get('/dispute-workflow', intelligenceController.disputeWorkflow);
router.get('/skill-gap/:workerId', roleMiddleware(['worker', 'admin']), intelligenceController.skillGap);
router.get('/dynamic-pricing/:jobId', roleMiddleware(['client', 'admin']), intelligenceController.dynamicPricing);
router.post('/fraud-check/:paymentId', roleMiddleware(['admin']), intelligenceController.fraudCheck);
router.get('/offline-sync', intelligenceController.offlineSync);
router.get('/achievement-journey/:userId', intelligenceController.achievementJourney);
router.patch('/profile', intelligenceController.updateProfile);
router.get('/recommendations', intelligenceController.recommendations);

module.exports = router;