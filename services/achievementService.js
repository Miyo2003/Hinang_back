// services/achievementService.js
const driver = require('../db/neo4j');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const getAchievementJourney = async ({ userId }) => {
  assertFeatureEnabled('achievementJourneyEnabled');
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (user:User {id: $userId})
      OPTIONAL MATCH (user)-[:ASSIGNED_TO]->(job:Job)
      OPTIONAL MATCH (user)<-[:RECEIVED_REVIEW]-(review:Review)
      OPTIONAL MATCH (user)-[:COMPLETED_BADGE]->(badge:Badge)
      RETURN user,
             collect(DISTINCT job) AS jobs,
             collect(DISTINCT review) AS reviews,
             collect(DISTINCT badge) AS badges
      `,
      { userId }
    );

    if (!result.records.length) {
      return { userId, milestones: [] };
    }

    const record = result.records[0];
    return {
      userId,
      milestones: [
        {
          type: 'jobs',
          count: record.get('jobs').length,
          items: record.get('jobs').map(job => job.properties)
        },
        {
          type: 'reviews',
          count: record.get('reviews').length,
          items: record.get('reviews').map(review => review.properties)
        },
        {
          type: 'badges',
          count: record.get('badges').length,
          items: record.get('badges').map(badge => badge.properties)
        }
      ]
    };
  } finally {
    await session.close();
  }
};

module.exports = {
  getAchievementJourney
};