// services/verificationService.js

const crypto = require('crypto');
const path = require('path');
const initializeDriver = require('../db/neo4j');
const { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE } = process.env;

// Use the same driver initialization logic as userModel.js
const driver = initializeDriver({
  uri: NEO4J_URI,
  user: NEO4J_USER,
  password: NEO4J_PASSWORD,
  database: NEO4J_DATABASE || 'neo4j',
});

const EMAIL_TOKEN_TTL_HOURS = parseInt(process.env.EMAIL_TOKEN_TTL_HOURS || '24', 10);

const createEmailToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[oldRel:HAS_EMAIL_TOKEN]->(oldToken:EmailVerification {type: 'token'})
      DETACH DELETE oldToken
      CREATE (token:EmailVerification {
        token: $token,
        type: 'token',
        createdAt: datetime(),
        expiresAt: datetime($expiresAt)
      })
      MERGE (u)-[:HAS_EMAIL_TOKEN]->(token)
      RETURN token
      `,
      { userId, token, expiresAt }
    );
    return token;
  } finally {
    await session.close();
  }
};

const createEmailCode = async (userId) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (u:User {id: $userId})
      OPTIONAL MATCH (u)-[oldRel:HAS_EMAIL_TOKEN]->(oldCode:EmailVerification {type: 'code'})
      DETACH DELETE oldCode
      CREATE (codeNode:EmailVerification {
        code: $code,
        type: 'code',
        createdAt: datetime(),
        expiresAt: datetime($expiresAt)
      })
      MERGE (u)-[:HAS_EMAIL_TOKEN]->(codeNode)
      RETURN codeNode
      `,
      { userId, code, expiresAt }
    );
    return code;
  } finally {
    await session.close();
  }
};

const consumeEmailToken = async (token) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User)-[rel:HAS_EMAIL_TOKEN]->(token:EmailVerification {token: $token})
      WHERE token.expiresAt > datetime()
      SET u.emailVerified = true,
          u.emailVerifiedAt = datetime()
      DETACH DELETE token
      RETURN u
      `,
      { token }
    );

    const record = result.records[0];
    return record ? record.get('u').properties : null;
  } finally {
    await session.close();
  }
};

const consumeEmailCode = async (code) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User)-[rel:HAS_EMAIL_TOKEN]->(codeNode:EmailVerification {code: $code, type: 'code'})
      WHERE codeNode.expiresAt > datetime()
      SET u.emailVerified = true,
          u.emailVerifiedAt = datetime()
      DETACH DELETE codeNode
      RETURN u
      `,
      { code }
    );

    const record = result.records[0];
    return record ? record.get('u').properties : null;
  } finally {
    await session.close();
  }
};

module.exports = {
  createEmailToken,
  createEmailCode,
  consumeEmailToken,
  consumeEmailCode
};
