const ROLE_HIERARCHY = {
  admin: ['admin'],
  operator: ['admin', 'operator']
};

/**
 * Factory that builds middleware restricting access by session role.
 * 'admin' role only allows admins through; 'operator' allows both
 * admins and operators, since admins can perform every operator action.
 */
function requireRole(role) {
  const allowedRoles = ROLE_HIERARCHY[role] || [role];

  return function roleGuard(req, res, next) {
    const sessionRole = req.session && req.session.role;

    if (sessionRole && allowedRoles.includes(sessionRole)) {
      return next();
    }

    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  };
}

module.exports = { requireRole };
