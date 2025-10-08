const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Create a report - any authenticated user can report
router.post('/', 
    authMiddleware,
    reportController.createReport
);

// Moderate a report - admin only
router.put('/:reportId/moderate',
    authMiddleware,
    roleMiddleware(['admin']), // Ensure user is admin
    reportController.moderateReport
);

module.exports = router;