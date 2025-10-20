// controllers/jobLifecycleController.js
const jobLifecycleModel = require('../models/jobLifecycleModel');
const { assertFeatureEnabled } = require('../utils/featureToggle');
const { queueNotification } = require('../services/notificationDispatcher');

const jobLifecycleController = {
  createMilestone: async (req, res) => {
    try {
      assertFeatureEnabled('milestonesEnabled');

      const { jobId } = req.params;
      const { title, dueDate, notes } = req.body;

      if (!title || !dueDate) {
        return res.status(400).json({ success: false, message: 'Title and dueDate are required' });
      }

      const milestone = await jobLifecycleModel.createMilestone(jobId, {
        title,
        dueDate,
        notes,
        status: 'pending',
        createdBy: req.user.id,
        createdAt: new Date().toISOString()
      });

      queueNotification({
        userId: milestone.assignedWorkerId,
        type: 'milestone',
        message: `New milestone "${title}" assigned`,
        link: `/jobs/${jobId}`
      });

      res.status(201).json({ success: true, milestone });
    } catch (err) {
      console.error('Error creating milestone:', err);
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  updateMilestone: async (req, res) => {
    try {
      assertFeatureEnabled('milestonesEnabled');

      const { jobId, milestoneId } = req.params;
      const updates = {
        ...req.body,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id
      };

      const milestone = await jobLifecycleModel.updateMilestone(jobId, milestoneId, updates);
      if (!milestone) {
        return res.status(404).json({ success: false, message: 'Milestone not found' });
      }

      if (updates.status === 'completed') {
        queueNotification({
          userId: milestone.clientId,
          type: 'milestone',
          message: `Milestone "${milestone.title}" completed`,
          link: `/jobs/${jobId}`
        });
      }

      res.json({ success: true, milestone });
    } catch (err) {
      console.error('Error updating milestone:', err);
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  listMilestones: async (req, res) => {
    try {
      assertFeatureEnabled('milestonesEnabled');

      const milestones = await jobLifecycleModel.listMilestones(req.params.jobId);
      res.json({ success: true, milestones });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  appendStatus: async (req, res) => {
    try {
      assertFeatureEnabled('milestonesEnabled');

      const { jobId } = req.params;
      const { status, reason } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const statusRecord = await jobLifecycleModel.appendStatusHistory(jobId, {
        status,
        reason,
        changedBy: req.user.id,
        changedAt: new Date().toISOString()
      });

      res.status(201).json({ success: true, status: statusRecord });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  listStatusHistory: async (req, res) => {
    try {
      assertFeatureEnabled('milestonesEnabled');

      const history = await jobLifecycleModel.listStatusHistory(req.params.jobId);
      res.json({ success: true, history });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
};

module.exports = jobLifecycleController;