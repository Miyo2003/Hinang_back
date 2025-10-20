// services/messageSearchService.js
const driver = require('../db/neo4j');
const { assertFeatureEnabled } = require('../utils/featureToggle');

const searchMessages = async ({ query, chatId, limit = 50 }) => {
  assertFeatureEnabled('messageSearchEnabled');
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (chat:Chat {id: $chatId})<-[:IN_CHAT]-(msg:Message)
      WHERE toLower(msg.content) CONTAINS toLower($query)
         OR any(tag IN msg.hashtags WHERE toLower(tag) CONTAINS toLower($query))
         OR any(mention IN msg.mentions WHERE toLower(mention) CONTAINS toLower($query))
      RETURN msg
      ORDER BY msg.createdAt DESC
      LIMIT $limit
      `,
      { chatId, query, limit: parseInt(limit, 10) }
    );
    return result.records.map(rec => rec.get('msg').properties);
  } finally {
    await session.close();
  }
};

module.exports = {
  searchMessages
};