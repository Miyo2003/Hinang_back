module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },
  database: {
    neo4j: {
      uri: process.env.NEO4J_URI || process.env.ITU_URI || 'bolt://localhost:7687',
      user: process.env.NEO4J_USER || process.env.ITU_USER || 'neo4j',
      password: process.env.NEO4J_PASSWORD || process.env.ITU_PASS || 'password',
      database: process.env.NEO4J_DATABASE || 'neo4j'
    }
  }
};
