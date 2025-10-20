const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');
const paginationMiddleware = require('../middleware/paginationMiddleware');
/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat management and messaging
 */

/**
 * @swagger
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
 * @swagger
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
 * @swagger
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
module.exports = router;
