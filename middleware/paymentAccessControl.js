// middleware/paymentAccessControl.js
const { ForbiddenError, NotFoundError } = require('../utils/errorTypes');
const jobController = require('../controllers/jobController');
const paymentController = require('../controllers/paymentController');

const paymentAccessControl = {
  /**
   * Validates if user can view job payments
   */
  canViewJobPayments: async (req, res, next) => {
    try {
      const jobId = req.params.jobId;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Admins can view all payments
      if (userRole === 'admin') {
        return next();
      }
      
      const job = await jobController.getJobById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      // Clients can only view their own job payments
      if (userRole === 'client' && job.clientId !== userId) {
        throw new ForbiddenError('You do not have permission to view these payments');
      }
      
      // Workers can only view payments for jobs they've been assigned to
      if (userRole === 'worker') {
        const isWorkerAssigned = await jobController.isWorkerAssignedToJob(userId, jobId);
        if (!isWorkerAssigned) {
          throw new ForbiddenError('You do not have permission to view these payments');
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Validates if user can view user payments
   */
  canViewUserPayments: async (req, res, next) => {
    try {
      const targetUserId = req.params.userId;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Admins can view all payments
      if (userRole === 'admin') {
        return next();
      }
      
      // Users can only view their own payments
      if (targetUserId !== userId) {
        throw new ForbiddenError('You can only view your own payments');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Validates if user can release escrow
   */
  canReleaseEscrow: async (req, res, next) => {
    try {
      const jobId = req.params.jobId;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Admins can release any escrow
      if (userRole === 'admin') {
        return next();
      }
      
      // Only job owner can release escrow
      const job = await jobController.getJobById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      if (job.clientId !== userId) {
        throw new ForbiddenError('Only the job owner can release escrow payments');
      }
      
      // Check if there is an active escrow payment
      const escrowPayment = await paymentController.getEscrowPaymentByJob(jobId);
      if (!escrowPayment) {
        throw new Error('No active escrow payment found for this job');
      }
      
      if (escrowPayment.status !== 'pending') {
        throw new Error(`Escrow payment cannot be released - current status: ${escrowPayment.status}`);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  }
};

module.exports = paymentAccessControl;