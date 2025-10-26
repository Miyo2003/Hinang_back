const applicationModel = require('../models/applicationModel');
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');
const notificationAPIService = require('../services/notificationAPIService');
const logger = require('../utils/logger');

const applicationController = {
  apply: async (req, res) => {
    try {
      const { jobId } = req.body;
      if (!jobId) {
        return res.status(400).json({ success: false, message: 'JobId is required' });
      }

      // Verify user is a worker
      if (req.user.role !== 'worker') {
        return res.status(403).json({ success: false, message: 'Only workers can apply to jobs' });
      }

      const application = await applicationModel.applyToJob(req.user.id, jobId);

      // Notify client about new application
      const job = await jobModel.getJobById(jobId);
      const worker = await userModel.getUserById(req.user.id);
      const client = await userModel.getUserById(job.clientId);

      await notificationAPIService.notifyJobApplication(job, client.email, worker.username || worker.email);

      res.json({ success: true, application });
    } catch (err) {
      console.error('Error in apply:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getByJob: async (req, res) => {
    try {
      const { jobId } = req.params;
      if (!jobId) {
        return res.status(400).json({ success: false, message: 'JobId is required' });
      }

      const applications = await applicationModel.getApplicationsByJobId(jobId);
      res.json({ success: true, applications });
    } catch (err) {
      console.error('Error in getByJob:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getByWorker: async (req, res) => {
    try {
      const { workerId } = req.params;
      if (!workerId) {
        return res.status(400).json({ success: false, message: 'WorkerId is required' });
      }

      // Users can only view their own applications unless they're admin
      if (req.user.role !== 'admin' && req.user.id !== workerId) {
        return res.status(403).json({ success: false, message: 'Not authorized to view these applications' });
      }

      const applications = await applicationModel.getApplicationsByWorkerId(workerId);
      res.json({ success: true, applications });
    } catch (err) {
      console.error('Error in getByWorker:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || !status) {
        return res.status(400).json({ success: false, message: 'Application ID and status are required' });
      }

      if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status. Must be pending, accepted, or rejected' });
      }

      const application = await applicationModel.updateApplicationStatus(id, status);
      res.json({ success: true, application });
    } catch (err) {
      console.error('Error in updateStatus:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Application ID is required' });
      }

      const result = await applicationModel.deleteApplication(id);
      res.json({ success: true, result });
    } catch (err) {
      console.error('Error in delete:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = applicationController;
