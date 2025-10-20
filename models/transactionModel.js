// models/transactionModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/transaction'));

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
  } catch (error) {
    if (error.message.includes('insufficient balance')) {
      throw new Error('Insufficient balance for transaction');
    }
    throw error;
  } finally {
    await session.close();
  }
};

const transactionModel = {
  createTransaction: async (fromWalletId, toWalletId, amount, type, description) => {
    if (!fromWalletId || !toWalletId || amount <= 0 || !type) {
      throw new Error('Invalid transaction parameters');
    }
    const records = await executeQuery('createTransaction', { fromWalletId, toWalletId, amount, type, description });
    return records[0]?.t?.properties || null;
  }
};

module.exports = transactionModel;