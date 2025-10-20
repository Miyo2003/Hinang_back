// controllers/paymentController.js
const crypto = require('crypto');
const paymentModel = require('../models/paymentModel');

// Initialize Stripe only if API key is available
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('Warning: Stripe API key not configured. Stripe payments will be unavailable.');
  stripe = {
    webhooks: {
      constructEvent: () => {
        throw new Error('Stripe not configured');
      }
    }
  };
}
const walletModel = require('../models/walletModel');
const { assertFeatureEnabled } = require('../utils/featureToggle');
const { queueNotification } = require('../services/notificationDispatcher');

// Mongopay IP whitelist (from docs or env)
const MONGOPAY_IPS = process.env.MONGOPAY_IPS ? process.env.MONGOPAY_IPS.split(',') : ['192.168.1.1']; // Placeholder

const paymentController = {
  create: async (req, res) => {
    try {
      const { jobId, workerId, amount, method } = req.body;
      if (!jobId || !workerId || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Job ID, Worker ID, and positive amount required' });
      }

      const payment = await paymentModel.createPayment({
        jobId,
        workerId,
        clientId: req.user.id,
        amount,
        method,
        status: 'pending'
      });

      res.json({ success: true, payment });
    } catch (err) {
      console.error('Error creating payment:', err);
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
      const { status } = req.body;
      const id = req.params.id;

      if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const payment = await paymentModel.updatePaymentStatus(id, status);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found' });
      }

      res.json({ success: true, payment });
    } catch (err) {
      console.error('Error updating payment status:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  createEscrowPayment: async (req, res) => {
    try {
      assertFeatureEnabled('escrowEnabled');

      const { jobId, paymentId } = req.body;
      const payment = await paymentModel.createEscrowPayment({
        jobId,
        paymentId,
        clientId: req.user.id,
        createdAt: new Date().toISOString()
      });

      queueNotification({
        userId: payment.workerId,
        type: 'payment',
        message: `Escrow funded for job ${jobId}`,
        link: `/jobs/${jobId}`
      });

      res.status(201).json({ success: true, payment });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  releaseEscrow: async (req, res) => {
    try {
      assertFeatureEnabled('escrowEnabled');

      const { jobId } = req.params;
      const { escrowId } = req.body;

      const release = await paymentModel.releaseEscrow({
        jobId,
        escrowId,
        releasedBy: req.user.id,
        releasedAt: new Date().toISOString()
      });

      if (!release) {
        return res.status(404).json({ success: false, message: 'Escrow not found' });
      }

      queueNotification({
        userId: release.workerId,
        type: 'payment',
        message: `Escrow released for job ${jobId}`,
        link: `/jobs/${jobId}`
      });

      res.json({ success: true, release });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  refundEscrow: async (req, res) => {
    try {
      assertFeatureEnabled('escrowEnabled');

      const { jobId } = req.params;
      const { escrowId, reason } = req.body;

      const refund = await paymentModel.refundEscrow({
        jobId,
        escrowId,
        refundedBy: req.user.id,
        refundedAt: new Date().toISOString(),
        reason
      });

      if (!refund) {
        return res.status(404).json({ success: false, message: 'Escrow not found or already refunded' });
      }

      queueNotification({
        userId: refund.clientId,
        type: 'payment',
        message: `Escrow refunded for job ${jobId}`,
        link: `/jobs/${jobId}`
      });

      res.json({ success: true, refund });
    } catch (err) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  },

  // === Webhook handlers (raw body) ===

  handleMongopayWebhook: async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!MONGOPAY_IPS.includes(ip)) {
      return res.status(403).json({ error: 'Invalid IP address' });
    }

    const payload = req.body;
    const signature = req.headers['x-mongopay-signature'];
    const secret = process.env.MONGOPAY_WEBHOOK_SECRET;

    if (!secret) {
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { payment_id: paymentId, status } = payload;

    if (!paymentId || !['completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    try {
      const payment = await paymentModel.updatePaymentStatus(paymentId, status);
      if (payment) {
        queueNotification({
          userId: payment.workerId,
          type: 'payment',
          message: `Payment of $${payment.amount} ${status}`,
          link: `/jobs/${payment.jobId}`
        });
        if (payment.clientId !== payment.workerId) {
          queueNotification({
            userId: payment.clientId,
            type: 'payment',
            message: `Payment to worker ${payment.workerId} ${status}`,
            link: `/jobs/${payment.jobId}`
          });
        }
      }
      res.sendStatus(200);
    } catch (err) {
      console.error('Webhook processing failed:', err);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  },

  handleStripeWebhook: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const paymentId = paymentIntent.metadata?.paymentId;
      if (paymentId) {
        const payment = await paymentModel.updatePaymentStatus(paymentId, 'completed');
        if (payment) {
          queueNotification({
            userId: payment.workerId,
            type: 'payment',
            message: `Stripe payment of $${payment.amount} completed`,
            link: `/jobs/${payment.jobId}`
          });
        }
      }
    }

    res.sendStatus(200);
  }
};

module.exports = paymentController;