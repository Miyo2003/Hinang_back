// models/reviewModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/review'));

const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[queryName];
    if (!query) throw new Error(`Query "${queryName}" not found`);
    const result = await retry(async () => await session.run(query, params));
    return result.records.map(record => {
      const obj = {};
      record.keys.forEach(key => obj[key] = record.get(key));
      return obj;
    });
  } finally {
    await session.close();
  }
};

const reviewModel = {
  createReview: async ({ reviewerId, targetUserId, jobId, rating, comment, timestamp = new Date().toISOString() }) => {
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
    const records = await executeQuery('createReview', { reviewerId, targetUserId, jobId, rating, comment, timestamp });
    return records[0]?.r?.properties || null;
  },

  getReviewsByUserId: async (userId) => {
    const records = await executeQuery('getReviewsForUser', { userId });
    return records.map(r => ({
      review: r.r?.properties || null,
      reviewer: r.reviewer?.properties || null
    })).filter(r => r.review);
  },

  getReviewsByReviewerId: async (reviewerId) => {
    const records = await executeQuery('getReviewsByReviewer', { reviewerId });
    return records.map(r => ({
      review: r.r?.properties || null,
      target: r.target?.properties || null
    })).filter(r => r.review);
  },

  deleteReviewById: async (id) => {
    const records = await executeQuery('deleteReviewById', { id });
    return records[0]?.deletedReview?.properties || null;
  }
};

module.exports = reviewModel;