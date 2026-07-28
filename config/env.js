const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const parseBoolean = (value, defaultValue = false) => {
  if (typeof value === 'undefined') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

module.exports = {
  appName: process.env.APP_NAME || 'League of Legends Tournament HUD',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT || '3000', 10),
  database: {
    path: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'lol_hud.db'),
    syncOnStartup: parseBoolean(process.env.DB_SYNC_ON_STARTUP, true)
  },
  session: {
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me',
    bcryptRounds: Number.parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
  },
  defaultAdmin: {
    username: process.env.DEFAULT_ADMIN_USER || 'admin',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'changeme123'
  }
};
