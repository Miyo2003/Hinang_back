const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/notification');
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
    if (!query) throw new Error(`Query ${queryName} not found`);

    const result = await session.run(query, params);
    return result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => {
        obj[key] = record.get(key);
      });
      return obj;
    });
  } finally {
    await session.close();
  }
};

const notificationModel = {
  createNotification: async (userId, message, type) => {
    const records = await executeQuery('createNotification', { userId, message, type });
    return records[0]?.n || null;
  },

  getNotificationsByUserId: async (userId) => {
    const records = await executeQuery('getNotificationsByUserId', { userId });
    return records.map(record => record.n);
  },

  markNotificationRead: async (id) => {
    const records = await executeQuery('markNotificationRead', { id });
    return records[0]?.n || null;
  },

  deleteNotificationById: async (id) => {
    const records = await executeQuery('deleteNotificationById', { id });
    return records[0]?.deletedNotification || null;
  }
};

module.exports = notificationModel;
