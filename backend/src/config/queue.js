const Bull = require('bull');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
};

const decisionQueue = new Bull('decision-queue', { redis: redisConfig });

decisionQueue.on('error', (err) => logger.error('Queue error:', err));
decisionQueue.on('failed', (job, err) =>
  logger.error(`Job ${job.id} failed:`, err)
);

module.exports = { decisionQueue };
