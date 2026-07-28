const path = require('node:path');
const fs = require('node:fs');
const { Sequelize } = require('sequelize');
const env = require('../config/env');
const { initializeModels } = require('../models');

const dbDir = path.dirname(env.database.path);
fs.mkdirSync(dbDir, { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.database.path,
  logging: false
});

initializeModels(sequelize);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();

    if (env.database.syncOnStartup) {
      await sequelize.sync({ alter: false });
    }

    return {
      connected: true,
      configured: true,
      message: 'SQLite database ready.'
    };
  } catch (error) {
    return {
      connected: false,
      configured: true,
      message: 'Unable to initialize SQLite database.',
      error: error.message
    };
  }
}

module.exports = {
  sequelize,
  initializeDatabase
};
