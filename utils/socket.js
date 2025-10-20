// utils/socket.js
const { Server } = require('socket.io');
const { isFeatureEnabled } = require('./featureToggle');
const presenceService = require('../services/presenceService');
const notificationDispatcher = require('../services/notificationDispatcher');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (httpServer) => {
  if (!isFeatureEnabled('socketIoEnabled')) {
    console.log('[socket.io] Disabled via feature toggle');
    return null;
  }

  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
  });

  io.on('connection', async (socket) => {
    const token = socket.handshake.query.token;
    if (!token) {
      socket.disconnect();
      return;
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const userId = payload.id;
      const userAgent = socket.handshake.headers['user-agent'];

      if (userId && isFeatureEnabled('presenceTrackingEnabled')) {
        await presenceService.setUserOnline(userId, {
          socketId: socket.id,
          userAgent
        });
        io.emit('presence:update', await presenceService.getPresenceSnapshot());
      }

      socket.on('join:chat', ({ chatId }) => {
        socket.join(`chat:${chatId}`);
      });

      socket.on('message:typing', ({ chatId, userId: typingUserId }) => {
        socket.to(`chat:${chatId}`).emit('message:typing', {
          chatId,
          userId: typingUserId
        });
      });

      socket.on('message:read', ({ chatId, messageId, readerId }) => {
        socket.to(`chat:${chatId}`).emit('message:read', { messageId, readerId });
      });

      socket.on('presence:ping', async () => {
        if (!userId) return;
        await presenceService.touchUser(userId);
      });

      socket.on('disconnect', async () => {
        if (userId && isFeatureEnabled('presenceTrackingEnabled')) {
          await presenceService.setUserOffline(userId, socket.id);
          io.emit('presence:update', await presenceService.getPresenceSnapshot());
        }
      });
    } catch (err) {
      socket.disconnect();
    }
  });

  notificationDispatcher.bindSocket(io);

  return io;
};

const getSocket = () => {
  if (!io) {
    console.warn('[socket.io] Attempted to access uninitialized io instance');
  }
  return io;
};

module.exports = {
  initSocket,
  getSocket,
};