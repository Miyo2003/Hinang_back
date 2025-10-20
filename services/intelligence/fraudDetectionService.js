// services/intelligence/fraudDetectionService.js
const driver = require('../../db/neo4j');
const { assertFeatureEnabled } = require('../../utils/featureToggle');
const { queueNotification } = require('../notificationDispatcher');

const runFraudCheck = async ({ paymentId }) => {
  assertFeatureEnabled('fraudDetectionEnabled');
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (payment:Payment {id: $paymentId})<-[:TRACKS_PAYMENT]-(job:Job)
      MATCH (job)<-[:ASSIGNED_TO]-(worker:Worker)<-[:OWNED_BY]-(workerUser:User)
      MATCH (job)<-[:OWNS]-(client:User)
      WITH payment, job, workerUser, client,
           abs(payment.amount - coalesce(job.budget, 0)) AS amountDelta
      WHERE amountDelta > 500 OR payment.amount > job.budget * 2
      RETURN payment.id AS paymentId, client.id AS clientId, workerUser.id AS workerId
      `,
      { paymentId }
    );

    if (result.records.length) {
      const record = result.records[0];
      queueNotification({
        userId: record.get('clientId'),
        type: 'fraud-alert',
        message: `Unusual payment detected for job ${record.get('paymentId')}`,
        link: `/payments/${paymentId}`,
        sendPush: true
      });
    }
  } finally {
    await session.close();
  }
};

module.exports = {
  runFraudCheck
};