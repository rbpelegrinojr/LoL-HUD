const { validationResult } = require('express-validator');
const tournamentService = require('../services/tournamentService');
const AppError = require('../helpers/appError');
const { auditLog } = require('../services/auditLogger');

function handleValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array();
  }
  return null;
}

async function list(req, res, next) {
  try {
    const tournaments = await tournamentService.findAll();
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const tournament = await tournamentService.findById(req.params.id);
    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }
    res.json(tournament);
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
      payload.logo_path = `uploads/${req.file.filename}`;
    }

    const tournament = await tournamentService.create(payload);
    auditLog('tournament_created', { id: tournament.id, name: tournament.name, actor: req.session.username });
    res.status(201).json(tournament);
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
      payload.logo_path = `uploads/${req.file.filename}`;
    }

    const tournament = await tournamentService.update(req.params.id, payload);
    if (!tournament) {
      throw new AppError('Tournament not found', 404);
    }
    auditLog('tournament_updated', { id: tournament.id, actor: req.session.username });
    res.json(tournament);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const removed = await tournamentService.remove(req.params.id);
    if (!removed) {
      throw new AppError('Tournament not found', 404);
    }
    auditLog('tournament_deleted', { id: req.params.id, actor: req.session.username });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, show, create, update, destroy };
