const ServiceModel = require('../models/serviceModel');

// Create a new service
const createService = async (req, res) => {
    try {
        const userId = req.user.id;
        const serviceData = req.body;

        // Validation
        if (!serviceData.title || !serviceData.price) {
            return res.status(400).json({ message: 'Title and price are required' });
        }

        const service = await ServiceModel.createService(userId, serviceData);
        res.status(201).json(service);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Error creating service' });
    }
};

// Get services for a user
const getUserServices = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        const services = await ServiceModel.getUserServices(userId);
        res.json(services);
    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({ message: 'Error retrieving services' });
    }
};

module.exports = {
    createService,
    getUserServices
};