const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /applications:
 *   post:
 *     summary: Worker applies to a job
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
 *     responses:
 *       200:
 *         description: Application created
 */
router.post('/', authMiddleware, roleMiddleware(['worker']), applicationController.apply);

/**
 * @openapi
 * /applications/job/{jobId}:
 *   get:
 *     summary: Get applications for a specific job (client/admin only)
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
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get('/job/:jobId', authMiddleware, roleMiddleware(['client', 'admin']), applicationController.getByJob);

/**
 * @openapi
 * /applications/worker/{workerId}:
 *   get:
 *     summary: Get applications submitted by a worker
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
 *     responses:
 *       200:
 *         description: List of applications by worker
 */
router.get('/worker/:workerId', authMiddleware, roleMiddleware(['worker', 'admin']), applicationController.getByWorker);

/**
 * @openapi
 * /applications/{id}/status:
 *   put:
 *     summary: Update application status (client/admin only)
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
 *     responses:
 *       200:
 *         description: Application status updated
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
