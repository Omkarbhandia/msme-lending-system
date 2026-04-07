const LoanApplication = require('../models/LoanApplication');
const BusinessProfile = require('../models/BusinessProfile');
const Decision = require('../models/Decision');
const { decisionQueue } = require('../config/queue');
const { audit } = require('../utils/auditTrail');
const logger = require('../utils/logger');

// POST /api/v1/applications
const createApplication = async (req, res, next) => {
  try {
    const { profileId, loanAmount, tenureMonths, loanPurpose } = req.body;

    // Verify profile exists
    const profile = await BusinessProfile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: `No business profile found with id: ${profileId}`,
      });
    }

    const application = await LoanApplication.create({
      profileId,
      loanAmount,
      tenureMonths,
      loanPurpose,
      status: 'PENDING',
    });

    // Enqueue the decision job asynchronously
    await decisionQueue.add(
      {
        applicationId: application.id,
        profileId,
        pan: profile.pan,
        monthlyRevenue: parseFloat(profile.monthlyRevenue),
        loanAmount: parseFloat(loanAmount),
        tenureMonths: parseInt(tenureMonths),
        loanPurpose,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    await audit({
      eventType: 'APPLICATION_SUBMITTED',
      entityId: application.id,
      entityType: 'application',
      payload: { profileId, loanAmount, tenureMonths, loanPurpose },
      req,
    });

    logger.info(`Application ${application.id} submitted, queued for decision`);

    return res.status(202).json({
      success: true,
      data: {
        applicationId: application.id,
        status: 'PENDING',
        message: 'Application submitted. Decision processing has begun.',
        pollUrl: `/api/v1/applications/${application.id}`,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/applications/:id
const getApplication = async (req, res, next) => {
  try {
    const application = await LoanApplication.findByPk(req.params.id, {
      include: [{ model: BusinessProfile, as: 'profile' }],
    });

    if (!application) {
      const err = new Error('Application not found');
      err.status = 404;
      return next(err);
    }

    return res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/applications/:id/decision
const getDecision = async (req, res, next) => {
  try {
    const application = await LoanApplication.findByPk(req.params.id);
    if (!application) {
      const err = new Error('Application not found');
      err.status = 404;
      return next(err);
    }

    if (application.status !== 'DONE') {
      return res.status(202).json({
        success: true,
        data: {
          applicationId: application.id,
          status: application.status,
          message: 'Decision is still being processed. Please poll again.',
        },
      });
    }

    const decision = await Decision.findOne({ applicationId: application.id });
    if (!decision) {
      const err = new Error('Decision record not found');
      err.status = 404;
      return next(err);
    }

    return res.json({ success: true, data: decision });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/applications  (list all)
const listApplications = async (req, res, next) => {
  try {
    const applications = await LoanApplication.findAll({
      include: [{ model: BusinessProfile, as: 'profile', attributes: ['name', 'businessType'] }],
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    return res.json({ success: true, data: applications, count: applications.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { createApplication, getApplication, getDecision, listApplications };
