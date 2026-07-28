const bcrypt = require('bcryptjs');
const env = require('../config/env');

/**
 * Seeds a default admin user on first startup so the admin panel is
 * immediately accessible. No-ops if any user already exists.
 */
async function seedDatabase(models) {
  const { User } = models;

  const existingUserCount = await User.count();
  if (existingUserCount > 0) {
    return { seeded: false };
  }

  const passwordHash = await bcrypt.hash(env.defaultAdmin.password, env.session.bcryptRounds);

  await User.create({
    username: env.defaultAdmin.username,
    password_hash: passwordHash,
    role: 'admin',
    is_active: true
  });

  return { seeded: true, username: env.defaultAdmin.username };
}

module.exports = { seedDatabase };
