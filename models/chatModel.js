// models/chatModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/chat'));

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

const chatModel = {
  createMessage: async (senderId, receiverId, content) => {
    const records = await executeQuery('createMessage', { senderId, receiverId, content });
    return records[0]?.message?.properties || null;
  },

  getConversation: async (userId1, userId2) => {
    const records = await executeQuery('getConversation', { userId1, userId2 });
    return records.map(r => r.m?.properties).filter(Boolean);
  },

  getMessagesByUserId: async (userId) => {
    const records = await executeQuery('getMessagesByUserId', { userId });
    return records.map(r => ({
      message: r.message?.properties || null,
      receiver: r.receiver?.properties || null
    })).filter(r => r.message);
  },

  deleteMessageById: async (id) => {
    const records = await executeQuery('deleteMessageById', { id });
    return records[0]?.deletedMessage?.properties || null;
  },

  getChatsForUser: async (userId) => {
    const records = await executeQuery('getChatsForUser', { userId });
    const partners = new Map();

    records.forEach(r => {
      if (r.partner) {
        partners.set(r.partner.id, r.partner.properties);
      }
    });

    return Array.from(partners.values());
  }
};

module.exports = chatModel;