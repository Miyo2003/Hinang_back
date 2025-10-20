// controllers/messageController.js
const messageModel = require('../models/messageModel');
const messageSearchService = require('../services/messageSearchService');
const messageRetentionService = require('../services/messageRetentionService');
const { generateSignedUpload } = require('../services/messageAttachmentService');
const { queueNotification } = require('../services/notificationDispatcher');
const { getSocket } = require('../utils/socket');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const messageController = {
  sendMessage: async (req, res) => {
    try {
      assertFeatureEnabled('richMessagingEnabled');

      const { chatId } = req.params;
      const { content, attachments = [], replyTo, subject, expiresAt } = req.body;

      if (!content && attachments.length === 0) {
        return res.status(400).json({ success: false, message: 'Message must include text or attachments' });
      }

      const messagePayload = {
        chatId,
        senderId: req.user.id,
        content,
        replyTo,
        subject,
        expiresAt,
        createdAt: new Date().toISOString(),
        mentions: req.body.mentions || [],
        hashtags: req.body.hashtags || []
      };

      const result = await messageModel.createMessage(messagePayload);

      for (const attachment of attachments) {
        await messageModel.appendAttachment(result.message.id, attachment);
      }

      const io = getSocket();
      if (io) {
        io.to(`chat:${chatId}`).emit('message:new', result);
        io.to(`user:${req.user.id}`).emit('message:sent', result);
      }

      queueNotification({
        userId: req.user.id,
        type: 'message',
        message: `Message sent in chat ${chatId}`,
        link: `/chats/${chatId}`,
        sendPush: false
      });

      res.status(201).json({ success: true, message: result });
    } catch (err) {
      console.error('Error sending message:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getConversation: async (req, res) => {
    try {
      const { chatId } = req.params;
      const messages = await messageModel.getConversation(chatId, req.query);
      res.json({ success: true, messages });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  searchMessages: async (req, res) => {
    try {
      assertFeatureEnabled('messageSearchEnabled');
      const { chatId } = req.params;
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Query is required' });
      }
      const results = await messageSearchService.searchMessages({ query, chatId });
      res.json({ success: true, results });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const { messageId } = req.params;
      const readAt = new Date().toISOString();
      const result = await messageModel.markAsRead({ messageId, readerId: req.user.id, readAt });

      const io = getSocket();
      if (io && result) {
        io.emit('message:read', { messageId, readerId: req.user.id, readAt });
      }

      res.json({ success: true, message: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updateSubject: async (req, res) => {
    try {
      assertFeatureEnabled('richMessagingEnabled');
      const { messageId } = req.params;
      const { subject } = req.body;
      const message = await messageModel.updateMessageSubject({
        messageId,
        subject,
        updatedBy: req.user.id
      });
      res.json({ success: true, message });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  deleteMessage: async (req, res) => {
    try {
      assertFeatureEnabled('messageRetentionEnabled');
      const { messageId } = req.params;
      const message = await messageRetentionService.softDeleteMessage(messageId, req.user.id);
      res.json({ success: true, message });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  generateUploadUrl: async (req, res) => {
    try {
      assertFeatureEnabled('richMessagingEnabled');
      const { fileType } = req.query;
      if (!fileType) {
        return res.status(400).json({ success: false, message: 'fileType query parameter is required' });
      }
      const signed = await generateSignedUpload({ fileType });
      res.json({ success: true, signed });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = messageController;