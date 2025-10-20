// models/analyticsModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/analytics'));

const runQuery = async (name, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[name];
    if (!query) throw new Error(`[analyticsModel] Query "${name}" missing`);
    const result = await retry(async () => await session.run(query, params));
    return result.records;
  } finally {
    await session.close();
  }
};

const analyticsModel = {
  getTopWorkers: async () => {
    const records = await runQuery('topWorkers');
    return records.map(r => ({
      workerId: r.get('workerId'),
      assignmentCount: r.get('assignmentCount').toNumber(),
      averageRating: r.get('averageRating'),
    }));
  },

  getJobCategoryStats: async () => {
    const records = await runQuery('jobCategoryStats');
    return records.map(r => ({
      category: r.get('category'),
      jobs: r.get('jobs').toNumber(),
      totalAmount: r.get('totalAmount')
    }));
  },

  getPaymentVolume: async (interval) => {
    const records = await runQuery('paymentVolume', { interval });
    return records.map(r => ({
      period: r.get('period'),
      total: r.get('totalAmount'),
      count: r.get('count').toNumber()
    }));
  }
};

module.exports = analyticsModel;