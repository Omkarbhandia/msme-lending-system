const AuditLog = require('../models/AuditLog');
const logger = require('./logger');

/**
 * Writes an audit log entry to MongoDB (fire-and-forget, never throws)
 */
const audit = async ({ eventType, entityId, entityType, payload, req, status = 'SUCCESS', errorMessage }) => {
  try {
    const entry = {
      eventType,
      entityId: String(entityId),
      entityType,
      payload,
      status,
      errorMessage,
      ipAddress: req ? req.ip : undefined,
      userAgent: req ? req.get('user-agent') : undefined,
    };
    await AuditLog.create(entry);
  } catch (err) {
    logger.error('Failed to write audit log:', err);
  }
};

module.exports = { audit };
