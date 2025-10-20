// services/recommendationService.js
const driver = require('../db/neo4j');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const getRecommendations = async ({ userId, type = 'workers' }) => {
  assertFeatureEnabled('advancedRecommendationsEnabled');
  const session = driver.session();
  try {
    const query = type === 'jobs'
      ? `
        MATCH (user:User {id: $userId})-[:HAS_SKILL]->(skill:Skill)
        MATCH (job:Job)-[:REQUIRES_SKILL]->(skill)
        RETURN DISTINCT job
        LIMIT 10
      `
      : `
        MATCH (user:User {id: $userId})
        MATCH (user)-[:POSTED]->(job:Job)-[:REQUIRES_SKILL]->(skill:Skill)
        MATCH (worker:Worker)-[:HAS_SKILL]->(skill)
        RETURN DISTINCT worker
        LIMIT 10
      `;

    const result = await session.run(query, { userId });
    return result.records.map(r => {
      const node = r.get(0);
      return node.properties;
    });
  } finally {
    await session.close();
  }
};

module.exports = {
  getRecommendations
};