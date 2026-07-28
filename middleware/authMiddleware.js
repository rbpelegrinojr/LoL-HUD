/**
 * Guards admin/API routes that require an authenticated session.
 * API requests (paths under /api) receive a 401 JSON response since they
 * are consumed by fetch(); admin page navigations are redirected to the
 * login page instead.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  if (req.originalUrl.startsWith('/api')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  return res.redirect('/admin/login');
}

module.exports = requireAuth;
