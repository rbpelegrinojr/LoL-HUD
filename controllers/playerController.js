const { validationResult } = require('express-validator');
const playerService = require('../services/playerService');
const AppError = require('../helpers/appError');
const { auditLog } = require('../services/auditLogger');

function handleValidation(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array();
}

async function list(req, res, next) {
  try {
    const players = await playerService.findAll({ teamId: req.query.team_id });
    res.json(players);
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const player = await playerService.findById(req.params.id);
    if (!player) {
      throw new AppError('Player not found', 404);
    }
    res.json(player);
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

    const payload = { ...req.body };
    if (req.file) {
      payload.profile_image_path = `uploads/${req.file.filename}`;
    }

    const player = await playerService.create(payload);
    auditLog('player_created', { id: player.id, summonerName: player.summoner_name, actor: req.session.username });
    res.status(201).json(player);
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

    const payload = { ...req.body };
    if (req.file) {
      payload.profile_image_path = `uploads/${req.file.filename}`;
    }

    const player = await playerService.update(req.params.id, payload);
    if (!player) {
      throw new AppError('Player not found', 404);
    }
    auditLog('player_updated', { id: player.id, actor: req.session.username });
    res.json(player);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const removed = await playerService.remove(req.params.id);
    if (!removed) {
      throw new AppError('Player not found', 404);
    }
    auditLog('player_deleted', { id: req.params.id, actor: req.session.username });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, show, create, update, destroy };
