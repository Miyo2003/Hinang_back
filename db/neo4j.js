
const neo4j = require('neo4j-driver');

// Singleton instance of the driver
let driverInstance = null;

// Initialize driver with config options
module.exports = function initializeDriver(config = {}) {
  // Return existing driver if already initialized
  if (driverInstance) {
    return driverInstance;
  }

  const { uri, user, password, database } = config;

  if (!uri || !user || !password) {
    throw new Error('Missing Neo4j configuration: uri, user, password');
  }

  // Configuration for the driver
  const driverConfig = {
    maxConnectionPoolSize: 50,
    maxTransactionRetryTime: 30000,
    connectionTimeout: 30000,
    connectionAcquisitionTimeout: 60000,
    logging: {
      level: 'info',
      logger: (level, message) => console.log(`[Neo4j ${level}] ${message}`)
    },
    database: database
  };

  try {
    // Create new driver instance
    driverInstance = neo4j.driver(uri, neo4j.auth.basic(user, password), driverConfig);
    
    // Verify connectivity immediately
    driverInstance.verifyConnectivity()
      .then(() => console.log('Successfully connected to Neo4j database'))
      .catch(err => console.error('Warning: Initial connection test failed:', err));
    
  } catch (err) {
    console.error('Failed to create Neo4j driver:', err);
    throw err;
  }

  // Graceful shutdown handler
  async function shutdown() {
    if (driverInstance) {
      try {
        await driverInstance.close();
        console.log('Neo4j driver closed successfully');
        driverInstance = null;
      } catch (err) {
        console.error('Error while closing Neo4j driver:', err);
      }
    }
    process.exit(0);
  }

  // Register shutdown handlers
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  
  // Handle uncaught errors
  process.on('uncaughtException', async (err) => {
    console.error('Uncaught exception:', err);
    await shutdown();
  });

  return driverInstance;
};