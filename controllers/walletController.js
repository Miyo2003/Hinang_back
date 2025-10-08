const WalletModel = require('../models/walletModel');

// Create a new wallet
const createWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currency } = req.body;

        const wallet = await WalletModel.createWallet(userId, currency);
        res.status(201).json(wallet);
    } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json({ message: 'Error creating wallet' });
    }
};

// Get wallet details
const getWalletDetails = async (req, res) => {
    try {
        const userId = req.user.id; // Only allow viewing own wallet
        const walletDetails = await WalletModel.getWalletDetails(userId);

        if (!walletDetails) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.json(walletDetails);
    } catch (error) {
        console.error('Error getting wallet details:', error);
        res.status(500).json({ message: 'Error retrieving wallet details' });
    }
};

module.exports = {
    createWallet,
    getWalletDetails
};