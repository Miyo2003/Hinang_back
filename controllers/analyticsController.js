// controllers/analyticsController.js
const analyticsModel = require('../models/analyticsModel');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const analyticsController = {
  topWorkers: async (_req, res) => {
    try {
      assertFeatureEnabled('analyticsDashboardEnabled');
      const workers = await analyticsModel.getTopWorkers();
      res.json({ success: true, workers });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  jobCategoryPerformance: async (_req, res) => {
    try {
      assertFeatureEnabled('analyticsDashboardEnabled');
      const categories = await analyticsModel.getJobCategoryStats();
      res.json({ success: true, categories });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  paymentVolume: async (req, res) => {
    try {
      assertFeatureEnabled('analyticsDashboardEnabled');
      const { interval = 'month' } = req.query;
      const volume = await analyticsModel.getPaymentVolume(interval);
      res.json({ success: true, volume });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
};

module.exports = analyticsController;