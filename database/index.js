const { Sequelize } = require('sequelize');
const env = require('../config/env');

const sequelize = new Sequelize(env.database.name, env.database.user, env.database.password, {
  host: env.database.host,
  port: env.database.port,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    connectTimeout: 5000
  }
});

async function initializeDatabase() {
  if (!env.database.connectOnStartup) {
    return {
      connected: false,
      configured: true,
      message: 'Database connectivity check skipped. Set DB_CONNECT_ON_STARTUP=true to verify MySQL on boot.'
    };
  }

  try {
    await sequelize.authenticate();

    return {
      connected: true,
      configured: true,
      message: 'MySQL connection established successfully.'
    };
  } catch (error) {
    return {
      connected: false,
      configured: true,
      message: 'Unable to connect to MySQL during startup.',
      error: error.message
    };
  }
}

module.exports = {
  sequelize,
  initializeDatabase
};
