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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please try again in 15 minutes.'
  },
  handler: (_request, response) => {
    response.status(429).json({ message: 'Too many login attempts. Please try again in 15 minutes.' });
  }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many API requests. Please try again in a minute.'
  }
});

const overlayLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many overlay requests. Please try again in a minute.'
  }
});

module.exports = {
  adminViewLimiter,
  loginLimiter,
  apiLimiter,
  overlayLimiter
};
