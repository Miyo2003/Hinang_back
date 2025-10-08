const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

// Load queries from /queries/map
const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/map');
  const queryFiles = fs.readdirSync(queryDir);
  const queries = {};

  queryFiles.forEach(file => {
    const queryName = path.basename(file, '.cypher');
    queries[queryName] = fs.readFileSync(path.join(queryDir, file), 'utf8');
  });

  return queries;
};

// Query executor
const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const queries = loadQueries();
    const query = queries[queryName];

    if (!query) throw new Error(`Query ${queryName} not found`);

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

const mapModel = {
  // Add a location to a job
  addJobLocation: async (jobId, latitude, longitude, address) => {
    const records = await executeQuery('addJobLocation', { jobId, latitude, longitude, address });
    return records[0] || null;
  },

  // Get all job locations
  getJobLocations: async () => {
    const records = await executeQuery('getJobLocations');
    return records.map(record => ({ job: record.job, location: record.loc }));
  },

  // Get location for a specific job
  getJobLocationById: async (jobId) => {
    const records = await executeQuery('getJobLocationById', { jobId });
    return records[0] || null;
  },

  // Delete job location
  deleteJobLocation: async (jobId) => {
    const records = await executeQuery('deleteJobLocation', { jobId });
    return records[0]?.job || null;
  },

  // Get jobs near a point (requires Neo4j Spatial/ APOC)
  getJobsNearLocation: async (latitude, longitude, radius) => {
    const records = await executeQuery('getJobsNearLocation', { latitude, longitude, radius });
    return records.map(record => ({
      job: record.job,
      location: record.loc,
      distance: record.dist
    }));
  }
};

module.exports = mapModel;
