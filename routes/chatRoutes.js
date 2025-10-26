const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');
const paginationMiddleware = require('../middleware/paginationMiddleware');
/**
 * @openapi
 * tags:
 *   name: Chats
 *   description: Chat management and messaging
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The chat ID
 *         participants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         lastMessage:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             sender:
 *               $ref: '#/components/schemas/User'
 *             timestamp:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /chats:
 *   post:
 *     summary: Create a chat with an initial message
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participantId
 *               - content
 *             properties:
 *               participantId:
 *                 type: string
 *                 description: ID of the user to chat with
 *               content:
 *                 type: string
 *                 description: Initial message content
 *     responses:
 *       201:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chat:
 *                   $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Invalid input or participant not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, chatController.createChat);

/**
 * @openapi
 * /chats/my:
 *   get:
 *     summary: Get all chats for logged-in user
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chats:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my', authMiddleware, paginationMiddleware(), chatController.getMyChats);

/**
 * @openapi
 * /chats/{chatId}/messages:
 *   post:
 *     summary: Send a message in a chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat to send message in
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
 *                 description: Text content of the message
 *               subject:
 *                 type: string
 *                 description: Optional subject/title for the message
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *                     name:
 *                       type: string
 *               replyTo:
 *                 type: string
 *                 description: ID of the message to reply to
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date for the message
 *               mentions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User IDs mentioned in the message
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Hashtags in the message
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not a member of this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.post('/:chatId/messages', authMiddleware, require('../controllers/messageController').sendMessage);

/**
 * @openapi
 * /chats/{chatId}/messages:
 *   get:
 *     summary: Get chat conversation
 *     description: Retrieve messages from a chat conversation with pagination
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat to get messages from
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of messages to return
 *       - name: before
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages before this timestamp
 *     responses:
 *       200:
 *         description: Chat messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 hasMore:
 *                   type: boolean
 *                   description: Whether there are more messages to load
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not a member of this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.get('/:chatId/messages', authMiddleware, require('../controllers/messageController').getConversation);

module.exports = router;
