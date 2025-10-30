module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'),
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
    geoapifyApiKey: process.env.GEOAPIFY_API_KEY || '5305a48abf7045e6aa7acf59cada2101',
    defaultRadius: 5000, // in meters
    maxRadius: 50000, // in meters
    defaultCenter: {
      lat: 5.0296, // Bongao, Tawi-Tawi coordinates
      lng: 119.7731,
      zoom: 12
    },
    bounds: {
      // Bongao, Tawi-Tawi bounds
      north: 5.1,
      south: 4.9,
      east: 119.9,
      west: 119.6
    }
  }
};
