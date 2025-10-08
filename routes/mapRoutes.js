const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /maps/job:
 *   post:
 *     summary: Set job location (client/admin only)
 *     tags:
 *       - Maps
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
 *               - latitude
 *               - longitude
 *             properties:
 *               jobId:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Job location set
 */
router.post('/job', authMiddleware, roleMiddleware(['client', 'admin']), mapController.setJobLocation);

/**
 * @openapi
 * /maps/job/{jobId}:
 *   get:
 *     summary: Get job location
 *     tags:
 *       - Maps
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
 *         description: Job location details
 */
router.get('/job/:jobId', authMiddleware, mapController.getJobLocation);

/**
 * @openapi
 * /maps/nearby:
 *   get:
 *     summary: Worker finds nearby jobs
 *     tags:
 *       - Maps
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of nearby jobs
 */
router.get('/nearby', authMiddleware, roleMiddleware(['worker']), mapController.getNearbyJobs);

module.exports = router;
