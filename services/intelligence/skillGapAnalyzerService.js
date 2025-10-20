// services/intelligence/skillGapAnalyzerService.js
const driver = require('../../db/neo4j');
const { assertFeatureEnabled } = require('../../utils/featureToggle');

const analyzeSkillGaps = async ({ workerId }) => {
  assertFeatureEnabled('skillGapAnalyzerEnabled');
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (worker:Worker {id: $workerId})
      MATCH (worker)-[:HAS_SKILL]->(skill:Skill)
      MATCH (job:Job)-[:REQUIRES_SKILL]->(skillRequirement:Skill)
      WHERE NOT (worker)-[:HAS_SKILL]->(skillRequirement)
      WITH skillRequirement.name AS missingSkill, count(job) AS demand
      RETURN missingSkill, demand
      ORDER BY demand DESC
      LIMIT 5
      `,
      { workerId }
    );

    return result.records.map(r => ({
      missingSkill: r.get('missingSkill'),
      demand: r.get('demand').toNumber()
    }));
  } finally {
    await session.close();
  }
};

module.exports = {
  analyzeSkillGaps
};