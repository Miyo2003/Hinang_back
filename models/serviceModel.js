// models/serviceModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/services'));

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

const serviceModel = {
  createService: async (userId, serviceData) => {
    const { title, description, price, category } = serviceData;
    if (!title || !price) throw new Error('Title and price are required');
    const records = await executeQuery('createService', { userId, title, description, price, category });
    return records[0]?.s?.properties || null;
  },

  getUserServices: async (userId) => {
    const records = await executeQuery('getUserServices', { userId });
    return records.map(r => r.s?.properties).filter(Boolean);
  }
};

module.exports = serviceModel;