const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

/**
 * @openapi
 * /wallet:
 *   post:
 *     summary: Create a new wallet for a user
 *     description: Creates a new wallet with specified currency for the authenticated user
 *     tags: 
 *       - Wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 default: "USD"
 *                 enum: ["USD", "EUR", "GBP"]
 *                 description: The currency for the wallet
 *     responses:
 *       201:
 *         description: Wallet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique wallet identifier
 *                     userId:
 *                       type: string
 *                       description: ID of the wallet owner
 *                     balance:
 *                       type: number
 *                       description: Current wallet balance
 *                       example: 0
 *                     currency:
 *                       type: string
 *                       description: Wallet currency
 *                       example: "USD"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized - No token provided
 *       409:
 *         description: User already has a wallet in this currency
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, walletController.createWallet);

/**
 * @openapi
 * /wallet/details:
 *   get:
 *     summary: Get wallet details including balance and transaction history
 *     description: Retrieves detailed information about the user's wallet including balance and recent transactions
 *     tags: 
 *       - Wallet
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of transactions to return
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of transactions to skip
 *     responses:
 *       200:
 *         description: Wallet details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Wallet identifier
 *                     balance:
 *                       type: number
 *                       description: Current wallet balance
 *                     currency:
 *                       type: string
 *                       description: Wallet currency
 *                     totalTransactions:
 *                       type: integer
 *                       description: Total number of transactions
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Transaction identifier
 *                           amount:
 *                             type: number
 *                             description: Transaction amount
 *                           type:
 *                             type: string
 *                             enum: [deposit, withdrawal, transfer]
 *                             description: Type of transaction
 *                           status:
 *                             type: string
 *                             enum: [pending, completed, failed]
 *                             description: Transaction status
 *                           description:
 *                             type: string
 *                             description: Transaction description
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Internal server error
 */
router.get('/details', authMiddleware, walletController.getWalletDetails);

/**
 * @openapi
 * /wallet/{walletId}/transactions:
 *   post:
 *     summary: Create a new transaction in the wallet
 *     description: Creates a new transaction (deposit, withdrawal, or transfer) in the specified wallet
 *     tags: 
 *       - Wallet
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount for the transaction
 *                 minimum: 0.01
 *               type:
 *                 type: string
 *                 enum: [deposit, withdrawal, transfer]
 *                 description: Type of transaction
 *               targetWalletId:
 *                 type: string
 *                 description: Required only for transfer type transactions
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, bank_transfer, crypto]
 *                 description: Required for deposit transactions
 *               description:
 *                 type: string
 *                 maxLength: 255
 *                 description: Optional transaction description
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Transaction identifier
 *                     walletId:
 *                       type: string
 *                       description: Source wallet ID
 *                     targetWalletId:
 *                       type: string
 *                       description: Target wallet ID for transfers
 *                     amount:
 *                       type: number
 *                       description: Transaction amount
 *                     type:
 *                       type: string
 *                       enum: [deposit, withdrawal, transfer]
 *                     status:
 *                       type: string
 *                       enum: [pending, completed, failed]
 *                     description:
 *                       type: string
 *                     paymentMethod:
 *                       type: string
 *                       enum: [card, bank_transfer, crypto]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     newBalance:
 *                       type: number
 *                       description: Updated wallet balance
 *       400:
 *         description: Invalid transaction details
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Not authorized to perform transactions from this wallet
 *       404:
 *         description: Wallet not found
 *       422:
 *         description: Insufficient funds or invalid transaction type
 *       500:
 *         description: Internal server error
 */
router.post('/:walletId/transactions', 
    authMiddleware,
    // Middleware to verify wallet ownership
    async (req, res, next) => {
        if (req.params.walletId !== req.user.walletId) {
            return res.status(403).json({ message: 'Not authorized to perform transactions from this wallet' });
        }
        next();
    },
    transactionController.createTransaction
);

module.exports = router;