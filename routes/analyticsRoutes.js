// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/workers/top', roleMiddleware(['admin']), analyticsController.topWorkers);
router.get('/jobs/categories', roleMiddleware(['admin']), analyticsController.jobCategoryPerformance);
router.get('/payments/volume', roleMiddleware(['admin']), analyticsController.paymentVolume);

module.exports = router;