const driver = require('../db/neo4j');

async function runMessageExpiryJob() {
  const session = driver.session();
  try {
    // Delete messages older than the retention period (e.g., 30 days)
    const result = await session.run(`
      MATCH (m:Message)
      WHERE datetime(m.createdAt) < datetime() - duration('P30D')
      DETACH DELETE m
      RETURN count(m) as deletedCount
    `);
    
    const deletedCount = result.records[0].get('deletedCount').toNumber();
    console.log(`Deleted ${deletedCount} expired messages`);
    
    return deletedCount;
  } catch (error) {
    console.error('Error running message expiry job:', error);
    throw error;
  } finally {
    await session.close();
  }
}

module.exports = runMessageExpiryJob;