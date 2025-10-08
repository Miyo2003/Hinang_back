const fs = require('fs');
const path = require('path');
const driver = require('../db/neo4j');

// Load all queries from files in /queries/client
const loadQueries = () => {
  const queryDir = path.join(__dirname, '../queries/client');
  const queryFiles = fs.readdirSync(queryDir);
  const queries = {};

  queryFiles.forEach(file => {
    const queryName = path.basename(file, '.cypher');
    queries[queryName] = fs.readFileSync(path.join(queryDir, file), 'utf8');
  });

  return queries;
};

// Reusable executor
const executeQuery = async (queryName, params = {}) => {
  const session = driver.session();
  try {
    const queries = loadQueries();
    const query = queries[queryName];

    if (!query) throw new Error(`Query ${queryName} not found`);

    const result = await session.run(query, params);
    return result.records.map(record => {
      const recordObj = {};
      record.keys.forEach(key => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });
  } catch (error) {
    console.error(`Error executing ${queryName}:`, error);
    throw error;
  } finally {
    await session.close();
  }
};

const clientModel = {
  // Create a new client for a user
  createClient: async (clientData) => {
    const records = await executeQuery('createClient', clientData);
    return records[0]?.client || null;
  },

  // Get all clients with pagination and sorting
  getClients: async ({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' }) => {
    const skip = (page - 1) * limit;
    
    // Get paginated and sorted results
    const records = await executeQuery('getClient', { 
      skip, 
      limit, 
      sortBy,
      order: order.toLowerCase()
    });
    
    // Get total count for pagination
    const countResult = await executeQuery('getClientCount');
    
    return {
      clients: records.map(record => {
        const client = record.client.properties;
        return {
          id: client.id,
          clientType: client.clientType,
          serviceRequired: client.serviceRequired,
          budget: client.budget,
          contactPerson: client.contactPerson,
          contactPreference: client.contactPreference,
          createdAt: client.createdAt
        };
      }),
      total: parseInt(countResult[0]?.count || '0')
    };
  },

  // Get client by ID
  getClientById: async (id) => {
    const records = await executeQuery('getClientById', { id });
    return records[0] || null; // returns client and maybe user
  },

  // Get clients of a user
  getClientUserById: async (userId) => {
    const records = await executeQuery('getClientUserById', { userId });
    return records.map(record => record.client);
  },

  // Update client by ID
  updateClient: async (id, clientData) => {
    const records = await executeQuery('updateClient', { id, ...clientData });
    return records[0]?.client || null;
  },

  // Update client with properties map
  updateClientById: async (id, updates) => {
    const records = await executeQuery('updateClientById', { id, updates });
    return records[0]?.client || null;
  },

  // Delete all clients
  deleteClients: async () => {
    return await executeQuery('deleteClient');
  },

  // Delete client by ID
  deleteClientById: async (id) => {
    const records = await executeQuery('deleteClientById', { id });
    return records[0]?.deleteClient || null;
  },

  // Insert node connected to client
  insertNodeToClient: async (id, label, props, relation) => {
    const session = driver.session();
    try {
      const queries = loadQueries();
      let query = queries.insertNodeToClient;

      if (!query) throw new Error('insertNodeToClient query not found');

      // Replace dynamic placeholders
      query = query.replace('`${label}`', label);
      query = query.replace('`$relation`', relation);

      const result = await session.run(query, { id, props });
      const record = result.records[0];

      if (record) {
        return {
          client: record.get('client'),
          node: record.get('n')
        };
      }
      return null;
    } catch (error) {
      console.error('Error inserting node to client:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
};

module.exports = clientModel;
