const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/post');
  const queryFiles = fs.readdirSync(queryDir);
  const queries = {};
  queryFiles.forEach(file => {
    const queryName = path.basename(file, '.cypher');
    queries[queryName] = fs.readFileSync(path.join(queryDir, file), 'utf8');
  });
  return queries;
};

const executeQuery = async (queryName, params = {}) => {
  let session;
  try {
    const queries = loadQueries();
    const query = queries[queryName];
    if (!query) throw new Error(`Query ${queryName} not found`);
    session = driver.session();
    const result = await session.run(query, params);
    return result.records.map(record => {
      const recordObj = {};
      record.keys.forEach(key => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });
  } finally {
    if (session) await session.close();
  }
};

const postModel = {
  create: async (userId, content) => {
    const records = await executeQuery('create', { userId, content });
    return records[0]?.post?.properties || null;
  },
  listFeed: async () => {
    const records = await executeQuery('listFeed');
    return records.map(r => r.post?.properties || null).filter(Boolean);
  },
  getById: async (id) => {
    const records = await executeQuery('getById', { id });
    return records[0]?.post?.properties || null;
  },
  delete: async (id) => {
    await executeQuery('delete', { id });
    return true;
  },
  listByUser: async (userId) => {
    const records = await executeQuery('listByUser', { userId });
    return records.map(r => r.post?.properties || null).filter(Boolean);
  }
};

module.exports = postModel;
