const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /workers:
 *   post:
 *     summary: Create a worker (worker/admin only)
 *     tags:
 *       - Workers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - skills
 *               - hourlyRate
 *               - availability
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to create worker profile for
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of worker's skills
 *               hourlyRate:
 *                 type: number
 *                 description: Worker's hourly rate
 *               availability:
 *                 type: string
 *                 description: Worker's availability (e.g., 'full-time', 'part-time')
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Optional start date of availability
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Optional end date of availability
 *     responses:
 *       200:
 *         description: Worker created
 */
router.post('/', authMiddleware, roleMiddleware(['worker', 'admin']), workerController.create);

/**
 * @openapi
 * /workers:
 *   get:
 *     summary: Get all workers
 *     tags:
 *       - Workers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workers
 */
router.get('/', authMiddleware, workerController.getAll);

/**
 * @openapi
 * /workers/{id}:
 *   get:
 *     summary: Get worker by ID
 *     tags:
 *       - Workers
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
 *         description: Worker details
 */
router.get('/:id', authMiddleware, workerController.getById);

/**
 * @openapi
 * /workers/{id}:
 *   put:
 *     summary: Update worker (worker/admin only)
 *     tags:
 *       - Workers
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
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Worker updated
 */
router.put('/:id', authMiddleware, roleMiddleware(['worker', 'admin']), workerController.update);

/**
 * @openapi
 * /workers/{id}:
 *   delete:
 *     summary: Delete worker (worker/admin only)
 *     tags:
 *       - Workers
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
 *         description: Worker deleted
 */
router.delete('/:id', authMiddleware, roleMiddleware(['worker', 'admin']), workerController.delete);

module.exports = router;
