// models/userModel.js
const path = require('path');
const initializeDriver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/user'));

const resolveNeo4jConfig = () => {
  if (global.__neo4jConfig) {
    return global.__neo4jConfig;
  }

  const {
    NEO4J_URI,
    NEO4J_USER,
    NEO4J_PASSWORD,
    NEO4J_DATABASE,
  } = process.env;

  if (!NEO4J_URI || !NEO4J_USER || !NEO4J_PASSWORD) {
    throw new Error(
      'Neo4j configuration is missing. Set NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, and optionally NEO4J_DATABASE, ' +
        'or call initializeDriver(config) before requiring models/userModel.js.',
    );
  }

  const config = {
    uri: NEO4J_URI,
    user: NEO4J_USER,
    password: NEO4J_PASSWORD,
    database: NEO4J_DATABASE || 'neo4j',
  };

  global.__neo4jConfig = config;
  return config;
};

let cachedDriver = global.__neo4jDriver || null;

const getDriver = () => {
  if (cachedDriver) {
    return cachedDriver;
  }

  const config = resolveNeo4jConfig();
  cachedDriver = initializeDriver(config);
  global.__neo4jDriver = cachedDriver;
  return cachedDriver;
};

const createSession = () => {
  const driver = getDriver();
  if (!driver || typeof driver.session !== 'function') {
    throw new Error(
      'Neo4j driver is not initialised correctly. ' +
        'Ensure initializeDriver(config) has been called with valid credentials.',
    );
  }

  const { database = 'neo4j' } = resolveNeo4jConfig();
  return driver.session({ database });
};

const executeQuery = async (queryName, params = {}) => {
  const session = createSession();

  try {
    const cypher = queries[queryName];
    if (!cypher) {
      throw new Error(`Query '${queryName}' not found in /queries/user`);
    }

    const result = await retry(async () => await session.run(cypher, params));
    return result.records;
  } catch (error) {
    console.error(`[userModel] Error executing query '${queryName}':`, error);
    throw new Error(`[userModel] ${error.message}`);
  } finally {
    if (session && typeof session.close === 'function') {
      await session.close();
    }
  }
};

const userModel = {
  createUser: async (userData) => {
    console.log('[userModel] Creating user with data:', {
      ...userData,
      password: '[REDACTED]' // Don't log the actual password
    });

    // Validate required fields
    const requiredFields = ['email', 'password', 'username'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
    }

    // Ensure all optional fields are defined (set to null if undefined) to satisfy Cypher query parameters
    const sanitizedData = {
      email: userData.email,
      password: userData.password,
      username: userData.username,
      role: userData.role || 'client',
      firstName: userData.firstName || null,
      middleName: userData.middleName || null,
      familyName: userData.familyName || null,
      phoneNumber: userData.phoneNumber || null,
      gender: userData.gender || null,
      age: userData.age || null,
      status: userData.status || 'pending',
      emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : false,
      address: userData.address || null,
      latitude: userData.latitude || null,
      longitude: userData.longitude || null,
      placeId: userData.placeId || null
    };

    try {
      const records = await executeQuery('createUser', sanitizedData);
      const node = records[0]?.get('user');
      if (!node) {
        throw new Error('Failed to create user - no user node returned');
      }
      return node.properties;
    } catch (error) {
      console.error('[userModel] Error creating user:', error);
      throw error;
    }
  },

  getUsers: async () => {
    const records = await executeQuery('getUser');
    return records
      .map((record) => record.get('user')?.properties)
      .filter(Boolean);
  },

  getUserById: async (id) => {
    const records = await executeQuery('getUserById', { id });
    const node = records[0]?.get('user');
    return node?.properties || null;
  },

  getUserByEmail: async (email) => {
    const records = await executeQuery('getUserByEmail', {
      email: email.toLowerCase(),
    });
    const node = records[0]?.get('user');
    return node?.properties || null;
  },

  findByUsername: async (username) => {
    const records = await executeQuery('findByUsername', { username });
    const node = records[0]?.get('user');
    return node?.properties || null;
  },

  updateUser: async (id, userData) => {
    const records = await executeQuery('updateUser', { id, ...userData });
    const node = records[0]?.get('user');
    return node?.properties || null;
  },

  updateUserById: async (id, updates) => {
    const records = await executeQuery('updateUserById', { id, updates });
    const node = records[0]?.get('user');
    return node?.properties || null;
  },

  deleteUsers: async () => {
    await executeQuery('deleteUser');
    return true;
  },

  deleteUserById: async (id) => {
    const records = await executeQuery('deleteUserById', { id });
    return records[0]?.get('deleteUser') || null;
  },

  // Updated: Use APOC for safe dynamic node creation (no interpolation)
  insertNodeToUser: async (id, label, props, relation) => {
    const allowedLabels = ['Profile', 'Wallet', 'Skill', 'Attachment']; // Example whitelist
    const allowedRelations = ['HAS_PROFILE', 'HAS_WALLET', 'HAS_SKILL', 'HAS_ATTACHMENT'];

    if (!allowedLabels.includes(label)) throw new Error(`Invalid label: ${label}`);
    if (!allowedRelations.includes(relation)) throw new Error(`Invalid relation: ${relation}`);

    const session = driver.session();
    try {
      const query = `
        MATCH (user:User {id: $id})
        CALL apoc.create.node([apoc.text.capitalize($label)], $props) YIELD node AS n
        WITH user, n
        CALL apoc.create.relationship(user, apoc.text.upper($relation), {}, n) YIELD rel
        RETURN user, n
      `;
      const result = await retry(async () => await session.run(query, { id, label, props, relation }));
      const record = result.records[0];
      if (!record) return null;
      return {
        user: record.get('user')?.properties || null,
        node: record.get('n')?.properties || null,
      };
    } finally {
      if (session && typeof session.close === 'function') {
        await session.close();
      }
    }
  },

  updateKycStatus: async (userId, status, reviewerId, notes) => {
    const records = await executeQuery('updateKycStatus', {
      userId,
      status,
      reviewerId,
      notes,
      reviewedAt: new Date().toISOString(),
    });
    const node = records[0]?.get('user');
    return node?.properties || null;
  },

  appendReputationSnapshot: async (userId, snapshot) => {
    const records = await executeQuery('appendReputationSnapshot', {
      userId,
      snapshot: {
        ...snapshot,
        recordedAt: new Date().toISOString(),
      },
    });
    const node = records[0]?.get('snapshot');
    return node?.properties || null;
  },

  getReputationHistory: async (userId) => {
    const records = await executeQuery('getReputationHistory', { userId });
    return records
      .map((record) => record.get('snapshot')?.properties)
      .filter(Boolean);
  },
};

module.exports = userModel;