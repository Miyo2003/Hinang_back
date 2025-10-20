// models/mapModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/map'));

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

const mapModel = {
  addJobLocation: async (jobId, latitude, longitude, address) => {
    if (!jobId || typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Invalid location data');
    }
    const records = await executeQuery('addJobLocation', { jobId, latitude, longitude, address });
    return records[0]?.loc?.properties || null;
  },

  getJobLocationById: async (jobId) => {
    const records = await executeQuery('getJobLocationById', { jobId });
    return records[0]?.loc?.properties || null;
  },

  getJobsNearLocation: async (latitude, longitude, radius = 5) => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || radius <= 0) {
      throw new Error('Invalid geolocation parameters');
    }
    const records = await executeQuery('getJobsNearLocation', { latitude, longitude, radius });
    return records.map(r => ({
      job: r.job?.properties || null,
      location: r.loc?.properties || null,
      distance: r.dist
    }));
  }
};

module.exports = mapModel;