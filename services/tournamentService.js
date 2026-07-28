const { models } = require('../database');

const { Tournament } = models;

async function findAll() {
  return Tournament.findAll({ order: [['created_at', 'DESC']] });
}

async function findById(id) {
  return Tournament.findByPk(id);
}

async function create(data) {
  return Tournament.create(data);
}

async function update(id, data) {
  const tournament = await Tournament.findByPk(id);
  if (!tournament) {
    return null;
  }
  return tournament.update(data);
}

async function remove(id) {
  const tournament = await Tournament.findByPk(id);
  if (!tournament) {
    return false;
  }
  await tournament.destroy();
  return true;
}

module.exports = { findAll, findById, create, update, remove };
