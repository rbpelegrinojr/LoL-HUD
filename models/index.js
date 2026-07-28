const { defineUser } = require('./user');
const { defineTournament } = require('./tournament');
const { defineTeam } = require('./team');
const { definePlayer } = require('./player');
const { defineMatch } = require('./match');
const { defineGame } = require('./game');

function initializeModels(sequelize) {
  const User = defineUser(sequelize);
  const Tournament = defineTournament(sequelize);
  const Team = defineTeam(sequelize);
  const Player = definePlayer(sequelize);
  const Match = defineMatch(sequelize);
  const Game = defineGame(sequelize);

  // Team → Players (one team has many players)
  Team.hasMany(Player, { foreignKey: 'team_id', as: 'players' });
  Player.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

  // Tournament → Matches (one tournament has many matches)
  Tournament.hasMany(Match, { foreignKey: 'tournament_id', as: 'matches' });
  Match.belongsTo(Tournament, { foreignKey: 'tournament_id', as: 'tournament' });

  // Team → Matches (as team1 or team2)
  Team.hasMany(Match, { foreignKey: 'team1_id', as: 'matchesAsTeam1' });
  Team.hasMany(Match, { foreignKey: 'team2_id', as: 'matchesAsTeam2' });
  Match.belongsTo(Team, { foreignKey: 'team1_id', as: 'team1' });
  Match.belongsTo(Team, { foreignKey: 'team2_id', as: 'team2' });
  Match.belongsTo(Team, { foreignKey: 'winner_team_id', as: 'winner' });

  // Match → Games (one match has many games)
  Match.hasMany(Game, { foreignKey: 'match_id', as: 'games' });
  Game.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });

  // Team → Games (as blue side, red side, or winner)
  Team.hasMany(Game, { foreignKey: 'blue_team_id', as: 'gamesAsBlue' });
  Team.hasMany(Game, { foreignKey: 'red_team_id', as: 'gamesAsRed' });
  Game.belongsTo(Team, { foreignKey: 'blue_team_id', as: 'blueTeam' });
  Game.belongsTo(Team, { foreignKey: 'red_team_id', as: 'redTeam' });
  Game.belongsTo(Team, { foreignKey: 'winner_team_id', as: 'winnerTeam' });

  return Object.freeze({ User, Tournament, Team, Player, Match, Game });
}

module.exports = {
  initializeModels
};
