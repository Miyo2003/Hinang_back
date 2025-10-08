// controllers/chatController.js
const chatModel = require('../models/chatModel');

const chatController = {
  // Create a new message (which creates or updates a chat)
  createChat: async (req, res) => {
    try {
      const { participantId, content } = req.body;
      const message = await chatModel.createMessage(req.user.id, participantId, content);
      res.json({ success: true, message });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get all chats for the logged-in user
  getMyChats: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      const chats = await chatModel.getChatsForUser(req.user.id);
      res.json({ 
        success: true, 
        chats: chats.map(chat => ({
          partner: {
            id: chat.partner.id,
            username: chat.partner.username,
            firstName: chat.partner.firstName,
            lastName: chat.partner.familyName
          },
          lastMessageTime: chat.lastMessageTime
        }))
      });
    } catch (err) {
      console.error('Error in getMyChats:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = chatController;
