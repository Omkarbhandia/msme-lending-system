const logger = require('../utils/logger');

/**
 * Centralized error handling middleware.
 * Maps known error types to appropriate HTTP responses.
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} - ${err.message}`, { stack: err.stack });

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? err.errors.map((e) => e.message) : [err.message];
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      messages,
    });
  }

  // Joi validation errors (thrown manually)
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      messages: err.details.map((d) => d.message),
    });
  }

  // Not found errors
  if (err.status === 404) {
    return res.status(404).json({ success: false, error: 'NOT_FOUND', message: err.message });
  }

  // Generic server error
  return res.status(err.status || 500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
};

const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.path}`);
  err.status = 404;
  next(err);
};

module.exports = { errorHandler, notFound };
