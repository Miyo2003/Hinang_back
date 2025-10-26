const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const featureMiddleware = require('../middleware/featureMiddleware');
/**
 * @openapi
 * tags:
 *   name: Payments
 *   description: Payment processing and escrow management
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - amount
 *         - currency
 *         - jobId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the payment
 *         amount:
 *           type: number
 *           description: Payment amount
 *           minimum: 0.01
 *         currency:
 *           type: string
 *           description: Payment currency (3-letter code)
 *           example: USD
 *         jobId:
 *           type: string
 *           description: ID of the associated job
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, refunded]
 *           default: pending
 *         paymentMethod:
 *           type: string
 *           enum: [card, bank_transfer, wallet]
 *         paymentProvider:
 *           type: string
 *           enum: [stripe, mongopay]
 *         escrow:
 *           type: boolean
 *           description: Whether this is an escrow payment
 *         metadata:
 *           type: object
 *           description: Additional payment details
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/',
  authMiddleware,
  roleMiddleware(['client', 'admin']),
  validationMiddleware.validate(validationMiddleware.paymentSchema),
  paymentController.create
);

/**
 * @openapi
 * /api/payments/job/{jobId}:
 *   get:
 *     summary: Get payments for a specific job
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of payments for the job
 */
router.get('/job/:jobId',
  authMiddleware,
  validationMiddleware.validate(validationMiddleware.jobIdSchema),
  paymentController.getByJob
);

/**
 * @openapi
 * /api/payments/user/{userId}:
 *   get:
 *     summary: Get payments for a specific user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's payments
 */
router.get('/user/:userId',
  authMiddleware,
  validationMiddleware.validate(validationMiddleware.userIdSchema),
  paymentController.getByUser
);

/**
 * @openapi
 * /api/payments/{id}/status:
 *   put:
 *     summary: Update payment status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, failed, refunded]
 *     responses:
 *       200:
 *         description: Payment status updated
 */
router.put('/:id/status',
  authMiddleware,
  roleMiddleware(['client', 'admin']),
  validationMiddleware.validate(validationMiddleware.paymentStatusSchema),
  paymentController.updateStatus
);

/**
 * @openapi
 * /api/payments/escrow:
 *   post:
 *     summary: Create an escrow payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - amount
 *               - currency
 *     responses:
 *       201:
 *         description: Escrow payment created
 */
router.post('/escrow',
  authMiddleware,
  roleMiddleware(['client', 'admin']),
  featureMiddleware('escrowEnabled'),
  validationMiddleware.validate(validationMiddleware.escrowPaymentSchema),
  paymentController.createEscrowPayment
);

/**
 * @openapi
 * /api/payments/escrow/{jobId}/release:
 *   post:
 *     summary: Release escrow payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Escrow payment released
 */
router.post('/escrow/:jobId/release',
  authMiddleware,
  roleMiddleware(['client', 'admin']),
  featureMiddleware('escrowEnabled'),
  validationMiddleware.validate(validationMiddleware.jobIdSchema),
  paymentController.releaseEscrow
);

/**
 * @openapi
 * /api/payments/escrow/{jobId}/refund:
 *   post:
 *     summary: Refund escrow payment (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Escrow payment refunded
 */
router.post('/escrow/:jobId/refund',
  authMiddleware,
  roleMiddleware(['admin']),
  featureMiddleware('escrowEnabled'),
  validationMiddleware.validate(validationMiddleware.jobIdSchema),
  paymentController.refundEscrow
);

// Webhook endpoints — raw body already parsed in index.js
/**
 * @openapi
 * /api/payments/webhook/mongopay:
 *   post:
 *     summary: Handle Mongopay webhook events
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook/mongopay', paymentController.handleMongopayWebhook);

/**
 * @openapi
 * /api/payments/webhook/stripe:
 *   post:
 *     summary: Handle Stripe webhook events
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/webhook/stripe', paymentController.handleStripeWebhook);

module.exports = router;