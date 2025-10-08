const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /chats:
 *   post:
 *     summary: Create a chat with an initial message
 *     tags:
 *       - Chats
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
 *       200:
 *         description: Chat created successfully
 */
router.post('/', authMiddleware, chatController.createChat);

/**
 * @openapi
 * /chats/my:
 *   get:
 *     summary: Get all chats for logged-in user
 *     tags:
 *       - Chats
 *     responses:
 *       200:
 *         description: List of chats
 */
router.get('/my', authMiddleware, chatController.getMyChats);

module.exports = router;
