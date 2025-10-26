const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/profile/me:
 *   get:
 *     summary: Get own profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 profile:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       level:
 *                         type: string
 *                 workerProfile:
 *                   type: object
 *                   nullable: true
 *                 clientProfile:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 */
router.get('/me', authMiddleware, getProfile);

/**
 * @openapi
 * /profile/{userId}:
 *   get:
 *     summary: Get another user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose profile to retrieve
 *     responses:
 *       200:
 *         description: Profile information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 profile:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     avatar:
 *                       type: string
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       404:
 *         description: User not found
 */
router.get('/:userId', authMiddleware, getProfile);

/**
 * @openapi
 * /api/profile/me:
 *   put:
 *     summary: Update own profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the user
 *               bio:
 *                 type: string
 *                 description: User's biography
 *               avatar:
 *                 type: string
 *                 description: URL to user's avatar image
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 profile:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       400:
 *         description: Invalid request body
 */
router.put('/me', authMiddleware, updateProfile);

module.exports = router;