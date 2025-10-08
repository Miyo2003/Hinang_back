const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /skills:
 *   post:
 *     summary: Create a skill (worker/admin only)
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Skill created
 */
router.post('/', authMiddleware, roleMiddleware(['worker', 'admin']), skillController.create);

/**
 * @openapi
 * /skills:
 *   get:
 *     summary: Get all skills
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of skills
 */
router.get('/', authMiddleware, skillController.getAll);

/**
 * @openapi
 * /skills/user/{userId}:
 *   get:
 *     summary: Get skills of a specific user
 *     tags:
 *       - Skills
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user skills
 */
router.get('/user/:userId', authMiddleware, skillController.getByUser);

/**
 * @openapi
 * /skills/{id}:
 *   put:
 *     summary: Update a skill (worker/admin only)
 *     tags:
 *       - Skills
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
 *         description: Skill updated
 */
router.put('/:id', authMiddleware, roleMiddleware(['worker', 'admin']), skillController.update);

/**
 * @openapi
 * /skills/{id}:
 *   delete:
 *     summary: Delete a skill (worker/admin only)
 *     tags:
 *       - Skills
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
 *         description: Skill deleted
 */
router.delete('/:id', authMiddleware, roleMiddleware(['worker', 'admin']), skillController.delete);

module.exports = router;
