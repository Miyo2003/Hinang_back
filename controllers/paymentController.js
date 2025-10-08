// controllers/paymentController.js
const paymentModel = require('../models/paymentModel');

const paymentController = {
  create: async (req, res) => {
    try {
      const { jobId, workerId, amount, method } = req.body;

      const payment = await paymentModel.createPayment({
        jobId,
        workerId,
        clientId: req.user.id,
        amount,
        method,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, payment });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getByJob: async (req, res) => {
    try {
      const payments = await paymentModel.getPaymentsByJobId(req.params.jobId);
      res.json({ success: true, payments });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getByUser: async (req, res) => {
    try {
      const payments = await paymentModel.getPaymentsByUserId(req.params.userId);
      res.json({ success: true, payments });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { status } = req.body; // e.g., "completed", "failed"
      const payment = await paymentModel.updatePaymentStatus(req.params.id, status);
      res.json({ success: true, payment });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = paymentController;
