const Joi = require('joi');

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// ─── Business Profile Validators ──────────────────────────────────────────────
const createProfileSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Business name is required',
    'string.min': 'Business name must be at least 2 characters',
  }),
  pan: Joi.string()
    .pattern(PAN_REGEX)
    .required()
    .messages({
      'string.pattern.base': 'PAN must be in the format: ABCDE1234F (5 letters, 4 digits, 1 letter)',
      'string.empty': 'PAN is required',
    }),
  businessType: Joi.string()
    .valid('retail', 'manufacturing', 'services', 'agriculture', 'other')
    .required()
    .messages({ 'any.only': 'Business type must be one of: retail, manufacturing, services, agriculture, other' }),
  monthlyRevenue: Joi.number().min(1).max(100000000).required().messages({
    'number.base': 'Monthly revenue must be a number',
    'number.min': 'Monthly revenue must be greater than 0',
  }),
});

// ─── Loan Application Validators ─────────────────────────────────────────────
const createApplicationSchema = Joi.object({
  profileId: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
    'string.guid': 'profileId must be a valid UUID',
    'string.empty': 'profileId is required',
  }),
  loanAmount: Joi.number().min(1000).max(100000000).required().messages({
    'number.base': 'Loan amount must be a number',
    'number.min': 'Minimum loan amount is ₹1,000',
  }),
  tenureMonths: Joi.number().integer().min(1).max(360).required().messages({
    'number.base': 'Tenure must be a number',
    'number.min': 'Minimum tenure is 1 month',
    'number.max': 'Maximum tenure is 360 months (30 years)',
  }),
  loanPurpose: Joi.string().min(5).max(1000).required().messages({
    'string.empty': 'Loan purpose is required',
    'string.min': 'Loan purpose must be at least 5 characters',
  }),
});

module.exports = { createProfileSchema, createApplicationSchema };
