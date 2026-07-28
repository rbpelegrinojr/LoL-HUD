const bcrypt = require('bcryptjs');
const { models } = require('../database');
const { auditLog } = require('../services/auditLogger');

const { User } = models;

async function postLogin(req, res, next) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = await User.findOne({ where: { username } });

    if (!user || !user.is_active) {
      auditLog('login_failed', { username });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      auditLog('login_failed', { username });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.username = user.username;

    user.last_login_at = new Date();
    await user.save();

    auditLog('login_success', { username, userId: user.id, role: user.role });

    return res.status(200).json({ redirect: '/admin/dashboard' });
  } catch (error) {
    return next(error);
  }
}

function postLogout(req, res) {
  const { username, userId } = req.session || {};

  req.session.destroy(() => {
    auditLog('logout', { username, userId });
    res.redirect('/admin/login');
  });
}

module.exports = {
  postLogin,
  postLogout
};
