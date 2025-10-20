const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @openapi
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The application's unique identifier
 *         jobId:
 *           type: string
 *           description: The ID of the job being applied to
 *         workerId:
 *           type: string
 *           description: The ID of the worker applying
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, withdrawn]
 *           description: The current status of the application
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: When the application was submitted
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the application was last updated
 *         coverLetter:
 *           type: string
 *           description: Optional cover letter text
 *         resumeUrl:
 *           type: string
 *           description: URL to the worker's resume
 * 
 * /applications:
 *   post:
 *     summary: Worker applies to a job
 *     description: Submit a new job application. Only workers can apply to jobs.
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job to apply for
 *               coverLetter:
 *                 type: string
 *                 description: Optional cover letter text
 *               resumeUrl:
 *                 type: string
 *                 description: Optional URL to the worker's resume
 *     responses:
 *       201:
 *         description: Application created successfully
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
 *                   example: "Application submitted successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       400:
 *         description: Invalid request or already applied to this job
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You have already applied to this job"
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Only workers can apply to jobs
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, roleMiddleware(['worker']), applicationController.apply);

/**
 * @openapi
 * /applications/job/{jobId}:
 *   get:
 *     summary: Get applications for a specific job (client/admin only)
 *     description: Retrieve all applications submitted for a specific job. Only the job owner (client) or admin can view these.
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the job to get applications for
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, withdrawn]
 *         description: Filter applications by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [appliedAt, updatedAt]
 *           default: appliedAt
 *         description: Sort applications by field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of applications retrieved successfully
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
 *                     $ref: '#/components/schemas/Application'
 *                 total:
 *                   type: integer
 *                   description: Total number of applications for this job
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to view these applications
 *       404:
 *         description: Job not found
 *       500:
 *         description: Internal server error
 */
router.get('/job/:jobId', authMiddleware, roleMiddleware(['client', 'admin']), applicationController.getByJob);

/**
 * @openapi
 * /applications/worker/{workerId}:
 *   get:
 *     summary: Get applications submitted by a worker
 *     description: Retrieve all applications submitted by a specific worker. Workers can only view their own applications, while admins can view any worker's applications.
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: workerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the worker to get applications for
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected, withdrawn]
 *         description: Filter applications by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [appliedAt, updatedAt]
 *           default: appliedAt
 *         description: Sort applications by field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of worker's applications retrieved successfully
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
 *                     $ref: '#/components/schemas/Application'
 *                 total:
 *                   type: integer
 *                   description: Total number of applications by this worker
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Can only view own applications unless admin
 *       404:
 *         description: Worker not found
 *       500:
 *         description: Internal server error
 */
router.get('/worker/:workerId', authMiddleware, roleMiddleware(['worker', 'admin']), applicationController.getByWorker);

/**
 * @openapi
 * /applications/{id}/status:
 *   put:
 *     summary: Update application status (client/admin only)
 *     description: Update the status of an application. Clients can only update applications for their own jobs. Workers can withdraw their own applications.
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the application to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, withdrawn]
 *                 description: New status for the application
 *               feedback:
 *                 type: string
 *                 description: Optional feedback for the worker about the status change
 *     responses:
 *       200:
 *         description: Application status updated successfully
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
 *                   example: "Application status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       400:
 *         description: Invalid status transition or invalid application ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid status transition"
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to update this application
 *       404:
 *         description: Application not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/status', authMiddleware, roleMiddleware(['client', 'admin']), applicationController.updateStatus);

/**
 * @openapi
 * /applications/{id}:
 *   delete:
 *     summary: Delete an application (worker or admin only)
 *     tags:
 *       - Applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       400:
 *         description: Invalid application ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, roleMiddleware(['worker', 'admin']), applicationController.delete);

module.exports = router;
