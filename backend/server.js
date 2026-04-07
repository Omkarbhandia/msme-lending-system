require('dotenv').config();
const app = require('./src/app');
const { connectPostgres, connectMongo } = require('./src/config/database');
const logger = require('./src/utils/logger');

// Start the decision queue worker
require('./src/jobs/decisionWorker');

const PORT = parseInt(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectPostgres();
    await connectMongo();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📋 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🏥 Health: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => logger.info('SIGTERM received, shutting down gracefully'));
process.on('SIGINT', () => {
  logger.info('SIGINT received');
  process.exit(0);
});

startServer();
