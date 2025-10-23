const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const userController = {
  // Get all users (admin only)
  getAll: async (req, res) => {
    try {
      const users = await userModel.getUsers();
      res.json({ success: true, users });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get logged-in user's profile
  getMe: async (req, res) => {
    try {
      const user = await userModel.getUserById(req.user.id);
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get user by ID (admin or same user)
  getById: async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      const user = await userModel.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Update user profile
  update: async (req, res) => {
    try {
      const { password, ...updates } = req.body;

      // If password is updated, hash it
      if (password) {
        updates.password = await bcrypt.hash(password, 10);
      }

      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const user = await userModel.updateUserById(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Delete user (self or admin)
  delete: async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const result = await userModel.deleteUserById(req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = userController;
