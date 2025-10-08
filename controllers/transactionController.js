const TransactionModel = require('../models/transactionModel');
const WalletModel = require('../models/walletModel');

// Create a new transaction
const createTransaction = async (req, res) => {
    try {
        const { toWalletId, amount, type, description } = req.body;
        const fromWalletId = req.params.walletId;

        // Validate input
        if (!toWalletId || !amount || !type) {
            return res.status(400).json({ 
                message: 'Recipient wallet ID, amount, and transaction type are required' 
            });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than 0' });
        }

        // Create the transaction
        const transaction = await TransactionModel.createTransaction(
            fromWalletId,
            toWalletId,
            amount,
            type,
            description
        );

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        if (error.message === 'Insufficient balance for transaction') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating transaction' });
    }
};

module.exports = {
    createTransaction
};