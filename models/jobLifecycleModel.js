// models/jobLifecycleModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/jobLifecycle'));

const runQuery = async (name, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[name];
    if (!query) throw new Error(`[jobLifecycleModel] Query "${name}" missing`);
    const result = await retry(async () => await session.run(query, params));
    return result.records;
  } finally {
    await session.close();
  }
};

const jobLifecycleModel = {
  createMilestone: async (jobId, payload) => {
    const records = await runQuery('createMilestone', { jobId, payload });
    return records[0]?.get('milestone')?.properties || null;
  },

  updateMilestone: async (jobId, milestoneId, updates) => {
    const records = await runQuery('updateMilestone', { jobId, milestoneId, updates });
    return records[0]?.get('milestone')?.properties || null;
  },

  listMilestones: async (jobId) => {
    const records = await runQuery('listMilestones', { jobId });
    return records.map(r => r.get('milestone')?.properties).filter(Boolean);
  },

  appendStatusHistory: async (jobId, statusPayload) => {
    const records = await runQuery('appendStatusHistory', { jobId, statusPayload });
    return records[0]?.get('status')?.properties || null;
  },

  listStatusHistory: async (jobId) => {
    const records = await runQuery('listStatusHistory', { jobId });
    return records.map(r => r.get('status')?.properties).filter(Boolean);
  },

  findOverdueMilestones: async (nowISO) => {
    const records = await runQuery('findOverdueMilestones', { nowISO });
    return records.map(r => ({
      milestone: r.get('milestone').properties,
      job: r.get('job').properties,
      clientId: r.get('client').properties.id,
      workerIds: r.get('workers').map(w => w.properties.id)
    }));
  },

  escalateMilestone: async (jobId, milestoneId, escalationPayload) => {
    const records = await runQuery('escalateMilestone', { jobId, milestoneId, escalationPayload });
    return records[0]?.get('milestone')?.properties || null;
  }
};

module.exports = jobLifecycleModel;