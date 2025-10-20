// models/assignmentModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');

const queries = loadQueries(path.join(__dirname, '../queries/assignment'));

const runQuery = async (name, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[name];
    if (!query) throw new Error(`[assignmentModel] Query "${name}" missing`);
    const result = await session.run(query, params);
    return result.records;
  } finally {
    await session.close();
  }
};

const assignmentModel = {
  assignWorkerToJob: async (workerId, jobId) => {
    const records = await runQuery('assignWorkerToJob', { workerId, jobId });
    return records[0] || null;
  },

  getWorkersForJob: async (jobId) => {
    const records = await runQuery('getWorkersForJob', { jobId });
    return records.map(r => r.worker?.properties).filter(Boolean);
  },

  getJobsForWorker: async (workerId) => {
    const workerExists = await runQuery('checkWorkerExists', { workerId });
    if (!workerExists || workerExists.length === 0) {
      throw new Error(`Worker with ID ${workerId} not found`);
    }
    const records = await runQuery('getJobsForWorker', { workerId });
    return records[0]?.get('jobs')?.map(j => j.properties) || [];
  },

  deleteAssignment: async (workerId, jobId) => {
    const records = await runQuery('deleteAssignment', { workerId, jobId });
    return records[0]?.result || null;
  },

  createInvite: async (payload) => {
    const records = await runQuery('createInvite', payload);
    return records[0]?.get('invite')?.properties || null;
  },

  respondToInvite: async ({ jobId, inviteId, workerId, response, respondedAt }) => {
    const records = await runQuery('respondToInvite', { jobId, inviteId, workerId, response, respondedAt });
    if (records.length === 0) return null;
    const record = records[0];
    return {
      invite: record.get('invite')?.properties || null,
      assignment: record.get('assignment')?.properties || null,
      clientId: record.get('client')?.properties.id || null
    };
  },

  listInvitesForJob: async (jobId) => {
    const records = await runQuery('listInvitesForJob', { jobId });
    return records.map(r => r.get('invite')?.properties).filter(Boolean);
  },

  revokeInvite: async ({ jobId, inviteId, revokedBy, revokedAt }) => {
    const records = await runQuery('revokeInvite', { jobId, inviteId, revokedBy, revokedAt });
    if (!records.length) return null;
    const record = records[0];
    return {
      invite: record.get('invite')?.properties || null,
      workerId: record.get('worker')?.properties.id || null
    };
  }
};

module.exports = assignmentModel;