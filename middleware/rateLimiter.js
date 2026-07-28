const { rateLimit } = require('express-rate-limit');

const adminViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many admin page requests. Please try again in a minute.'
  }
});

module.exports = {
  adminViewLimiter
};
