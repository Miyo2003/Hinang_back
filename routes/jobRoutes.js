const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /jobs:
 *   post:
 *     summary: Create a new job posting (client/admin only)
 *     description: Create a new job with detailed information about requirements and conditions
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobName
 *               - jobDescription
 *               - jobType
 *               - jobArea
 *             properties:
 *               jobName:
 *                 type: string
 *                 description: Title/name of the job position
 *                 example: "Senior Software Developer"
 *               jobDescription:
 *                 type: string
 *                 description: Detailed description of the job
 *                 example: "Looking for an experienced developer with expertise in Node.js and Neo4j"
 *               jobType:
 *                 type: string
 *                 enum: [full-time, part-time, contract, freelance, internship]
 *                 description: Type of employment
 *                 example: "full-time"
 *               jobArea:
 *                 type: string
 *                 description: Geographic area or remote work specification
 *                 example: "Remote - Worldwide"
 *               jobMedia:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: URLs to related media (images, documents)
 *               JobDuration:
 *                 type: string
 *                 description: Expected duration of the job
 *                 example: "12 months"
 *     responses:
 *       201:
 *         description: Job created successfully
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
 *                   example: "Job created successfully"
 *                 job:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     jobName:
 *                       type: string
 *                     jobDescription:
 *                       type: string
 *                     jobType:
 *                       type: string
 *                     jobArea:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request body or missing required fields
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to create jobs
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, roleMiddleware(['client', 'admin']), jobController.create);

/**
 * @openapi
 * /jobs:
 *   get:
 *     summary: Get list of all jobs with filtering and pagination
 *     description: Retrieve a paginated list of jobs with optional filters
 *     tags:
 *       - Jobs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, jobName, jobType, jobArea]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, freelance, internship]
 *         description: Filter by job type
 *       - in: query
 *         name: jobArea
 *         schema:
 *           type: string
 *         description: Filter by job area
 *     responses:
 *       200:
 *         description: List of jobs retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       jobName:
 *                         type: string
 *                       jobDescription:
 *                         type: string
 *                       jobType:
 *                         type: string
 *                       jobArea:
 *                         type: string
 *                       jobMedia:
 *                         type: array
 *                         items:
 *                           type: string
 *                       JobDuration:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of jobs
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *                     current:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Items per page
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, jobController.getAll);

/**
 * @openapi
 * /jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags:
 *       - Jobs
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 */
router.get('/:id', authMiddleware, jobController.getById);

/**
 * @openapi
 * /jobs/{id}:
 *   put:
 *     summary: Update a job (client/admin only)
 *     tags:
 *       - Jobs
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated
 */
router.put('/:id', authMiddleware, roleMiddleware(['client', 'admin']), jobController.update);

/**
 * @openapi
 * /jobs/{id}:
 *   delete:
 *     summary: Delete a job (client/admin only)
 *     tags:
 *       - Jobs
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Job deleted
 */
router.delete('/:id', authMiddleware, roleMiddleware(['client', 'admin']), jobController.delete);

module.exports = router;
