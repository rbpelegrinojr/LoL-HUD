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
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number.parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'lol_hud',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    connectOnStartup: parseBoolean(process.env.DB_CONNECT_ON_STARTUP, false)
  }
};
