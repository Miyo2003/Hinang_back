// services/intelligence/dynamicPricingService.js
const driver = require('../../db/neo4j');
const { assertFeatureEnabled } = require('../../utils/featureToggle');

const suggestPrice = async ({ jobId }) => {
  assertFeatureEnabled('dynamicPricingEnabled');
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (job:Job {id: $jobId})-[:BELONGS_TO_CATEGORY]->(category:Category)
      MATCH (peer:Job)-[:BELONGS_TO_CATEGORY]->(category)
      MATCH (peer)<-[:TRACKS_PAYMENT]-(payment:Payment {status: 'completed'})
      WITH avg(payment.amount) AS avgAmount, percentileCont(payment.amount, 0.75) AS p75, percentileCont(payment.amount, 0.25) AS p25
      RETURN avgAmount, p75, p25
      `
    );

    if (!result.records.length) {
      return {
        jobId,
        suggested: 100,
        low: 75,
        high: 125,
        confidence: 0.4
      };
    }

    const record = result.records[0];
    return {
      jobId,
      suggested: record.get('avgAmount'),
      low: record.get('p25'),
      high: record.get('p75'),
      confidence: 0.7
    };
  } finally {
    await session.close();
  }
};

module.exports = {
  suggestPrice
};