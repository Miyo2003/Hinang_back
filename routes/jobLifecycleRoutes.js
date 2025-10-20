// routes/jobLifecycleRoutes.js
const express = require('express');
const router = express.Router();

const jobLifecycleController = require('../controllers/jobLifecycleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/:jobId/milestones',
  authMiddleware,
  roleMiddleware(['client', 'admin']),
  jobLifecycleController.createMilestone
);

router.patch('/:jobId/milestones/:milestoneId',
  authMiddleware,
  roleMiddleware(['client', 'admin']),
  jobLifecycleController.updateMilestone
);

router.get('/:jobId/milestones',
  authMiddleware,
  jobLifecycleController.listMilestones
);

router.post('/:jobId/status',
  authMiddleware,
  roleMiddleware(['client', 'admin']),
  jobLifecycleController.appendStatus
);

router.get('/:jobId/status',
  authMiddleware,
  jobLifecycleController.listStatusHistory
);

module.exports = router;