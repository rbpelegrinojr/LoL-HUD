const { validationResult } = require('express-validator');
const matchService = require('../services/matchService');
const AppError = require('../helpers/appError');
const { auditLog } = require('../services/auditLogger');

function handleValidation(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array();
}

async function list(req, res, next) {
  try {
    const matches = await matchService.findAll({ tournamentId: req.query.tournament_id });
    res.json(matches);
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const match = await matchService.findById(req.params.id);
    if (!match) {
      throw new AppError('Match not found', 404);
    }
    res.json(match);
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

    const match = await matchService.create(req.body);
    auditLog('match_created', { id: match.id, actor: req.session.username });
    res.status(201).json(match);
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

    const match = await matchService.update(req.params.id, req.body);
    if (!match) {
      throw new AppError('Match not found', 404);
    }
    auditLog('match_updated', { id: match.id, actor: req.session.username });
    res.json(match);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const removed = await matchService.remove(req.params.id);
    if (!removed) {
      throw new AppError('Match not found', 404);
    }
    auditLog('match_deleted', { id: req.params.id, actor: req.session.username });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, show, create, update, destroy };
