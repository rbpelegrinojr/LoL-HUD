const { models } = require('../database');

const { Match, Team, Tournament } = models;

const includeAssociations = [
  { model: Team, as: 'team1' },
  { model: Team, as: 'team2' },
  { model: Team, as: 'winner' },
  { model: Tournament, as: 'tournament' }
];

async function findAll(filters = {}) {
  const where = {};
  if (filters.tournamentId) {
    where.tournament_id = filters.tournamentId;
  }
  return Match.findAll({
    where,
    include: includeAssociations,
    order: [['scheduled_at', 'ASC']]
  });
}

async function findById(id) {
  return Match.findByPk(id, { include: includeAssociations });
}

async function create(data) {
  return Match.create(data);
}

async function update(id, data) {
  const match = await Match.findByPk(id);
  if (!match) {
    return null;
  }
  return match.update(data);
}

async function remove(id) {
  const match = await Match.findByPk(id);
  if (!match) {
    return false;
  }
  await match.destroy();
  return true;
}

module.exports = { findAll, findById, create, update, remove };
