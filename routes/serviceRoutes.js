const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /services:
 *   post:
 *     summary: Create a new service
 *     description: Create a new service offering
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the service
 *                 minLength: 5
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 description: Detailed description of the service
 *                 minLength: 20
 *                 maxLength: 2000
 *               price:
 *                 type: number
 *                 description: Price of the service
 *                 minimum: 0
 *               category:
 *                 type: string
 *                 description: Category of the service
 *                 enum: [development, design, marketing, writing, admin]
 *               tags:
 *                 type: array
 *                 description: Tags to categorize the service
 *                 items:
 *                   type: string
 *                 maxItems: 5
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Service ID
 *                 title:
 *                   type: string
 *                   description: Service title
 *                 description:
 *                   type: string
 *                   description: Service description
 *                 price:
 *                   type: number
 *                   description: Service price
 *                 category:
 *                   type: string
 *                   description: Service category
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Service tags
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, serviceController.createService);

/**
 * @openapi
 * /services/user:
 *   get:
 *     summary: Get services for current user
 *     description: Retrieve all services created by the authenticated user
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *           enum: [development, design, marketing, writing, admin]
 *         description: Filter services by category
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [recent, price-asc, price-desc, title]
 *           default: recent
 *         description: Sort services by different criteria
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of services to return
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalServices:
 *                   type: integer
 *                   description: Total number of services
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Service ID
 *                       title:
 *                         type: string
 *                         description: Service title
 *                       description:
 *                         type: string
 *                         description: Service description
 *                       price:
 *                         type: number
 *                         description: Service price
 *                       category:
 *                         type: string
 *                         description: Service category
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Service tags
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       500:
 *         description: Internal server error
 */
router.get('/user', authMiddleware, serviceController.getUserServices);

/**
 * @openapi
 * /services/user/{userId}:
 *   get:
 *     summary: Get services for a specific user
 *     description: Retrieve all services created by a specific user
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose services to retrieve
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *           enum: [development, design, marketing, writing, admin]
 *         description: Filter services by category
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           enum: [recent, price-asc, price-desc, title]
 *           default: recent
 *         description: Sort services by different criteria
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of services to return
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: ID of the user whose services were retrieved
 *                 totalServices:
 *                   type: integer
 *                   description: Total number of services
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Service ID
 *                       title:
 *                         type: string
 *                         description: Service title
 *                       description:
 *                         type: string
 *                         description: Service description
 *                       price:
 *                         type: number
 *                         description: Service price
 *                       category:
 *                         type: string
 *                         description: Service category
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: Service tags
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/user/:userId', authMiddleware, serviceController.getUserServices);

module.exports = router;