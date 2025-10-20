// models/commentModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/comment'));

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

const commentModel = {
  create: async (userId, postId, content) => {
    if (!content || content.trim().length === 0) throw new Error('Content cannot be empty');
    const records = await executeQuery('create', { userId, postId, content });
    return records[0]?.comment?.properties || null;
  },

  listForPost: async (postId) => {
    const records = await executeQuery('listForPost', { postId });
    return records.map(r => r.comment?.properties).filter(Boolean);
  },

  delete: async (id) => {
    await executeQuery('delete', { id });
    return true;
  }
};

module.exports = commentModel;