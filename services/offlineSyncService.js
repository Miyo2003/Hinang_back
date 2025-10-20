// services/offlineSyncService.js
const driver = require('../db/neo4j');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const getSyncData = async ({ userId, since }) => {
  assertFeatureEnabled('offlineModeEnabled');
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (user:User {id: $userId})-[:PARTICIPATES_IN]->(chat:Chat)<-[:IN_CHAT]-(msg:Message)
      WHERE msg.createdAt > datetime($since)
      RETURN chat.id AS chatId, collect(msg) AS messages
      `,
      { userId, since }
    );

    return result.records.map(r => ({
      chatId: r.get('chatId'),
      messages: r.get('messages').map(msg => msg.properties)
    }));
  } finally {
    await session.close();
  }
};

module.exports = {
  getSyncData
};