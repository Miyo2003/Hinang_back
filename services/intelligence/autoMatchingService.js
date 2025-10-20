// services/intelligence/autoMatchingService.js
const driver = require('../../db/neo4j');
const { assertFeatureEnabled } = require('../../utils/featureToggle');

const getAutoMatchSuggestions = async ({ jobId, limit = 5 }) => {
  assertFeatureEnabled('autoMatchingEnabled');
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (job:Job {id: $jobId})-[:REQUIRES_SKILL]->(skill:Skill)
      WITH job, collect(skill.name) AS jobSkills
      MATCH (worker:Worker)-[:HAS_SKILL]->(wSkill:Skill)
      OPTIONAL MATCH (worker)-[:ASSIGNED_TO]->(pastJob:Job)
      WITH worker, job, jobSkills, collect(DISTINCT wSkill.name) AS workerSkills, count(DISTINCT pastJob) AS pastExperience
      WITH worker, size(apoc.coll.intersection(jobSkills, workerSkills)) AS matchedSkills, pastExperience
      RETURN worker.id AS workerId, matchedSkills, pastExperience
      ORDER BY matchedSkills DESC, pastExperience DESC
      LIMIT $limit
      `,
      { jobId, limit: parseInt(limit, 10) }
    );

    return result.records.map(r => ({
      workerId: r.get('workerId'),
      matchedSkills: r.get('matchedSkills').toNumber(),
      pastExperience: r.get('pastExperience').toNumber()
    }));
  } finally {
    await session.close();
  }
};

module.exports = {
  getAutoMatchSuggestions
};