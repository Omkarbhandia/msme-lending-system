const BusinessProfile = require('../models/BusinessProfile');
const { audit } = require('../utils/auditTrail');
const logger = require('../utils/logger');

// POST /api/v1/profiles
const createProfile = async (req, res, next) => {
  try {
    const { name, pan, businessType, monthlyRevenue } = req.body;
    const panUpper = pan.toUpperCase();

    // Check for duplicate PAN
    const existing = await BusinessProfile.findOne({ where: { pan: panUpper } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'DUPLICATE_PAN',
        message: 'A business profile with this PAN already exists',
      });
    }

    const profile = await BusinessProfile.create({ name, pan: panUpper, businessType, monthlyRevenue });

    await audit({
      eventType: 'PROFILE_CREATED',
      entityId: profile.id,
      entityType: 'profile',
      payload: { name, pan: panUpper, businessType, monthlyRevenue },
      req,
    });

    logger.info(`Profile created: ${profile.id} (${name})`);
    return res.status(201).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/profiles/:id
const getProfile = async (req, res, next) => {
  try {
    const profile = await BusinessProfile.findByPk(req.params.id);
    if (!profile) {
      const err = new Error('Profile not found');
      err.status = 404;
      return next(err);
    }
    return res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

module.exports = { createProfile, getProfile };
