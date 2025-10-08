const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


/**
 * @openapi
 * /clients:
 *   post:
 *     summary: Create a new client profile (client/admin only)
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientType
 *               - serviceRequired
 *               - budget
 *               - contactPerson
 *               - contactPreference
 *             properties:
 *               clientType:
 *                 type: string
 *                 description: Type of client (individual/business/organization)
 *                 example: "business"
 *               serviceRequired:
 *                 type: string
 *                 description: Description of services needed
 *                 example: "Website development and maintenance"
 *               budget:
 *                 type: number
 *                 description: Available budget for the service
 *                 minimum: 0
 *                 example: 5000
 *               contactPerson:
 *                 type: string
 *                 description: Name of the primary contact person
 *                 example: "John Smith"
 *               contactPreference:
 *                 type: string
 *                 description: Preferred method of contact
 *                 enum: [email, phone, chat]
 *                 example: "email"
 *     responses:
 *       201:
 *         description: Client profile created successfully
 *       400:
 *         description: Invalid request body or missing required fields
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to create client profile
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, roleMiddleware(['client', 'admin']), clientController.create);

/**
 * @openapi
 * /clients:
 *   get:
 *     summary: Get list of all clients (admin only)
 *     tags:
 *       - Clients
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
 *           enum: [clientType, budget, createdAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique client identifier
 *                       clientType:
 *                         type: string
 *                       serviceRequired:
 *                         type: string
 *                       budget:
 *                         type: number
 *                       contactPerson:
 *                         type: string
 *                       contactPreference:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of clients
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *                     current:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Items per page
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to view clients
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, clientController.getAll);

/**
 * @openapi
 * /clients/{id}:
 *   get:
 *     summary: Get client details by ID
 *     description: Retrieve detailed information about a specific client
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the client
 *     responses:
 *       200:
 *         description: Client details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique client identifier
 *                 clientType:
 *                   type: string
 *                   description: Type of client
 *                 serviceRequired:
 *                   type: string
 *                   description: Required services description
 *                 budget:
 *                   type: number
 *                   description: Available budget
 *                 contactPerson:
 *                   type: string
 *                   description: Primary contact person
 *                 contactPreference:
 *                   type: string
 *                   description: Preferred contact method
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid client ID format
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to view this client
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware, clientController.getById);

/**
 * @openapi
 * /clients/{id}:
 *   put:
 *     summary: Update client profile (client owner/admin only)
 *     description: Modify existing client profile information
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the client to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientType:
 *                 type: string
 *                 description: Type of client (individual/business/organization)
 *               serviceRequired:
 *                 type: string
 *                 description: Description of services needed
 *               budget:
 *                 type: number
 *                 description: Available budget for the service
 *                 minimum: 0
 *               contactPerson:
 *                 type: string
 *                 description: Name of the primary contact person
 *               contactPreference:
 *                 type: string
 *                 description: Preferred method of contact
 *                 enum: [email, phone, chat]
 *     responses:
 *       200:
 *         description: Client profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Updated client's ID
 *                 message:
 *                   type: string
 *                   example: "Client profile updated successfully"
 *       400:
 *         description: Invalid request body or client ID
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to update this client
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, roleMiddleware(['client', 'admin']), clientController.update);

/**
 * @openapi
 * /clients/{id}:
 *   delete:
 *     summary: Delete client profile (client owner/admin only)
 *     description: Remove a client profile from the system
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the client to delete
 *     responses:
 *       200:
 *         description: Client profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Client profile deleted successfully"
 *       400:
 *         description: Invalid client ID format
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Not authorized to delete this client
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authMiddleware, roleMiddleware(['client', 'admin']), clientController.delete);

module.exports = router;
