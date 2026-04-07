const { decisionQueue } = require('../config/queue');
const { runDecisionEngine } = require('../services/decisionEngine');
const LoanApplication = require('../models/LoanApplication');
const Decision = require('../models/Decision');
const { audit } = require('../utils/auditTrail');
const logger = require('../utils/logger');

/**
 * Bull worker that processes decision jobs from the queue.
 * Each job contains the full data snapshot needed to run the engine.
 */
decisionQueue.process(async (job) => {
  const startTime = Date.now();
  const { applicationId, profileId, pan, monthlyRevenue, loanAmount, tenureMonths, loanPurpose } = job.data;

  logger.info(`[Worker] Processing decision for application: ${applicationId}`);

  // Update status to PROCESSING
  await LoanApplication.update({ status: 'PROCESSING' }, { where: { id: applicationId } });

  // Simulate slight processing delay (realistic async behavior)
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Run the decision engine
  const { creditScore, decision, reasonCodes } = runDecisionEngine({
    pan,
    monthlyRevenue,
    loanAmount,
    tenureMonths,
  });

  const processingTimeMs = Date.now() - startTime;

  // Persist decision to MongoDB
  await Decision.create({
    applicationId,
    profileId,
    creditScore,
    decision,
    reasonCodes,
    rawInputs: { pan, monthlyRevenue, loanAmount, tenureMonths, loanPurpose },
    processingTimeMs,
  });

  // Update application status to DONE
  await LoanApplication.update({ status: 'DONE' }, { where: { id: applicationId } });

  await audit({
    eventType: 'DECISION_MADE',
    entityId: applicationId,
    entityType: 'application',
    payload: { creditScore, decision, reasonCodes, processingTimeMs },
  });

  logger.info(
    `[Worker] Decision for ${applicationId}: ${decision} (score: ${creditScore}, time: ${processingTimeMs}ms)`
  );

  return { applicationId, decision, creditScore };
});

decisionQueue.on('completed', (job, result) => {
  logger.info(`[Queue] Job ${job.id} completed: ${result.decision}`);
});

decisionQueue.on('failed', async (job, err) => {
  logger.error(`[Queue] Job ${job.id} failed: ${err.message}`);
  // Mark application as FAILED
  if (job.data && job.data.applicationId) {
    await LoanApplication.update({ status: 'FAILED' }, { where: { id: job.data.applicationId } });
  }
});

module.exports = decisionQueue;
