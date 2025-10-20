// models/applicationModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');

const queries = loadQueries(path.join(__dirname, '../queries/application'));

const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[queryName];
    if (!query) throw new Error(`Query "${queryName}" not found`);

    const result = await session.run(query, params);
    return result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => obj[key] = record.get(key));
      return obj;
    });
  } finally {
    await session.close();
  }
};

const applicationModel = {
  applyToJob: async (workerId, jobId) => {
    if (!workerId || !jobId) throw new Error('WorkerId and JobId are required');
    const records = await executeQuery('applyToJob', { workerId, jobId });
    return records[0] || null;
  },

  getApplicationsByJobId: async (jobId) => {
    if (!jobId) throw new Error('JobId is required');
    return await executeQuery('getApplicationsByJobId', { jobId });
  },

  getApplicationsByWorkerId: async (workerId) => {
    if (!workerId) throw new Error('WorkerId is required');
    return await executeQuery('getApplicationsByWorkerId', { workerId });
  },

  updateApplicationStatus: async (id, status) => {
    if (!id || !status) throw new Error('Application ID and status are required');
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      throw new Error('Invalid status. Must be pending, accepted, or rejected');
    }
    const records = await executeQuery('updateApplicationStatus', { id, status });
    return records[0]?.app || null;
  },

  deleteApplication: async (id) => {
    if (!id) throw new Error('Application ID is required');
    const records = await executeQuery('deleteApplication', { id });
    return records[0]?.result || null;
  }
};

module.exports = applicationModel;