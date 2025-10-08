const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/comment');
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

const commentModel = {
  create: async (userId, postId, content) => {
    const records = await executeQuery('create', { userId, postId, content });
    return records[0]?.comment?.properties || null;
  },
  listForPost: async (postId) => {
    const records = await executeQuery('listForPost', { postId });
    return records.map(r => r.comment?.properties || null).filter(Boolean);
  },
  delete: async (id) => {
    await executeQuery('delete', { id });
    return true;
  }
};

module.exports = commentModel;
