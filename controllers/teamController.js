const { validationResult } = require('express-validator');
const teamService = require('../services/teamService');
const AppError = require('../helpers/appError');
const { auditLog } = require('../services/auditLogger');

function handleValidation(req) {
  const errors = validationResult(req);
  return errors.isEmpty() ? null : errors.array();
}

async function list(req, res, next) {
  try {
    const teams = await teamService.findAll();
    res.json(teams);
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const team = await teamService.findById(req.params.id);
    if (!team) {
      throw new AppError('Team not found', 404);
    }
    res.json(team);
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

    const team = await teamService.create(payload);
    auditLog('team_created', { id: team.id, name: team.name, actor: req.session.username });
    res.status(201).json(team);
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

    const team = await teamService.update(req.params.id, payload);
    if (!team) {
      throw new AppError('Team not found', 404);
    }
    auditLog('team_updated', { id: team.id, actor: req.session.username });
    res.json(team);
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const removed = await teamService.remove(req.params.id);
    if (!removed) {
      throw new AppError('Team not found', 404);
    }
    auditLog('team_deleted', { id: req.params.id, actor: req.session.username });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { list, show, create, update, destroy };
