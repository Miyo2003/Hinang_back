const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hinang API',
      version: '1.0.0',
      description: 'API documentation for Hinang',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'locla host' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      }
    },
    security: [
      { bearerAuth: [] } // Apply JWT security globally
    ]
  },
  // Path to your route files with JSDoc comments
  apis: [path.join(__dirname, 'routes', '**/*.js')]
};

const specs = swaggerJsdoc(options);

module.exports = specs;