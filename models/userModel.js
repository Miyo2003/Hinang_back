const fs = require("fs");
const path = require("path");
const driver = require('../db/neo4j');

const loadQueries = () => {
    const queryDir = path.join(__dirname, '../queries/user');
    const queryFiles = fs.readdirSync(queryDir);
    const queries = {};

    queryFiles.forEach(file => {
        const queryName = path.basename(file, '.cypher');
        queries[queryName] = fs.readFileSync(path.join(queryDir, file), 'utf8');
    });
    return queries;
};

const executeQuery = async (queryName, params = {}) => {
  let session;
  try {
    const queries = loadQueries();
    const query = queries[queryName];
    if (!query) {
      throw new Error(`Query '${queryName}' not found in /queries/user`);
    }
    session = driver.session();
    const result = await session.run(query, params);
    return result.records.map(record => {
      const recordObj = {};
      record.keys.forEach(key => {
        recordObj[key] = record.get(key);
      });
      return recordObj;
    });
  } catch (error) {
    console.error(`[userModel] Error executing query '${queryName}':`, error);
    throw new Error(`[userModel] ${error.message}`);
  } finally {
    if (session) await session.close();
  }
};

  const userModel = {
    // Create a new user
    createUser: async (userData) => {
      const records = await executeQuery('createUser', userData);
      return records[0]?.user?.properties || null;
    },

    // Get all users
    getUsers: async () => {
      const records = await executeQuery('getUser');
      return records.map(record => record.user?.properties || null).filter(Boolean);
    },

    // Get user by ID
    getUserById: async (id) => {
      const records = await executeQuery('getUserById', { id });
      return records[0]?.user?.properties || null;
    },

    // Find user by username (for login)
    findByUsername: async (username) => {
      const records = await executeQuery('findByUsername', { username });
      return records[0]?.user?.properties || null;
    },

  
    // Update user by ID (individual properties)
    updateUser: async (id, userData) => {
      const records = await executeQuery('updateUser', { id, ...userData });
      return records[0]?.user || null;
    },
  
    // Update user by ID (with properties map)
    updateUserById: async (id, updates) => {
      const records = await executeQuery('updateUserById', { id, updates });
      return records[0]?.user || null;
    },
  
    // Delete all users
    deleteUsers: async () => {
      return await executeQuery('deleteUser');
    },
  
    // Delete user by ID
    deleteUserById: async (id) => {
      const records = await executeQuery('deleteUserById', { id });
      return records[0]?.deleteUser || null;
    },
  
    // Insert a new node and connect to user
    insertNodeToUser: async (id, label, props, relation) => {
      // Special handling for dynamic label and relation
      const session = driver.session();
      try {
        // Load the base query
        const queries = loadQueries();
        let query = queries.insertNodeToUser;
        
        // Replace placeholders with actual values
        query = query.replace('`${label}`', label);
        query = query.replace('`$relation`', relation);
        
        const result = await session.run(query, { id, props });
        const record = result.records[0];
        
        if (record) {
          return {
            user: record.get('user'),
            node: record.get('n')
          };
        }
        return null;
      } catch (error) {
        console.error('Error inserting node to user:', error);
        throw error;
      } finally {
        await session.close();
      }
    }
  };
  
  module.exports = userModel;