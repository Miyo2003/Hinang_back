// models/skillModel.js
const path = require('path');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/skill'));

const executeQuery = async (queryName, params = {}) => {
  const session = global.__neo4jDriver.session();
  try {
    const query = queries[queryName];
    if (!query) {
      throw new Error(`Query ${queryName} not found in /queries/skill`);
    }
    const result = await retry(async () => await session.run(query, params));
    return result.records;
  } finally {
    await session.close();
  }
};

const skillModel = {
  createSkill: async (name) => {
    const records = await executeQuery('createSkill', { name });
    return records[0]?.get('skill')?.properties || null;
  },

  getAllSkills: async () => {
    const records = await executeQuery('getAllSkills');
    return records
      .map(r => r.get('skill')?.properties)
      .filter(Boolean);
  },

  getSkillById: async (id) => {
    const records = await executeQuery('getSkillById', { id });
    return records[0]?.get('skill')?.properties || null;
  },

  updateSkill: async (id, name) => {
    const records = await executeQuery('updateSkill', { id, name });
    return records[0]?.get('skill')?.properties || null;
  },

  deleteSkill: async (id) => {
    const records = await executeQuery('deleteSkill', { id });
    return records[0]?.get('result') || null;
  },

  getWorkerSkills: async (workerId) => {
    const records = await executeQuery('getWorkerSkills', { workerId });
    return records
      .map(r => r.get('skill')?.properties)
      .filter(Boolean);
  },

  getSkillsByUserId: async (userId) => {
    return skillModel.getWorkerSkills(userId);
  },

  addSkillToWorker: async (workerId, skillName) => {
    const records = await executeQuery('addSkillToWorker', { workerId, skillName });
    return records[0] || null;
  },

  getWorkersBySkill: async (skillName) => {
    const records = await executeQuery('getWorkersBySkill', { skillName });
    return records
      .map(r => r.get('worker')?.properties)
      .filter(Boolean);
  },

  categorizeJob: async (jobId, categoryName) => {
    const records = await executeQuery('categorizeJob', { jobId, categoryName });
    return records[0] || null;
  }
};

module.exports = skillModel;