// models/workerModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/worker'));

const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[queryName];
    if (!query) throw new Error(`Query "${queryName}" not found in /queries/worker`);

    const result = await retry(async () => await session.run(query, params));
    return result.records.map(record => {
      const recordObj = {};
      record.keys.forEach(key => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });
  } catch (error) {
    console.error(`[workerModel] Error executing query '${queryName}':`, error);
    throw new Error(`[workerModel] ${error.message}`);
  } finally {
    await session.close();
  }
};

const workerModel = {
  createWorker: async (workerData) => {
    const records = await executeQuery('createWorker', workerData);
    return records[0]?.worker?.properties || null;
  },

  getWorkers: async () => {
    const records = await executeQuery('getWorker');
    return records.map(record => record.worker?.properties).filter(Boolean);
  },

  getWorkerById: async (id) => {
    const records = await executeQuery('getWorkerById', { id });
    return records[0]?.worker?.properties || null;
  },

  updateWorkerById: async (id, updates) => {
    const records = await executeQuery('updateWorkerById', { id, updates });
    return records[0]?.worker?.properties || null;
  },

  deleteWorkerById: async (id) => {
    const records = await executeQuery('deleteWorkerById', { id });
    return records[0]?.deleteWorker?.properties || null;
  },

  getWorkersByUserId: async (userId) => {
    const records = await executeQuery('getWorkersByUserId', { userId });
    return records.map(record => record.worker?.properties).filter(Boolean);
  },

  // Updated: Use APOC for safe dynamic node creation
  insertNodeToWorker: async (id, label, props, relation) => {
    const allowedLabels = ['Profile', 'Skill', 'Portfolio', 'Attachment'];
    const allowedRelations = ['HAS_PROFILE', 'HAS_SKILL', 'HAS_PORTFOLIO', 'HAS_ATTACHMENT'];

    if (!allowedLabels.includes(label)) throw new Error(`Invalid label: ${label}`);
    if (!allowedRelations.includes(relation)) throw new Error(`Invalid relation: ${relation}`);

    const session = driver.session();
    try {
      const query = `
        MATCH (worker:Worker {id: $id})
        CALL apoc.create.node([apoc.text.capitalize($label)], $props) YIELD node AS n
        WITH worker, n
        CALL apoc.create.relationship(worker, apoc.text.upper($relation), {}, n) YIELD rel
        RETURN worker, n
      `;
      const result = await retry(async () => await session.run(query, { id, label, props, relation }));
      const record = result.records[0];
      if (!record) return null;
      return {
        worker: record.get('worker')?.properties || null,
        node: record.get('n')?.properties || null
      };
    } finally {
      await session.close();
    }
  }
};

module.exports = workerModel;