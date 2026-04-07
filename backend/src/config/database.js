const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// ─── PostgreSQL (Sequelize) ────────────────────────────────────────────────
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    })
  : new Sequelize(
      process.env.PG_DB,
      process.env.PG_USER,
      process.env.PG_PASSWORD,
      {
        host: process.env.PG_HOST || 'localhost',
        port: parseInt(process.env.PG_PORT) || 5432,
        dialect: 'postgres',
        logging: (msg) => logger.debug(msg),
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      }
    );

const connectPostgres = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  logger.info('PostgreSQL connected and synced');
};

// ─── MongoDB (Mongoose) ────────────────────────────────────────────────────
const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  logger.info('MongoDB connected');
};

module.exports = { sequelize, connectPostgres, connectMongo };
