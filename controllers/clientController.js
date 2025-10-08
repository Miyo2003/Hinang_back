const clientModel = require('../models/clientModel');

const clientController = {
  create: async (req, res) => {
    try {
      const { 
        clientType, 
        serviceRequired, 
        budget, 
        contactPerson, 
        contactPreference 
      } = req.body;

      // Validate required fields
      const requiredFields = ['clientType', 'serviceRequired', 'budget', 'contactPerson', 'contactPreference'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Validate field types
      if (typeof budget !== 'number' || budget < 0) {
        return res.status(400).json({
          success: false,
          message: 'Budget must be a positive number'
        });
      }

      if (!['email', 'phone', 'chat'].includes(contactPreference)) {
        return res.status(400).json({
          success: false,
          message: 'Contact preference must be one of: email, phone, chat'
        });
      }

      const client = await clientModel.createClient({
        userId: req.user.id,
        clientType,
        serviceRequired,
        budget,
        contactPerson,
        contactPreference,
        createdAt: new Date().toISOString()
      });

      res.status(201).json({ success: true, client });
    } catch (err) {
      console.error('Error in create client:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      // Only admin can see all clients
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can view all clients'
        });
      }

      // Validate and parse pagination parameters
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      
      // Validate sorting parameters
      const allowedSortFields = ['clientType', 'budget', 'createdAt'];
      const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
      
      const order = ['asc', 'desc'].includes(req.query.order?.toLowerCase()) 
        ? req.query.order.toLowerCase() 
        : 'desc';

      const result = await clientModel.getClients({ page, limit, sortBy, order });
      res.json({ 
        success: true, 
        clients: result.clients,
        pagination: {
          total: result.total,
          pages: Math.ceil(result.total / limit),
          current: page,
          limit
        }
      });
    } catch (err) {
      console.error('Error in getAll clients:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      const client = await clientModel.getClientById(id);
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Only allow admin or the client owner to view details
      if (req.user.role !== 'admin' && client.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this client'
        });
      }

      res.json({ success: true, client });
    } catch (err) {
      console.error('Error in getById client:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Validate if client exists and user has permission
      const existingClient = await clientModel.getClientById(id);
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Only allow admin or the client owner to update
      if (req.user.role !== 'admin' && existingClient.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this client'
        });
      }

      // Validate budget if provided
      if (req.body.budget && (typeof req.body.budget !== 'number' || req.body.budget < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Budget must be a positive number'
        });
      }

      const client = await clientModel.updateClientById(id, {
        ...req.body,
        updatedAt: new Date().toISOString()
      });

      res.json({ success: true, client });
    } catch (err) {
      console.error('Error in update client:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required'
        });
      }

      // Validate if client exists and user has permission
      const existingClient = await clientModel.getClientById(id);
      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }

      // Only allow admin or the client owner to delete
      if (req.user.role !== 'admin' && existingClient.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this client'
        });
      }

      const result = await clientModel.deleteClientById(id);
      res.json({ success: true, result });
    } catch (err) {
      console.error('Error in delete client:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = clientController;
