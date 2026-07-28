const { validationResult } = require('express-validator');
const gameService = require('../services/gameService');
const AppError = require('../helpers/appError');
const { auditLog } = require('../services/auditLogger');

function handleValidation(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array();
}

async function list(req, res, next) {
  try {
    const games = await gameService.findAll({ matchId: req.query.match_id });
    res.json(games);
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const game = await gameService.findById(req.params.id);
    if (!game) {
      throw new AppError('Game not found', 404);
    }
    res.json(game);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const errors = handleValidation(req);
    if (errors) {
      return res.status(422).json({ errors });
    }

    const game = await gameService.create(req.body);
    auditLog('game_created', { id: game.id, actor: req.session.username });
    res.status(201).json(game);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const errors = handleValidation(req);
    if (errors) {
      return res.status(422).json({ errors });
    }

    const game = await gameService.update(req.params.id, req.body);
    if (!game) {
      throw new AppError('Game not found', 404);
    }
    auditLog('game_updated', { id: game.id, actor: req.session.username });
    res.json(game);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const removed = await gameService.remove(req.params.id);
    if (!removed) {
      throw new AppError('Game not found', 404);
    }
    auditLog('game_deleted', { id: req.params.id, actor: req.session.username });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, show, create, update, destroy };
