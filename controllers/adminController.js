// controllers/adminController.js
const userModel = require('../models/userModel');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const adminController = {
  verifyKyc: async (req, res) => {
    try {
      assertFeatureEnabled('kycEnabled');
      const { userId } = req.params;
      const { status, notes } = req.body;

      if (!['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid KYC status' });
      }

      const user = await userModel.updateKycStatus(userId, status, req.user.id, notes);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, user });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  getReputationHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      const history = await userModel.getReputationHistory(userId);
      res.json({ success: true, history });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }
};

module.exports = adminController;