const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /payments:
 *   post:
 *     summary: Create a new payment (client/admin only)
 *     tags:
 *       - Payments
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
 *             properties:
 *               jobId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment created
 */
router.post('/', authMiddleware, roleMiddleware(['client', 'admin']), paymentController.create);

/**
 * @openapi
 * /payments/job/{jobId}:
 *   get:
 *     summary: Get payments for a job
 *     tags:
 *       - Payments
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
 *         description: List of payments
 */
router.get('/job/:jobId', authMiddleware, paymentController.getByJob);

/**
 * @openapi
 * /payments/user/{userId}:
 *   get:
 *     summary: Get payments for a user
 *     tags:
 *       - Payments
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
 *         description: List of payments
 */
router.get('/user/:userId', authMiddleware, paymentController.getByUser);

/**
 * @openapi
 * /payments/{id}/status:
 *   put:
 *     summary: Update payment status (client/admin only)
 *     tags:
 *       - Payments
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
 *     responses:
 *       200:
 *         description: Payment status updated
 */
router.put('/:id/status', authMiddleware, roleMiddleware(['client', 'admin']), paymentController.updateStatus);

module.exports = router;
