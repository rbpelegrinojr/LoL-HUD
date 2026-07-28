const gameStateService = require('../services/gameStateService');
const gameService = require('../services/gameService');
const matchService = require('../services/matchService');
const AppError = require('../helpers/appError');
const { auditLog } = require('../services/auditLogger');

function emitHudUpdate(req) {
  const io = req.app.locals.io;
  if (io) {
    io.emit('hud:update', gameStateService.getState());
  }
}

async function startGame(req, res, next) {
  try {
    const { gameId, matchId, blueTeam, redTeam } = req.body || {};

    if (!matchId || !blueTeam || !redTeam) {
      throw new AppError('matchId, blueTeam, and redTeam are required to start a game.', 422);
    }

    const match = await matchService.findById(matchId);
    if (!match) {
      throw new AppError('Match not found', 404);
    }

    if (match.status !== 'completed') {
      await matchService.update(matchId, { status: 'ongoing' });
    }

    const state = gameStateService.startGame(gameId || null, matchId, blueTeam, redTeam);

    auditLog('broadcast_game_start', { matchId, actor: req.session.username });
    emitHudUpdate(req);
    res.status(200).json(state);
  } catch (error) {
    next(error);
  }
}

async function updateGame(req, res, next) {
  try {
    const currentState = gameStateService.getState();
    if (!currentState) {
      throw new AppError('No live game in progress.', 409);
    }

    const state = gameStateService.updateGame(req.body || {});

    if (req.body && req.body.event) {
      gameStateService.addEvent(req.body.event);
    }

    auditLog('broadcast_game_update', { matchId: state.matchId, actor: req.session.username });
    emitHudUpdate(req);
    res.status(200).json(gameStateService.getState());
  } catch (error) {
    next(error);
  }
}

async function endGame(req, res, next) {
  try {
    const currentState = gameStateService.getState();
    if (!currentState) {
      throw new AppError('No live game in progress.', 409);
    }

    const { winnerTeamId } = req.body || {};
    const state = gameStateService.endGame(winnerTeamId || null);

    if (state.gameId) {
      await gameService.update(state.gameId, {
        status: 'completed',
        winner_team_id: winnerTeamId || null,
        blue_team_kills: state.blueKills,
        red_team_kills: state.redKills,
        blue_team_gold: state.blueGold,
        red_team_gold: state.redGold,
        blue_team_towers: state.blueTowers,
        red_team_towers: state.redTowers,
        blue_team_dragons: state.blueDragons,
        red_team_dragons: state.redDragons,
        blue_team_barons: state.blueBarons,
        red_team_barons: state.redBarons,
        ended_at: new Date()
      }).catch(() => null);
    }

    auditLog('broadcast_game_end', { matchId: state.matchId, winnerTeamId, actor: req.session.username });

    const io = req.app.locals.io;
    if (io) {
      io.emit('hud:end', state);
    }

    gameStateService.reset();
    res.status(200).json(state);
  } catch (error) {
    next(error);
  }
}

function getLiveState(_req, res) {
  res.json(gameStateService.getState() || { status: 'idle' });
}

module.exports = { startGame, updateGame, endGame, getLiveState };
