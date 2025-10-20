// middleware/ownershipMiddleware.js
const { ForbiddenError } = require('./errorHandler');
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');

const ownershipMiddleware = {
  /**
   * Validates that the authenticated user owns the job or is an admin
   */
  validateJobOwnership: async (req, res, next) => {
    try {
      const jobId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Admins can modify any job
      if (userRole === 'admin') {
        return next();
      }
      
      const job = await jobController.getJobById(jobId);
      
      if (!job) {
        throw new Error('Job not found');
      }
      
      if (job.clientId !== userId) {
        throw new ForbiddenError('You do not have permission to modify this job');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Validates that the authenticated user owns the application or has appropriate permissions
   */
  validateApplicationOwnership: async (req, res, next) => {
    try {
      const applicationId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Admins can access any application
      if (userRole === 'admin') {
        return next();
      }
      
      const application = await applicationController.getApplicationById(applicationId);
      
      if (!application) {
        throw new Error('Application not found');
      }
      
      // Workers can only access their own applications
      if (userRole === 'worker' && application.workerId !== userId) {
        throw new ForbiddenError('You do not have permission to access this application');
      }
      
      // Clients can only access applications for their jobs
      if (userRole === 'client') {
        const job = await jobController.getJobById(application.jobId);
        if (!job || job.clientId !== userId) {
          throw new ForbiddenError('You do not have permission to access this application');
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Validates that a worker can apply to a job
   */
  validateCanApply: async (req, res, next) => {
    try {
      const jobId = req.body.jobId;
      const userId = req.user.id;
      
      const job = await jobController.getJobById(jobId);
      
      if (!job) {
        throw new Error('Job not found');
      }
      
      // Check if job is open for applications
      if (job.status !== 'open') {
        throw new ForbiddenError('This job is not accepting applications');
      }
      
      // Check if worker has already applied
      const existingApplication = await applicationController.getApplicationByJobAndWorker(jobId, userId);
      if (existingApplication) {
        throw new ForbiddenError('You have already applied to this job');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ownershipMiddleware;