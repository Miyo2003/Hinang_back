const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: Skills management and user skill associations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Skill:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier for the skill
 *         name:
 *           type: string
 *           description: The name of the skill
 *         category:
 *           type: string
 *           description: The category of the skill
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "skill123"
 *         name: "JavaScript"
 *         category: "Programming"
 *         createdAt: "2025-10-19T12:00:00Z"
 *         updatedAt: "2025-10-19T12:00:00Z"
 */

/**
 * @swagger
 * /skills:
 *   post:
 *     summary: Create a new skill (worker/admin only)
 *     description: Add a new skill to the system. Only workers and admins can create skills.
 *     tags: [Skills]
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
 *                 description: Name of the skill
 *               category:
 *                 type: string
 *                 description: Category of the skill
 *     responses:
 *       201:
 *         description: Skill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 skill:
 *                   $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not a worker or admin
 *       409:
 *         description: Skill already exists
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, roleMiddleware(['worker', 'admin']), skillController.create);

/**
 * @swagger
 * /skills:
 *   get:
 *     summary: Get all skills
 *     description: Retrieve a list of all available skills in the system
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter skills by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search skills by name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 skills:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Skill'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     current:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, skillController.getAll);

/**
 * @swagger
 * /skills/user/{userId}:
 *   get:
 *     summary: Get skills of a specific user
 *     description: Retrieve all skills associated with a specific user
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose skills to retrieve
 *     responses:
 *       200:
 *         description: User's skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 skills:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Skill'
 *                       - type: object
 *                         properties:
 *                           proficiency:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 5
 *                           yearsOfExperience:
 *                             type: number
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', authMiddleware, skillController.getByUser);

/**
 * @swagger
 * /skills/{id}:
 *   put:
 *     summary: Update a skill (worker/admin only)
 *     description: Modify an existing skill's information
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the skill to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the skill
 *               category:
 *                 type: string
 *                 description: New category for the skill
 *     responses:
 *       200:
 *         description: Skill updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 skill:
 *                   $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not a worker or admin
 *       404:
 *         description: Skill not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, roleMiddleware(['worker', 'admin']), skillController.update);

/**
 * @swagger
 * /skills/{id}:
 *   delete:
 *     summary: Delete a skill (worker/admin only)
 *     description: Remove a skill from the system
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the skill to delete
 *     responses:
 *       200:
 *         description: Skill deleted successfully
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
 *                   example: "Skill deleted successfully"
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not a worker or admin
 *       404:
 *         description: Skill not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, roleMiddleware(['worker', 'admin']), skillController.delete);

module.exports = router;
