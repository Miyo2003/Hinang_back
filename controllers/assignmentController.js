// controllers/assignmentController.js
const assignmentModel = require('../models/assignmentModel');
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');
const notificationAPIService = require('../services/notificationAPIService');
const { assertFeatureEnabled } = require('../utils/featureToggle');
const { queueNotification } = require('../services/notificationDispatcher');

const assignmentController = {
  assignWorker: async (req, res) => {
    try {
      const { jobId, workerId } = req.body;
      if (!jobId || !workerId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID and Worker ID are required'
        });
      }

      if (!['client', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only clients and admins can assign workers to jobs'
        });
      }

      const assignment = await assignmentModel.assignWorkerToJob(workerId, jobId);

      // Notify worker and client about assignment
      const job = await jobModel.getJobById(jobId);
      const worker = await userModel.getUserById(workerId);
      const client = await userModel.getUserById(req.user.id);

      await notificationAPIService.notifyAssignment(job, worker.email, client.username || client.email);
      await notificationAPIService.notifyClientAssignment(job, client.email, worker.username || worker.email);

      res.json({ success: true, assignment });
    } catch (err) {
      console.error('Error in assignWorker:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  inviteWorker: async (req, res) => {
    try {
      assertFeatureEnabled('assignmentInvitesEnabled');

      const { jobId, workerId, expiresAt } = req.body;
      if (!jobId || !workerId) {
        return res.status(400).json({ success: false, message: 'Job ID and Worker ID required' });
      }

      const invite = await assignmentModel.createInvite({
        jobId,
        workerId,
        invitedBy: req.user.id,
        invitedAt: new Date().toISOString(),
        expiresAt
      });

      queueNotification({
        userId: workerId,
        type: 'assignment',
        message: `You have been invited to job ${jobId}`,
        link: `/jobs/${jobId}`
      });

      res.status(201).json({ success: true, invite });
    } catch (err) {
      console.error('Error inviting worker:', err);
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  respondInvite: async (req, res) => {
    try {
      assertFeatureEnabled('assignmentInvitesEnabled');

      const { jobId } = req.params;
      const { inviteId, response } = req.body;

      if (!['accepted', 'declined'].includes(response)) {
        return res.status(400).json({ success: false, message: 'Invalid response' });
      }

      const result = await assignmentModel.respondToInvite({
        jobId,
        inviteId,
        workerId: req.user.id,
        response,
        respondedAt: new Date().toISOString()
      });

      if (!result) {
        return res.status(404).json({ success: false, message: 'Invite not found or expired' });
      }

      queueNotification({
        userId: result.clientId,
        type: 'assignment',
        message: `Worker ${req.user.id} has ${response} the invitation`,
        link: `/jobs/${jobId}`
      });

      res.json({ success: true, result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  listInvitesForJob: async (req, res) => {
    try {
      assertFeatureEnabled('assignmentInvitesEnabled');
      const invites = await assignmentModel.listInvitesForJob(req.params.jobId);
      res.json({ success: true, invites });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  revokeInvite: async (req, res) => {
    try {
      assertFeatureEnabled('assignmentInvitesEnabled');
      const { jobId } = req.params;
      const { inviteId } = req.body;

      const result = await assignmentModel.revokeInvite({ jobId, inviteId, revokedBy: req.user.id, revokedAt: new Date().toISOString() });

      if (!result) {
        return res.status(404).json({ success: false, message: 'Invite not found' });
      }

      queueNotification({
        userId: result.workerId,
        type: 'assignment',
        message: `Your invitation to job ${jobId} has been revoked`,
        link: `/jobs/${jobId}`
      });

      res.json({ success: true, result });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  getWorkersByJob: async (req, res) => {
    try {
      const { jobId } = req.params;
      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required'
        });
      }

      const workers = await assignmentModel.getWorkersForJob(jobId);
      res.json({ success: true, workers });
    } catch (err) {
      console.error('Error in getWorkersByJob:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getJobsByWorker: async (req, res) => {
    try {
      const { workerId } = req.params;

      if (!workerId) {
        return res.status(400).json({
          success: false,
          message: 'Worker ID is required'
        });
      }

      if (req.user.role !== 'admin' && req.user.id !== workerId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these assignments'
        });
      }

      const jobs = await assignmentModel.getJobsForWorker(workerId);
      res.json({ success: true, jobs });
    } catch (err) {
      console.error('Error in getJobsByWorker:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  deleteAssignment: async (req, res) => {
    try {
      const { jobId, workerId } = req.params;

      if (!jobId || !workerId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID and Worker ID are required'
        });
      }

      if (!['client', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only clients and admins can remove worker assignments'
        });
      }

      const result = await assignmentModel.deleteAssignment(workerId, jobId);
      res.json({ success: true, result });
    } catch (err) {
      console.error('Error in deleteAssignment:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = assignmentController;