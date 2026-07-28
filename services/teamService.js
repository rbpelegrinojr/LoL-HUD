const { models } = require('../database');

const { Team } = models;

async function findAll() {
  return Team.findAll({ order: [['created_at', 'DESC']] });
}

async function findById(id) {
  return Team.findByPk(id);
}

async function create(data) {
  return Team.create(data);
}

async function update(id, data) {
  const team = await Team.findByPk(id);
  if (!team) {
    return null;
  }
  return team.update(data);
}

async function remove(id) {
  const team = await Team.findByPk(id);
  if (!team) {
    return false;
  }
  await team.destroy();
  return true;
}

module.exports = { findAll, findById, create, update, remove };
