const { models } = require('../database');

const { Game, Match, Team } = models;

const includeAssociations = [
  { model: Match, as: 'match' },
  { model: Team, as: 'blueTeam' },
  { model: Team, as: 'redTeam' },
  { model: Team, as: 'winnerTeam' }
];

async function findAll(filters = {}) {
  const where = {};
  if (filters.matchId) {
    where.match_id = filters.matchId;
  }
  return Game.findAll({
    where,
    include: includeAssociations,
    order: [['game_number', 'ASC']]
  });
}

async function findById(id) {
  return Game.findByPk(id, { include: includeAssociations });
}

async function create(data) {
  return Game.create(data);
}

async function update(id, data) {
  const game = await Game.findByPk(id);
  if (!game) {
    return null;
  }
  return game.update(data);
}

async function remove(id) {
  const game = await Game.findByPk(id);
  if (!game) {
    return false;
  }
  await game.destroy();
  return true;
}

module.exports = { findAll, findById, create, update, remove };
