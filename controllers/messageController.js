// controllers/messageController.js
const messageModel = require('../models/messageModel');

const messageController = {
  // Send a message
  send: async (req, res) => {
    try {
      const { receiverId, content } = req.body;
      const message = await messageModel.createMessage(req.user.id, receiverId, content);
      res.json({ success: true, message });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get conversation between two users
  getConversation: async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await messageModel.getConversation(req.user.id, userId);
      res.json({ success: true, messages });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get all chats for a user (distinct conversation partners)
  getUserChats: async (req, res) => {
    try {
      const chats = await messageModel.getUserChats(req.user.id);
      res.json({ success: true, chats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Update a message
  updateMessage: async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const message = await messageModel.updateMessage(id, content);
      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
      res.json({ success: true, message });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Delete a message
  deleteMessage: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await messageModel.deleteMessageById(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
      res.json({ success: true, message: 'Message deleted successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = messageController;
