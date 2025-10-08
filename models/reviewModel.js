const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/review');
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

const reviewModel = {
  createReview: async (reviewerId, targetId, rating, comment) => {
    const records = await executeQuery('createReview', { reviewerId, targetId, rating, comment });
    return records[0]?.r || null;
  },

  getReviewsForUser: async (userId) => {
    const records = await executeQuery('getReviewsForUser', { userId });
    return records.map(record => ({ review: record.r, reviewer: record.reviewer }));
  },

  getReviewsByReviewer: async (reviewerId) => {
    const records = await executeQuery('getReviewsByReviewer', { reviewerId });
    return records.map(record => ({ review: record.r, target: record.target }));
  },

  deleteReviewById: async (id) => {
    const records = await executeQuery('deleteReviewById', { id });
    return records[0]?.deletedReview || null;
  }
};

module.exports = reviewModel;
