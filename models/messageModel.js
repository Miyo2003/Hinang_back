// models/messageModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/message'));

const runQuery = async (name, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[name];
    if (!query) throw new Error(`[messageModel] Query "${name}" missing`);
    const result = await retry(async () => await session.run(query, params));
    return result.records;
  } finally {
    await session.close();
  }
};

const messageModel = {
  createMessage: async (payload) => {
    const records = await runQuery('createMessage', payload);
    if (!records.length) return null;

    const record = records[0];
    return {
      message: record.get('message')?.properties || null,
      attachments: record.get('attachments')?.map(a => a.properties) || []
    };
  },

  appendAttachment: async (messageId, attachment) => {
    const records = await runQuery('appendAttachment', { messageId, attachment });
    return records[0]?.get('attachment')?.properties || null;
  },

  getConversation: async (chatId, { limit = 50, before } = {}) => {
    const records = await runQuery('getConversation', { chatId, limit: parseInt(limit, 10), before });
    return records.map(r => ({
      message: r.get('message')?.properties || null,
      sender: r.get('sender')?.properties || null,
      attachments: r.get('attachments')?.map(a => a.properties) || [],
      replyTo: r.get('replyTo')?.properties || null
    })).filter(m => m.message);
  },

  getMessageById: async (id) => {
    const records = await runQuery('getMessageById', { id });
    const record = records[0];
    if (!record) return null;
    return {
      message: record.get('message')?.properties || null,
      attachments: record.get('attachments')?.map(a => a.properties) || [],
      replyTo: record.get('replyTo')?.properties || null
    };
  },

  markAsRead: async ({ messageId, readerId, readAt }) => {
    const records = await runQuery('markAsRead', { messageId, readerId, readAt });
    return records[0]?.get('message')?.properties || null;
  },

  updateMessageSubject: async ({ messageId, subject, updatedBy }) => {
    const records = await runQuery('updateMessageSubject', { messageId, subject, updatedBy });
    return records[0]?.get('message')?.properties || null;
  },

  deleteMessage: async ({ messageId, deletedBy }) => {
    const records = await runQuery('softDeleteMessage', { messageId, deletedBy });
    return records[0]?.get('message')?.properties || null;
  }
};

module.exports = messageModel;