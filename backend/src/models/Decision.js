const mongoose = require('mongoose');

const decisionSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    profileId: { type: String, required: true },
    creditScore: { type: Number, required: true, min: 300, max: 900 },
    decision: { type: String, enum: ['APPROVED', 'REJECTED'], required: true },
    reasonCodes: [{ type: String }],
    rawInputs: { type: mongoose.Schema.Types.Mixed },
    processingTimeMs: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Decision', decisionSchema);
