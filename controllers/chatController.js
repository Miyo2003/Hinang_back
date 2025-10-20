// controllers/chatController.js
const chatModel = require('../models/chatModel');
const userModel = require('../models/userModel');

const chatController = {
  // Create a new message (which creates or updates a chat)
  createChat: async (req, res) => {
    try {
      const { participantId, content } = req.body;

      if (!participantId || !content) {
        return res.status(400).json({
          success: false,
          message: "Participant ID and message content are required"
        });
      }

      // Check if participant exists
      const participant = await userModel.getUserById(participantId);
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: "Participant not found"
        });
      }

      // Prevent chatting with oneself
      if (participantId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot create chat with yourself"
        });
      }

      // Role-based chat restrictions
      if (req.user.role === 'client' && participant.role === 'client') {
        return res.status(403).json({
          success: false,
          message: "Clients cannot chat with other clients"
        });
      }

      if (req.user.role === 'worker' && participant.role === 'worker') {
        return res.status(403).json({
          success: false,
          message: "Workers cannot chat with other workers"
        });
      }

      const message = await chatModel.createMessage(req.user.id, participantId, content);
      res.json({ success: true, message });
    } catch (err) {
      console.error('Error in createChat:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get all chats for the logged-in user
  getMyChats: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Max 50 items per page
      const offset = (page - 1) * limit;

      const [chats, totalChats] = await Promise.all([
        chatModel.getChatsForUser(req.user.id, { offset, limit }),
        chatModel.countChatsForUser(req.user.id)
      ]);

      // Filter chats based on user role
      const filteredChats = chats.filter(chat => {
        const partnerRole = chat.partner?.role;
        
        if (req.user.role === 'admin') return true; // Admins can see all chats
        if (req.user.role === 'client') return partnerRole === 'worker' || partnerRole === 'admin';
        if (req.user.role === 'worker') return partnerRole === 'client' || partnerRole === 'admin';
        
        return false;
      });

      const totalPages = Math.ceil(totalChats / limit);

      res.json({ 
        success: true, 
        chats: filteredChats.map(chat => ({
          partner: {
            id: chat.partner.id,
            username: chat.partner.username,
            firstName: chat.partner.firstName,
            lastName: chat.partner.familyName,
            role: chat.partner.role
          },
          lastMessageTime: chat.lastMessageTime,
          unreadCount: chat.unreadCount || 0
        })),
        pagination: {
          total: totalChats,
          pages: totalPages,
          currentPage: page,
          limit: limit
        }
      });
    } catch (err) {
      console.error('Error in getMyChats:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = chatController;
