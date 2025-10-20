// models/clientModel.js
const path = require('path');
const driver = require('../db/neo4j');
const loadQueries = require('../utils/cypherLoader');
const { retry } = require('../utils/retryUtils');

const queries = loadQueries(path.join(__dirname, '../queries/client'));

const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const query = queries[queryName];
    if (!query) throw new Error(`Query "${queryName}" not found in /queries/client`);

    const result = await retry(async () => await session.run(query, params));
    return result.records.map(record => {
      const recordObj = {};
      record.keys.forEach(key => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });
  } catch (error) {
    console.error(`[clientModel] Error executing query '${queryName}':`, error);
    throw new Error(`[clientModel] ${error.message}`);
  } finally {
    await session.close();
  }
};

const clientModel = {
  createClient: async (clientData) => {
    const records = await executeQuery('createClient', clientData);
    return records[0]?.client?.properties || null;
  },

  getClients: async ({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' }) => {
    const skip = (page - 1) * limit;
    const records = await executeQuery('getClient', { skip, limit, sortBy, order });
    const countResult = await executeQuery('getClientCount');

    return {
      clients: records.map(record => record.client.properties),
      total: parseInt(countResult[0]?.count || '0')
    };
  },

  getClientById: async (id) => {
    const records = await executeQuery('getClientById', { id });
    return records[0]?.client?.properties || null;
  },

  getClientUserById: async (userId) => {
    const records = await executeQuery('getClientUserById', { userId });
    return records.map(record => record.client?.properties).filter(Boolean);
  },

  updateClientById: async (id, updates) => {
    const records = await executeQuery('updateClientById', { id, updates });
    return records[0]?.client?.properties || null;
  },

  deleteClientById: async (id) => {
    const records = await executeQuery('deleteClientById', { id });
    return records[0]?.deleteClient?.properties || null;
  },

  // Updated: Use APOC for safe dynamic node creation (no interpolation)
  insertNodeToClient: async (id, label, props, relation) => {
    const allowedLabels = ['Profile', 'Contract', 'Service', 'Attachment'];
    const allowedRelations = ['HAS_PROFILE', 'HAS_CONTRACT', 'HAS_SERVICE', 'HAS_ATTACHMENT'];

    if (!allowedLabels.includes(label)) throw new Error(`Invalid label: ${label}`);
    if (!allowedRelations.includes(relation)) throw new Error(`Invalid relation: ${relation}`);

    const session = driver.session();
    try {
      const query = `
        MATCH (client:Client {id: $id})
        CALL apoc.create.node([apoc.text.capitalize($label)], $props) YIELD node AS n
        WITH client, n
        CALL apoc.create.relationship(client, apoc.text.upper($relation), {}, n) YIELD rel
        RETURN client, n
      `;
      const result = await retry(async () => await session.run(query, { id, label, props, relation }));
      const record = result.records[0];
      if (!record) return null;
      return {
        client: record.get('client')?.properties || null,
        node: record.get('n')?.properties || null
      };
    } finally {
      await session.close();
    }
  }
};

module.exports = clientModel;