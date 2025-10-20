// models/notificationModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/notification'));

const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[queryName];
    if (!query) throw new Error(`Query "${queryName}" not found`);
    const result = await retry(async () => await session.run(query, params));
    return result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => obj[key] = record.get(key));
      return obj;
    });
  } finally {
    await session.close();
  }
};

const notificationModel = {
  createNotification: async ({ userId, type, message, link, status = 'unread', timestamp = new Date().toISOString() }) => {
    if (!userId || !type || !message) throw new Error('userId, type, and message are required');
    const records = await executeQuery('createNotification', { userId, type, message, link, status, timestamp });
    return records[0]?.n?.properties || null;
  },

  getNotificationsByUserId: async (userId) => {
    const records = await executeQuery('getNotificationsByUserId', { userId });
    return records.map(r => r.n?.properties).filter(Boolean);
  },

  updateNotificationStatus: async (id, status) => {
    if (!['unread', 'read', 'deleted'].includes(status)) throw new Error('Invalid status');
    const records = await executeQuery('updateNotificationStatus', { id, status });
    return records[0]?.n?.properties || null;
  },

  deleteNotificationById: async (id) => {
    const records = await executeQuery('deleteNotificationById', { id });
    return records[0]?.deletedNotification?.properties || null;
  }
};

module.exports = notificationModel;