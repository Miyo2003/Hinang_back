const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /notifications:
 *   post:
 *     summary: Create a notification
 *     description: Create a new notification for a specific user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - userId
 *             properties:
 *               message:
 *                 type: string
 *                 description: The notification message
 *               userId:
 *                 type: string
 *                 description: ID of the user to receive the notification
 *               type:
 *                 type: string
 *                 description: Type of notification (e.g., 'message', 'job', 'review')
 *                 enum: [message, job, review, system]
 *                 default: system
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Notification ID
 *                 message:
 *                   type: string
 *                   description: Notification message
 *                 type:
 *                   type: string
 *                   description: Type of notification
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to create notifications
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, notificationController.create);

/**
 * @openapi
 * /notifications/my:
 *   get:
 *     summary: Get my notifications
 *     description: Retrieve all notifications for the authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: unreadOnly
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter to show only unread notifications
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [message, job, review, system]
 *         description: Filter notifications by type
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of notifications to return
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Notification ID
 *                   message:
 *                     type: string
 *                     description: Notification message
 *                   type:
 *                     type: string
 *                     description: Type of notification
 *                   read:
 *                     type: boolean
 *                     description: Whether the notification has been read
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/my', authMiddleware, notificationController.getMy);

/**
 * @openapi
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to mark as read
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Notification ID
 *                 read:
 *                   type: boolean
 *                   description: New read status (true)
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Can only mark your own notifications as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Delete a specific notification
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the notification to delete
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification deleted successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Can only delete your own notifications
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, notificationController.delete);

module.exports = router;
