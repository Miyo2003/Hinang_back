const jobModel = require('../models/jobModel');
const notificationAPIService = require('../services/notificationAPIService');

const jobController = {
  // Create a new job (client only)
  create: async (req, res) => {
    try {
      if (req.user.role !== 'client' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only clients or admins can create jobs' });
      }

      // Validate request body
      const { jobName, jobDescription, jobType, jobArea } = req.body;
      if (!jobName || !jobDescription || !jobType || !jobArea) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: jobName, jobDescription, jobType, and jobArea are required'
        });
      }

      // Validate job type
      const validJobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
      if (!validJobTypes.includes(jobType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid job type. Must be one of: ${validJobTypes.join(', ')}`
        });
      }

      const jobData = {
        ...req.body,
        clientId: req.user.id,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      const job = await jobModel.createJob(jobData);

      // Notify workers about new job (you might want to get worker emails from a query)
      // For now, this is a placeholder - you'll need to implement logic to get relevant worker emails
      // const workerEmails = await getRelevantWorkerEmails(job); // Implement this function
      // await notificationAPIService.notifyNewJob(job, workerEmails);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        job
      });
    } catch (err) {
      console.error('Error creating job:', err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error creating job'
      });
    }
  },

  // Get all jobs (everyone)
  getAll: async (req, res) => {
    try {
      const { page, limit, sortBy, order, jobType, jobArea } = req.query;
      
      // Validate pagination parameters
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      
      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters. Page must be ≥ 1 and limit between 1 and 100'
        });
      }

      // Validate sorting parameters
      const validSortFields = ['createdAt', 'jobName', 'jobType', 'jobArea'];
      const validOrders = ['asc', 'desc'];
      
      if (sortBy && !validSortFields.includes(sortBy)) {
        return res.status(400).json({
          success: false,
          message: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`
        });
      }
      
      if (order && !validOrders.includes(order.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sort order. Must be either asc or desc'
        });
      }

      const result = await jobModel.getJobs({
        page: pageNum,
        limit: limitNum,
        sortBy,
        order: order?.toLowerCase(),
        jobType,
        jobArea
      });

      res.json({
        success: true,
        data: result.jobs,
        pagination: result.pagination
      });
    } catch (err) {
      console.error('Error getting jobs:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Error retrieving jobs'
      });
    }
  },

  // Get a job by ID
  getById: async (req, res) => {
    try {
      const job = await jobModel.getJobById(req.params.id);
      res.json({ success: true, job });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Update job (client who owns it or admin)
  update: async (req, res) => {
    try {
      if (req.user.role !== 'client' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      const job = await jobModel.updateJobById(req.params.id, req.body);
      res.json({ success: true, job });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Delete job (client/admin)
  delete: async (req, res) => {
    try {
      if (req.user.role !== 'client' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      const result = await jobModel.deleteJobById(req.params.id);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = jobController;
