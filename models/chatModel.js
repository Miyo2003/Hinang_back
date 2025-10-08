const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

// Load queries from /queries/chat
const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/chat');
  const queryFiles = fs.readdirSync(queryDir);
  const queries = {};

  queryFiles.forEach(file => {
    const queryName = path.basename(file, '.cypher');
    queries[queryName] = fs.readFileSync(path.join(queryDir, file), 'utf8');
  });

  return queries;
};

// Query executor
const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const queries = loadQueries();
    const query = queries[queryName];

    if (!query) throw new Error(`Query ${queryName} not found`);

    const result = await session.run(query, params);
    return result.records.map(record => {
      const recordObj = {};
      record.keys.forEach(key => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });
  } catch (error) {
    console.error(`Error executing ${queryName}:`, error);
    throw error;
  } finally {
    await session.close();
  }
};

const chatModel = {
  // Create a message between two users
  createMessage: async (senderId, receiverId, content) => {
    const records = await executeQuery('createMessage', { senderId, receiverId, content });
    return records[0]?.message || null;
  },

  // Get all messages sent by a user
  getMessagesByUserId: async (userId) => {
    const records = await executeQuery('getMessagesByUserId', { userId });
    return records.map(record => ({
      message: record.message,
      receiver: record.receiver
    }));
  },

  // Get full conversation between two users
  getConversation: async (userId1, userId2) => {
    const records = await executeQuery('getConversation', { userId1, userId2 });
    return records.map(record => record.m);
  },

  // Delete a message by ID
  deleteMessageById: async (id) => {
    const records = await executeQuery('deleteMessageById', { id });
    return records[0]?.deletedMessage || null;
  },

  // Get all chats for a user
  getChatsForUser: async (userId) => {
    const records = await executeQuery('getUserChats', { userId });
    return records.map(record => ({
      partner: record.partner.properties,
      lastMessageTime: record.lastMessageTime
    }));
  }
};

module.exports = chatModel;
