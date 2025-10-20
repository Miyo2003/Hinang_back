// services/intelligence/predictiveTimelineService.js
const driver = require('../../db/neo4j');
const { assertFeatureEnabled } = require('../../utils/featureToggle');

const estimateTimeline = async ({ jobId }) => {
  assertFeatureEnabled('predictiveTimelineEnabled');
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (job:Job {id: $jobId})-[:BELONGS_TO_CATEGORY]->(category:Category)
      MATCH (past:Job)-[:BELONGS_TO_CATEGORY]->(category)
      WHERE past.status = 'completed'
      OPTIONAL MATCH (past)-[:HAS_MILESTONE]->(m:Milestone)
      WITH past, avg(duration.inDays(m.createdAt, m.completedAt)) AS avgMilestoneDuration, count(m) AS milestoneCount
      RETURN avg(avgMilestoneDuration) AS avgMilestoneDuration, avg(milestoneCount) AS avgMilestones
      `
    );

    const record = result.records[0];
    if (!record) {
      return {
        jobId,
        estimatedDays: 7,
        milestoneCount: 3,
        confidence: 0.4
      };
    }

    const avgMilestoneDuration = record.get('avgMilestoneDuration') ?? 2;
    const avgMilestones = record.get('avgMilestones') ?? 3;

    return {
      jobId,
      estimatedDays: Math.max(1, Math.round(avgMilestoneDuration * avgMilestones)),
      milestoneCount: Math.max(1, Math.round(avgMilestones)),
      confidence: 0.65
    };
  } finally {
    await session.close();
  }
};

module.exports = {
  estimateTimeline
};