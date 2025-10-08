const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Create a review (any logged-in user after a job)
 *     description: Create a new review for a user after completing a job
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reviewerId
 *               - userId
 *               - rating
 *               - jobId
 *             properties:
 *               reviewerId:
 *                 type: string
 *                 description: ID of the user writing the review
 *               userId:
 *                 type: string
 *                 description: ID of the user being reviewed
 *               jobId:
 *                 type: string
 *                 description: ID of the completed job
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5 stars
 *               comment:
 *                 type: string
 *                 description: Optional review comment
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Review ID
 *                 reviewerId:
 *                   type: string
 *                   description: ID of the reviewer
 *                 userId:
 *                   type: string
 *                   description: ID of the reviewed user
 *                 jobId:
 *                   type: string
 *                   description: ID of the associated job
 *                 rating:
 *                   type: number
 *                   description: Rating given (1-5)
 *                 comment:
 *                   type: string
 *                   description: Review comment
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Can only review after job completion
 *       404:
 *         description: User or job not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, reviewController.create);

/**
 * @openapi
 * /reviews/user/{userId}:
 *   get:
 *     summary: Get reviews for a user
 *     description: Retrieve all reviews received by a specific user
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to get reviews for
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of reviews to return
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [recent, rating]
 *           default: recent
 *         description: Sort reviews by date or rating
 *     responses:
 *       200:
 *         description: List of reviews for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: number
 *                   description: Average rating of all reviews
 *                 totalReviews:
 *                   type: integer
 *                   description: Total number of reviews
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Review ID
 *                       reviewerId:
 *                         type: string
 *                         description: ID of the reviewer
 *                       rating:
 *                         type: number
 *                         description: Rating given (1-5)
 *                       comment:
 *                         type: string
 *                         description: Review comment
 *                       jobId:
 *                         type: string
 *                         description: ID of the associated job
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/user/:userId', authMiddleware, reviewController.getByUser);

/**
 * @openapi
 * /reviews/reviewer/{reviewerId}:
 *   get:
 *     summary: Get reviews written by a user
 *     description: Retrieve all reviews written by a specific user
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reviewerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the reviewer to get reviews from
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of reviews to return
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [recent, rating]
 *           default: recent
 *         description: Sort reviews by date or rating
 *     responses:
 *       200:
 *         description: List of reviews by the reviewer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalReviews:
 *                   type: integer
 *                   description: Total number of reviews written
 *                 averageRatingGiven:
 *                   type: number
 *                   description: Average rating given in reviews
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Review ID
 *                       userId:
 *                         type: string
 *                         description: ID of the reviewed user
 *                       rating:
 *                         type: number
 *                         description: Rating given (1-5)
 *                       comment:
 *                         type: string
 *                         description: Review comment
 *                       jobId:
 *                         type: string
 *                         description: ID of the associated job
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Reviewer not found
 *       500:
 *         description: Internal server error
 */
router.get('/reviewer/:reviewerId', authMiddleware, reviewController.getByReviewer);

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     summary: Delete review (reviewer or admin only)
 *     description: Delete a specific review. Only the reviewer, reviewed user, or an admin can delete a review.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review deleted successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to delete this review
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'worker', 'client']), reviewController.delete);

module.exports = router;
