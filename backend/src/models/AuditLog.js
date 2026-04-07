const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true },   // e.g. PROFILE_CREATED, APPLICATION_SUBMITTED, DECISION_MADE
    entityId: { type: String, required: true },
    entityType: { type: String, required: true },  // e.g. profile, application, decision
    payload: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

// TTL index: auto-delete audit logs after 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
