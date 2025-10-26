// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const cron = require('node-cron');
const logger = require('./utils/logger');
const morgan = require('morgan');
const specs = require('./swagger');
const config = require('./config');
const { isFeatureEnabled } = require('./utils/featureToggle');
const { initSocket } = require('./utils/socket');
const scheduleJobs = require('./scheduler');
const runMessageExpiryJob = require('./scheduler/messageExpiryJob');

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

// ✅ SET GLOBAL NEO4J CONFIG FIRST - BEFORE ANY ROUTES ARE REQUIRED
const neo4jConfig = {
  uri: config.database.neo4j.uri,
  user: config.database.neo4j.user,
  password: config.database.neo4j.password,
  database: config.database.neo4j.database
};

console.log('Connecting to Neo4j with config:', {
  ...neo4jConfig,
  password: '***' // Hide password in logs
});

// Set global config BEFORE any models are loaded
global.__neo4jConfig = neo4jConfig;

// Initialize driver and set it globally
const driver = require('./db/neo4j')(neo4jConfig);
global.__neo4jDriver = driver;

// ✅ NOW require routes AFTER Neo4j is configured
const app = express();
const server = http.createServer(app);
initSocket(server);
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
const { authMiddleware } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const PORT = config.server.port;

app.use(cors({
  origin: config.server.corsOrigin || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/payments/webhook', express.raw({ type: 'application/json' }));

// ✅ Routes are required AFTER Neo4j config is set
app.use('/auth', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/clients', require('./routes/clientRoutes'));
app.use('/workers', require('./routes/workerRoutes'));
app.use('/jobs', require('./routes/jobRoutes'));
app.use('/job-lifecycle', require('./routes/jobLifecycleRoutes'));
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
app.use('/profile', require('./routes/profileRoutes')); // Alias for /profiles
app.use('/services', require('./routes/serviceRoutes'));
app.use('/wallets', require('./routes/walletRoutes'));
app.use('/wallet', require('./routes/walletRoutes')); // Alias for /wallets
app.use('/attachments', require('./routes/attachmentRoutes'));
app.use('/reports', require('./routes/reportRoutes'));
app.use('/analytics', authMiddleware, require('./routes/analyticsRoutes'));
app.use('/presence', require('./routes/presenceRoutes'));
app.use('/meetings', require('./routes/meetingRoutes'));
app.use('/intelligence', require('./routes/intelligenceRoutes'));
app.use('/notification-api', require('./routes/notificationAPIRoutes'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    docExpansion: 'none'
  },
  customSiteTitle: 'Hinang API Docs'
}));

app.get('/', (_req, res) => res.json({
  success: true,
  message: 'API is running 🚀',
  environment: config.server.env,
  version: '1.0.0'
}));

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

scheduleJobs(cron, require('./config/features.json'));

if (isFeatureEnabled('messageRetentionEnabled')) {
  cron.schedule('0 * * * *', async () => {
    console.log('[cron] Purging expired messages...');
    await runMessageExpiryJob();
  });
}

(async () => {
  try {
    const session = driver.session();
    await session.run('RETURN 1');
    await session.close();
    console.log('✅ Connected to Neo4j database');

    server.listen(PORT, config.server.host, () => {
      console.log(`
🚀 Server running at: http://${config.server.host}:${PORT}
📦 Environment: ${config.server.env}
📖 Swagger: http://${config.server.host}:${PORT}/docs
`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();