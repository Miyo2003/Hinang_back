const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/skill');
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

const skillModel = {
  createSkill: async (name) => {
    const records = await executeQuery('createSkill', { name });
    return records[0]?.skill || null;
  },

  getAllSkills: async () => {
    const records = await executeQuery('getAllSkills');
    return records.map(r => r.skill);
  },

  getSkillById: async (id) => {
    const records = await executeQuery('getSkillById', { id });
    return records[0]?.skill || null;
  },

  updateSkill: async (id, name) => {
    const records = await executeQuery('updateSkill', { id, name });
    return records[0]?.skill || null;
  },

  deleteSkill: async (id) => {
    const records = await executeQuery('deleteSkill', { id });
    return records[0]?.result || null;
  },

  getWorkerSkills: async (workerId) => {
    const records = await executeQuery('getWorkerSkills', { workerId });
    return records.map(r => r.skill);
  },

  addSkillToWorker: async (workerId, skillName) => {
    const records = await executeQuery('addSkillToWorker', { workerId, skillName });
    return records[0] || null;
  },
  getWorkersBySkill: async (skillName) => {
    const records = await executeQuery('getWorkersBySkill', { skillName });
    return records.map(r => r.worker);
  },
  categorizeJob: async (jobId, categoryName) => {
    const records = await executeQuery('categorizeJob', { jobId, categoryName });
    return records[0] || null;
  }
};

module.exports = skillModel
