// services/notificationDispatcher.js
const notificationEmitter = require('../events/notificationEmitter');
const notificationModel = require('../models/notificationModel');
const pushService = require('./pushService');

let ioRef = null;

notificationEmitter.on('notify', async (payload) => {
  try {
    const notification = await notificationModel.createNotification(payload);

    if (ioRef && payload.userId) {
      ioRef.to(`user:${payload.userId}`).emit('notification:new', notification);
    }

    if (payload.sendPush) {
      await pushService.sendPush(payload.userId, notification);
    }
  } catch (err) {
    console.error('[notificationDispatcher] Failed to dispatch notification:', err);
  }
});

const queueNotification = (payload) => {
  notificationEmitter.emit('notify', payload);
};

const bindSocket = (io) => {
  ioRef = io;
};

module.exports = {
  queueNotification,
  bindSocket,
};