const { doubleCsrf } = require('csrf-csrf');
const env = require('../config/env');

/**
 * CSRF protection using the double-submit cookie pattern. A per-session
 * token is issued via GET /api/csrf-token and must be echoed back in the
 * `x-csrf-token` header on any state-changing (non-GET) admin/API request.
 */
const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => env.session.secret,
  getSessionIdentifier: (req) => (req.session && req.session.id) || req.ip,
  cookieName: env.nodeEnv === 'production' ? '__Host-lol-hud.csrf-token' : 'lol-hud.csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    secure: env.nodeEnv === 'production',
    httpOnly: true,
    path: '/'
  },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token']
});

module.exports = { doubleCsrfProtection, generateCsrfToken };
