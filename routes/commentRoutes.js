const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Post comments management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the comment
 *         postId:
 *           type: string
 *           description: The ID of the post this comment belongs to
 *         userId:
 *           type: string
 *           description: The ID of the user who created the comment
 *         content:
 *           type: string
 *           description: The text content of the comment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the comment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the comment was last updated
 *       example:
 *         id: "comment123"
 *         postId: "post456"
 *         userId: "user789"
 *         content: "Great post! Very informative."
 *         createdAt: "2025-10-19T12:00:00Z"
 *         updatedAt: "2025-10-19T12:00:00Z"
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     description: Create a new comment on a post. Any authenticated user can comment.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - content
 *             properties:
 *               postId:
 *                 type: string
 *                 description: ID of the post to comment on
 *               content:
 *                 type: string
 *                 description: Text content of the comment
 *                 minLength: 1
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, commentController.create);

/**
 * @swagger
 * /comments/post/{postId}:
 *   get:
 *     summary: Get comments for a post
 *     description: Retrieve all comments for a specific post with pagination
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to get comments for
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of comments per page
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - name: order
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of comments
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *                     current:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Comments per page
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get('/post/:postId', authMiddleware, commentController.listForPost);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment (admin only)
 *     description: Remove a comment from a post. Currently restricted to admin users only.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *                   example: "Comment deleted successfully"
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Must be an admin
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, commentController.delete);

module.exports = router;
