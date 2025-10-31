// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: User authentication and registration
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         role:
 *           type: string
 *           enum: [client, worker, admin]
 *           description: The role of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         middleName:
 *           type: string
 *           description: The middle name of the user
 *         familyName:
 *           type: string
 *           description: The family name of the user
 *         phoneNumber:
 *           type: string
 *           description: The phone number of the user
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: The gender of the user
 *         age:
 *           type: integer
 *           minimum: 18
 *           description: The age of the user
 *         address:
 *           type: string
 *           description: The address of the user
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: The status of the user
 *       example:
 *         id: "123456"
 *         username: "johndoe"
 *         role: "client"
 *         email: "john.doe@example.com"
 *         firstName: "John"
 *         middleName: "William"
 *         familyName: "Doe"
 *         phoneNumber: "+1234567890"
 *         gender: "male"
 *         age: 30
 *         address: "123 Main St, City, Country"
 *         status: "active"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user with email verification
 *     description: Registers a new user with real-time email verification using Abstract API.
 *                 Checks email deliverability, quality, and security before registration.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *               - role
 *               - firstName
 *               - familyName
 *               - phoneNumber
 *               - gender
 *               - age
 *               - address
 *               - status
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "securePassword123"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               role:
 *                 type: string
 *                 enum: [client, worker]
 *                 example: "client"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               middleName:
 *                 type: string
 *                 example: "William"
 *               familyName:
 *                 type: string
 *                 example: "Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "+1234567890"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               age:
 *                 type: integer
 *                 minimum: 18
 *                 example: 25
 *               address:
 *                 type: string
 *                 example: "123 Main St, City, Country"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *                 default: "pending"
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                   example: "User registered successfully"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data, missing required fields, or email verification failed
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: "Invalid email address. Please provide a valid email."
 *                     details:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: "undeliverable"
 *                         isFormatValid:
 *                           type: boolean
 *                           example: true
 *                         isSmtpValid:
 *                           type: boolean
 *                           example: false
 *                         isMxValid:
 *                           type: boolean
 *                           example: true
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: "Missing required fields"
 *       409:
 *         description: Email or username already exists
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
 *                   example: "Email already exists"
 *       500:
 *         description: Server error
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
 *                   example: "Internal server error"
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields
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
 *                   example: "Missing required fields"
 *       401:
 *         description: Invalid credentials
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
 *                   example: "Invalid credentials"
 *       500:
 *         description: Server error
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
 *                   example: "Internal server error"
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/verify-email:
 *   get:
 *     summary: Verify user email
 *     description: Verifies a user's email address using the token sent to their email
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token received via email
 *         example: "a1b2c3d4e5f6..."
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                   example: "Email verified successfully"
 *       400:
 *         description: Invalid or expired token
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
 *                   example: "Invalid or expired verification token"
 *       500:
 *         description: Server error
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
 *                   example: "Internal server error"
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @openapi
 * /auth/verify-email-code:
 *   post:
 *     summary: Verify user email with code
 *     description: Verifies a user's email address using the code sent to their email (for admin users)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Verification code received via email
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                   example: "Email verified successfully"
 *       400:
 *         description: Invalid or expired code
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
 *                   example: "Invalid or expired verification code"
 *       500:
 *         description: Server error
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
 *                   example: "Internal server error"
 */
router.get('/check-verification-status', authController.checkVerificationStatus);

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     summary: Resend email verification
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/resend-verification', authMiddleware, authController.resendVerificationEmail);
router.post('/refresh', authController.refreshToken);

/**
 * @openapi
 * /auth/autocomplete-address:
 *   get:
 *     summary: Get address autocomplete suggestions
 *     description: Returns address suggestions for Bongao, Tawi-Tawi, Philippines based on user input
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The address query string to autocomplete
 *         example: "Tubig"
 *     responses:
 *       200:
 *         description: Address suggestions returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique place identifier
 *                   text:
 *                     type: string
 *                     description: Formatted address text
 *                   formattedAddress:
 *                     type: string
 *                     description: Complete formatted address
 *                   latitude:
 *                     type: number
 *                     description: Latitude coordinate
 *                   longitude:
 *                     type: number
 *                     description: Longitude coordinate
 *                 example:
 *                   - id: "51c5b6c6b8b8b8b8b8b8b8b8"
 *                     text: "Tubig, Bongao, Tawi-Tawi"
 *                     formattedAddress: "Tubig, Bongao, Tawi-Tawi"
 *                     latitude: 5.029
 *                     longitude: 119.773
 *       400:
 *         description: Invalid query parameter
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
 *                   example: "Query parameter is required"
 *       500:
 *         description: Server error
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
 *                   example: "Internal server error"
 */
router.get('/autocomplete-address', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    const { autocompleteAddress } = require('../services/locationVerificationService');
    const suggestions = await autocompleteAddress(query);

    res.json(suggestions);
  } catch (error) {
    console.error('Error in autocomplete-address:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
