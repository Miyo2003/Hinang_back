const driver = require('../db/neo4j');

/**
 * Check if a message is expired based on its retention period
 * @param {string} messageId The ID of the message to check
 * @returns {Promise<boolean>} True if the message is expired, false otherwise
 */
async function isMessageExpired(messageId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Message {id: $messageId})
       RETURN datetime(m.createdAt) < datetime() - duration('P30D') as expired`,
      { messageId }
    );
    
    return result.records[0]?.get('expired') || false;
  } finally {
    await session.close();
  }
}

/**
 * Delete expired messages for a chat
 * @param {string} chatId The ID of the chat to clean up
 * @returns {Promise<number>} Number of messages deleted
 */
async function deleteExpiredMessages(chatId) {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Message)-[:IN_CHAT]->(:Chat {id: $chatId})
       WHERE datetime(m.createdAt) < datetime() - duration('P30D')
       WITH m
       DETACH DELETE m
       RETURN count(m) as deletedCount`,
      { chatId }
    );
    
    return result.records[0].get('deletedCount').toNumber();
  } finally {
    await session.close();
  }
}

/**
 * Get the expiration date for a message
 * @param {Date} createdAt The creation date of the message
 * @returns {Date} The expiration date
 */
function getExpirationDate(createdAt) {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 30); // 30 days retention
  return date;
}

module.exports = {
  isMessageExpired,
  deleteExpiredMessages,
  getExpirationDate
};