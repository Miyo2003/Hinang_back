const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/assignment');
  const queryFiles = fs.readdirSync(queryDir);
  const queries = {};
  queryFiles.forEach(file => {
    const queryName = path.basename(file, '.cypher');
    queries[queryName] = fs.readFileSync(path.join(queryDir, file), 'utf8');
  });
  return queries;
};

const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const queries = loadQueries();
    const query = queries[queryName];
    const result = await session.run(query, params);
    return result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => obj[key] = record.get(key));
      return obj;
    });
  } finally { await session.close(); }
};

const assignmentModel = {
  assignWorkerToJob: async (workerId, jobId) => {
    if (!workerId || !jobId) {
      throw new Error('Worker ID and Job ID are required');
    }
    const records = await executeQuery('assignWorkerToJob', { workerId, jobId });
    return records[0] || null;
  },

  getWorkersForJob: async (jobId) => {
    if (!jobId) {
      throw new Error('Job ID is required');
    }
    const records = await executeQuery('getWorkersForJob', { jobId });
    return records.map(r => r.worker);
  },

  getJobsForWorker: async (workerId) => {
    if (!workerId) {
      throw new Error('Worker ID is required');
    }
    // First check if worker exists
    const workerExists = await executeQuery('checkWorkerExists', { workerId });
    if (!workerExists || workerExists.length === 0) {
      throw new Error(`Worker with ID ${workerId} not found`);
    }
    const records = await executeQuery('getJobsForWorker', { workerId });
    return records.map(r => r.job);
  },

  deleteAssignment: async (workerId, jobId) => {
    if (!workerId || !jobId) {
      throw new Error('Worker ID and Job ID are required');
    }
    const records = await executeQuery('deleteAssignment', { workerId, jobId });
    return records[0]?.result || null;
  }
};

module.exports = assignmentModel;
