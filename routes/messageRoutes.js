const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @openapi
 * tags:
 *   name: Messages
 *   description: Chat messages management
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the message
 *         chatId:
 *           type: string
 *           description: The ID of the chat this message belongs to
 *         senderId:
 *           type: string
 *           description: The ID of the user who sent the message
 *         content:
 *           type: string
 *           description: The text content of the message
 *         subject:
 *           type: string
 *           description: Optional subject/title for the message
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *               name:
 *                 type: string
 *         read:
 *           type: boolean
 *           description: Whether the message has been read
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: When the message was read
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the message was sent
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the message was last updated
 */

/**
 * @openapi
 * /messages/{chatId}:
 *   post:
 *     summary: Send a new message
 *     description: Send a new message in a chat conversation
 *     tags: [Messages]
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
router.post('/:chatId', authMiddleware, messageController.sendMessage);

/**
 * @openapi
 * /messages/{chatId}:
 *   get:
 *     summary: Get chat conversation
 *     description: Retrieve messages from a chat conversation with pagination
 *     tags: [Messages]
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
router.get('/:chatId', authMiddleware, messageController.getConversation);

/**
 * @openapi
 * /messages/{chatId}/search:
 *   get:
 *     summary: Search chat messages
 *     description: Search for messages in a chat conversation by text content
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat to search in
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query text
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of messages to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
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
 *                 total:
 *                   type: integer
 *                   description: Total number of matching messages
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not a member of this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.get('/:chatId/search', authMiddleware, messageController.searchMessages);

/**
 * @openapi
 * /messages/{chatId}/upload-url:
 *   post:
 *     summary: Generate upload URL for attachments
 *     description: Generate a pre-signed URL for uploading file attachments
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat the attachment will be sent in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - fileType
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Name of the file to upload
 *               fileType:
 *                 type: string
 *                 description: MIME type of the file
 *     responses:
 *       200:
 *         description: Upload URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 uploadUrl:
 *                   type: string
 *                   description: Pre-signed URL for uploading
 *                 attachmentUrl:
 *                   type: string
 *                   description: URL where the file will be accessible after upload
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not a member of this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.post('/:chatId/upload-url', authMiddleware, messageController.generateUploadUrl);

/**
 * @openapi
 * /messages/read/{messageId}:
 *   post:
 *     summary: Mark message as read
 *     description: Mark a specific message as read by the current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to mark as read
 *     responses:
 *       200:
 *         description: Message marked as read successfully
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
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not a recipient of this message
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.post('/read/:messageId', authMiddleware, messageController.markAsRead);

/**
 * @openapi
 * /messages/subject/{messageId}:
 *   patch:
 *     summary: Update message subject
 *     description: Update the subject/title of a message (sender only)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the message to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *             properties:
 *               subject:
 *                 type: string
 *                 description: New subject/title for the message
 *     responses:
 *       200:
 *         description: Message subject updated successfully
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
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Only message sender can update subject
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.patch('/subject/:messageId', authMiddleware, messageController.updateSubject);

/**
 * @openapi
 * /messages/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     description: Delete a message from a chat (sender only)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: messageId
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Message deleted successfully"
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Only message sender can delete
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete('/:messageId', authMiddleware, messageController.deleteMessage);

module.exports = router;