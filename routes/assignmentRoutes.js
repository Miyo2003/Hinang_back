const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /assignments:
 *   post:
 *     summary: Assign a worker to a job (client/admin only)
 *     tags:
 *       - Assignments
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
 *               - workerId
 *             properties:
 *               jobId:
 *                 type: string
 *               workerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Worker assigned
 */
router.post('/', authMiddleware, roleMiddleware(['client', 'admin']), assignmentController.assignWorker);

/**
 * @openapi
 * /assignments/job/{jobId}:
 *   get:
 *     summary: Get workers assigned to a job
 *     tags:
 *       - Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of workers
 */
router.get('/job/:jobId', authMiddleware, assignmentController.getWorkersByJob);

/**
 * @openapi
 * /assignments/worker/{workerId}:
 *   get:
 *     summary: Get jobs assigned to a worker
 *     tags:
 *       - Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: workerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/worker/:workerId', authMiddleware, assignmentController.getJobsByWorker);

/**
 * @openapi
 * /assignments/{jobId}/{workerId}:
 *   delete:
 *     summary: Remove a worker's assignment from a job (client/admin only)
 *     tags:
 *       - Assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the job
 *       - name: workerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the worker
 *     responses:
 *       200:
 *         description: Assignment removed successfully
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.delete('/:jobId/:workerId', authMiddleware, roleMiddleware(['client', 'admin']), assignmentController.deleteAssignment);

module.exports = router;
