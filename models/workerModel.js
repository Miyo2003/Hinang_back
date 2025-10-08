// models/workerModel.js
const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');// Import the driver from your existing file

// Load all queries from files
const loadQueries = () => {
    const queryDir = path.join(__dirname, '../queries/worker');
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
    
    if (!query) {
      throw new Error(`Query ${queryName} not found`);
    }
    
    const result = await session.run(query, params);
    return result.records.map(record => {
      const recordObj = {};
      record.keys.forEach(key => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });
  } catch (error) {
    console.error(`Error executing ${queryName}:`, error);
    throw error;
  } finally {
    await session.close();
  }
};

const workerModel = {

  createWorker: async (workerData) => {
    const records = await executeQuery('createWorker', workerData);
    return records[0]?.worker || null;
  },

  // Get all workers
  getWorkers: async () => {
    const records = await executeQuery('getWorker');
    return records.map(record => record.worker);
  },

  // Get worker by ID
  getWorkerById: async (id) => {
    const records = await executeQuery('getWorkerById', { id });
    return records[0] || null; // Returns worker and user if available
  },

  // Update worker by ID (individual properties)
  updateWorker: async (id, workerData) => {
    const records = await executeQuery('updateWorker', { id, ...workerData });
    return records[0]?.worker || null;
  },

  // Update worker by ID (with properties map)
  updateWorkerById: async (id, updates) => {
    const records = await executeQuery('updateWorkerById', { id, updates });
    return records[0]?.worker || null;
  },

  // Delete all workers
  deleteWorkers: async () => {
    return await executeQuery('deleteWorker');
  },

  // Delete worker by ID
  deleteWorkerById: async (id) => {
    const records = await executeQuery('deleteWorkerById', { id });
    return records[0]?.deleteWorker || null;
  },

  // Insert a new node and connect to worker
  insertNodeToWorker: async (id, label, props, relation) => {
    const session = driver.session();
    try {
      const queries = loadQueries();
      let query = queries.insertNodeToWorker;
      
      if (!query) {
        throw new Error('insertNodeToWorker query not found');
      }
      
      // Replace placeholders with actual values
      query = query.replace('`${label}`', label);
      query = query.replace('`$relation`', relation);
      
      const result = await session.run(query, { id, props });
      const record = result.records[0];
      
      if (record) {
        return {
          worker: record.get('worker'),
          node: record.get('n')
        };
      }
      return null;
    } catch (error) {
      console.error('Error inserting node to worker:', error);
      throw error;
    } finally {
      await session.close();
    }
  },
  // Get workers by user ID - now using the query file
  getWorkersByUserId: async (userId) => {
    const records = await executeQuery('getWorkersByUserId', { userId });
    return records.map(record => record.worker);
  }

};

module.exports = workerModel;