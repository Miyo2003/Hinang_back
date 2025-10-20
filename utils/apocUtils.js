// utils/apocUtils.js
const driver = require('../db/neo4j');

// Helper to create node with APOC (parameterized)
const createNodeWithApoc = async (labels, props) => {
  const session = driver.session();
  try {
    const query = `
      CALL apoc.create.node($labels, $props) YIELD node
      RETURN node
    `;
    const result = await session.run(query, { labels, props });
    return result.records[0]?.get('node')?.properties || null;
  } finally {
    await session.close();
  }
};

// Helper to create relationship with APOC
const createRelationshipWithApoc = async (startNodeId, relType, endNodeId, relProps = {}) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (start {id: $startNodeId}), (end {id: $endNodeId})
      CALL apoc.create.relationship(start, $relType, $relProps, end) YIELD rel
      RETURN rel
    `;
    const result = await session.run(query, { startNodeId, relType, endNodeId, relProps });
    return result.records[0]?.get('rel')?.properties || null;
  } finally {
    await session.close();
  }
};

module.exports = {
  createNodeWithApoc,
  createRelationshipWithApoc
};