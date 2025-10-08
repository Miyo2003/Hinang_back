// models/messageModel.js
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

// Execute a Cypher query
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

const messageModel = {
  // Send a message from sender to receiver
  createMessage: async (senderId, receiverId, content) => {
    const records = await executeQuery('createMessage', { senderId, receiverId, content });
    return records[0]?.message || null;
  },

  // Get full conversation between two users
  getConversation: async (userId1, userId2) => {
    const records = await executeQuery('getConversation', { userId1, userId2 });
    return records.map(r => r.m.properties); // return message properties only
  },

  // Get all messages sent by a user
  getMessagesByUserId: async (userId) => {
    const records = await executeQuery('getMessagesByUserId', { userId });
    return records.map(r => ({
      message: r.message.properties,
      receiver: r.receiver?.properties || null
    }));
  },

  // Delete a message by ID
  deleteMessageById: async (id) => {
    const records = await executeQuery('deleteMessageById', { id });
    return records[0]?.deletedMessage || null;
  },

  // Get all distinct chats for a user (all conversation partners)
  getUserChats: async (userId) => {
    const messages = await executeQuery('getMessagesByUserId', { userId });
    const partnersMap = {};

    messages.forEach(r => {
      if (r.receiver) {
        partnersMap[r.receiver.properties.id] = r.receiver.properties;
      }
    });

    return Object.values(partnersMap);
  }
};

module.exports = messageModel;
