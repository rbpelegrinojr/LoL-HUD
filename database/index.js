const path = require('node:path');
const fs = require('node:fs');
const { Sequelize } = require('sequelize');
const env = require('../config/env');
const { initializeModels } = require('../models');
const { seedDatabase } = require('./seed');

const dbDir = path.dirname(env.database.path);
if (env.database.path !== ':memory:') {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.database.path,
  logging: false
});

const models = initializeModels(sequelize);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();

    if (env.database.syncOnStartup) {
      await sequelize.sync({ alter: false });
      await seedDatabase(models);
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
  models,
  initializeDatabase
};
