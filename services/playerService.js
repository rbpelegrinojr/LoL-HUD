const { models } = require('../database');

const { Player, Team } = models;

async function findAll(filters = {}) {
  const where = {};
  if (filters.teamId) {
    where.team_id = filters.teamId;
  }
  return Player.findAll({
    where,
    include: [{ model: Team, as: 'team' }],
    order: [['created_at', 'DESC']]
  });
}

async function findById(id) {
  return Player.findByPk(id, { include: [{ model: Team, as: 'team' }] });
}

async function create(data) {
  return Player.create(data);
}

async function update(id, data) {
  const player = await Player.findByPk(id);
  if (!player) {
    return null;
  }
  return player.update(data);
}

async function remove(id) {
  const player = await Player.findByPk(id);
  if (!player) {
    return false;
  }
  await player.destroy();
  return true;
}

module.exports = { findAll, findById, create, update, remove };
