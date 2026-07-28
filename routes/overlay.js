const path = require('node:path');
const express = require('express');
const AppError = require('../helpers/appError');
const { overlayLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const ALLOWED_OVERLAYS = ['scoreboard', 'series-score', 'player-cam', 'event-feed'];

router.use(overlayLimiter);

router.get('/:name', (req, res, next) => {
  const { name } = req.params;

  if (!ALLOWED_OVERLAYS.includes(name)) {
    return next(new AppError('Overlay not found', 404));
  }

  return res.sendFile(path.join(__dirname, '..', 'public', 'overlay', `${name}.html`));
});

module.exports = router;
