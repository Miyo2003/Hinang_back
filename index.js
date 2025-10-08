require('dotenv').config();
const express = require('express');
const cors = require('cors');
const driver = require('./db/neo4j'); // Neo4j driver
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger'); // Swagger spec

const app = express();
const PORT = process.env.PORT || 8000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Routes =====
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/clients', require('./routes/clientRoutes'));
app.use('/workers', require('./routes/workerRoutes'));
app.use('/jobs', require('./routes/jobRoutes'));
app.use('/applications', require('./routes/applicationRoutes'));
app.use('/assignments', require('./routes/assignmentRoutes'));
app.use('/payments', require('./routes/paymentRoutes'));
app.use('/skills', require('./routes/skillRoutes'));
app.use('/messages', require('./routes/messageRoutes'));
app.use('/chats', require('./routes/chatRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/reviews', require('./routes/reviewRoutes'));
app.use('/maps', require('./routes/mapRoutes'));
app.use('/posts', require('./routes/postRoutes'));
app.use('/comments', require('./routes/commentRoutes'));
app.use('/profiles', require('./routes/profileRoutes'));
app.use('/services', require('./routes/serviceRoutes'));
app.use('/wallets', require('./routes/walletRoutes'));
app.use('/attachments', require('./routes/attachmentRoutes'));
app.use('/reports', require('./routes/reportRoutes'));

// ===== Swagger Docs =====
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: "none",
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      requestInterceptor: (request) => {
        if (request.headers && request.headers.Authorization) {
          request.headers.Authorization = request.headers.Authorization;
        }
        return request;
      }
    },
    customSiteTitle: 'Hinang API Docs',
  })
);

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ===== Health Check =====
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running 🚀' });
});

// ===== 404 Handler =====
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// ===== Start Server =====
(async () => {
  try {
    // Test Neo4j Aura connection before starting server
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    console.log('✅ Connected to Neo4j Aura Cloud');

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running at: http://localhost:${PORT}`);
      console.log(`📖 Swagger UI available at: http://localhost:${PORT}/docs\n`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to Neo4j Aura:', err.message);
    process.exit(1);
  }
})();
