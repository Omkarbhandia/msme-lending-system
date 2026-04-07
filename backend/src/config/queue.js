const Bull = require('bull');
const logger = require('../utils/logger');

const redisConfig = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    };

const decisionQueue = new Bull('decision-queue', redisConfig);

decisionQueue.on('error', (err) => logger.error('Queue error:', err));
decisionQueue.on('failed', (job, err) =>
  logger.error(`Job ${job.id} failed:`, err)
);

module.exports = { decisionQueue };
