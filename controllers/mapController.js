// controllers/mapController.js
const mapModel = require('../models/mapModel');

const mapController = {
  // Set a job location (client/admin)
  setJobLocation: async (req, res) => {
    try {
      const { jobId, latitude, longitude } = req.body;
      const location = await mapModel.addJobLocation(jobId, latitude, longitude, '');
      res.json({ success: true, location });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get location of a specific job
  getJobLocation: async (req, res) => {
    try {
      const location = await mapModel.getJobLocationById(req.params.jobId);
      res.json({ success: true, location });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Find nearby jobs for workers (radius in km)
  getNearbyJobs: async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      const jobs = await mapModel.getJobsNearLocation(parseFloat(lat), parseFloat(lng), parseFloat(radius) || 5);
      res.json({ success: true, jobs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = mapController;
