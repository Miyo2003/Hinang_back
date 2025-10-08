const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /messages:
 *   post:
 *     summary: Send a message to another user
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID of the user to receive the message
 *               content:
 *                 type: string
 *                 description: Content of the message
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the created message
 *                 content:
 *                   type: string
 *                   description: Content of the message
 *                 senderId:
 *                   type: string
 *                   description: ID of the sender
 *                 receiverId:
 *                   type: string
 *                   description: ID of the receiver
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Receiver not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, messageController.send);

/**
 * @openapi
 * /messages/conversation/{userId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to get conversation with
 *     responses:
 *       200:
 *         description: List of messages in the conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Message ID
 *                   content:
 *                     type: string
 *                     description: Message content
 *                   senderId:
 *                     type: string
 *                     description: ID of the sender
 *                   receiverId:
 *                     type: string
 *                     description: ID of the receiver
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/conversation/:userId', authMiddleware, messageController.getConversation);

/**
 * @openapi
 * /messages/my:
 *   get:
 *     summary: Get all chats for logged-in user
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: ID of the other user in the chat
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       content:
 *                         type: string
 *                         description: Content of the last message
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                   unreadCount:
 *                     type: integer
 *                     description: Number of unread messages
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/my', authMiddleware, messageController.getUserChats);

/**
 * @openapi
 * /messages/{id}:
 *   put:
 *     summary: Edit a message
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: New content of the message
 *     responses:
 *       200:
 *         description: Message updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Message ID
 *                 content:
 *                   type: string
 *                   description: Updated message content
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Can only edit your own messages
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, messageController.updateMessage);

/**
 * @openapi
 * /messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message deleted successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Can only delete your own messages
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, messageController.deleteMessage);

module.exports = router;
