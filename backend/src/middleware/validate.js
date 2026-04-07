const { createProfileSchema, createApplicationSchema } = require('./validators');

/**
 * Factory function that takes a Joi schema and returns an Express middleware.
 * On failure, sets err.isJoi = true so errorHandler can format it correctly.
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,   // return all errors, not just the first
    stripUnknown: true,  // ignore unknown fields
    convert: true,       // auto-convert types (string → number etc.)
  });

  if (error) {
    error.isJoi = true;
    return next(error);
  }

  req.body = value; // replace with validated+sanitized data
  next();
};

module.exports = {
  validateProfile: validate(createProfileSchema),
  validateApplication: validate(createApplicationSchema),
};
