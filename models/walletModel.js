// models/walletModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/wallet'));

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

const walletModel = {
  createWallet: async (userId, currency = 'USD') => {
    if (!userId) throw new Error('User ID is required');
    const records = await executeQuery('createWallet', { userId, currency });
    return records[0]?.w?.properties || null;
  },

  getWalletDetails: async (userId) => {
    const records = await executeQuery('getWalletDetails', { userId });
    const record = records[0];
    if (!record) return null;

    return {
      balance: record.balance,
      currency: record.currency,
      transactions: record.transactions?.map(t => t.properties) || []
    };
  }
};

module.exports = walletModel;