const assignmentModel = require('../models/assignmentModel');

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

      // Verify user is a client or admin
      if (!['client', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only clients and admins can assign workers to jobs'
        });
      }

      const assignment = await assignmentModel.assignWorkerToJob(workerId, jobId);
      res.json({ success: true, assignment });
    } catch (err) {
      console.error('Error in assignWorker:', err);
      res.status(500).json({ success: false, message: err.message });
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

      // Users can only view their own assignments unless they're admin
      if (req.user.role !== 'admin' && req.user.id !== workerId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these assignments'
        });
      }

      try {
        const jobs = await assignmentModel.getJobsForWorker(workerId);
        res.json({ success: true, jobs });
      } catch (err) {
        if (err.message.includes('not found')) {
          return res.status(404).json({
            success: false,
            message: err.message
          });
        }
        throw err;
      }
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

      // Verify user is a client or admin
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
