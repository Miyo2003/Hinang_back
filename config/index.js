module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },
  database: {
    neo4j: {
      uri: process.env.NEO4J_URI || process.env.ITU_URI || '0.0.0.0',
      user: process.env.NEO4J_USER || process.env.ITU_USER || 'neo4j',
      password: process.env.NEO4J_PASSWORD || process.env.ITU_PASS || 'password',
      database: process.env.NEO4J_DATABASE || 'neo4j'
    }
  },
  maps: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'your-google-maps-api-key',
    defaultRadius: 5000, // in meters
    maxRadius: 50000 // in meters
  }
};
