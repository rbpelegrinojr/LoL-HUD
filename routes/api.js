const express = require('express');
const { body } = require('express-validator');

const requireAuth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { apiLimiter } = require('../middleware/rateLimiter');
const { doubleCsrfProtection, generateCsrfToken } = require('../middleware/csrf');
const upload = require('../middleware/upload');

const tournamentController = require('../controllers/tournamentController');
const teamController = require('../controllers/teamController');
const playerController = require('../controllers/playerController');
const matchController = require('../controllers/matchController');
const gameController = require('../controllers/gameController');
const broadcastController = require('../controllers/broadcastController');

const router = express.Router();

router.use(apiLimiter);
router.use(requireAuth);

router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

router.use(doubleCsrfProtection);

// --- Tournaments ---
router.get('/tournaments', tournamentController.list);
router.get('/tournaments/:id', tournamentController.show);
router.post(
  '/tournaments',
  upload.single('logo'),
  [body('name').trim().notEmpty().withMessage('Name is required')],
  tournamentController.create
);
router.patch('/tournaments/:id', upload.single('logo'), tournamentController.update);
router.delete('/tournaments/:id', requireRole('admin'), tournamentController.destroy);

// --- Teams ---
router.get('/teams', teamController.list);
router.get('/teams/:id', teamController.show);
router.post(
  '/teams',
  upload.single('logo'),
  [body('name').trim().notEmpty().withMessage('Name is required')],
  teamController.create
);
router.patch('/teams/:id', upload.single('logo'), teamController.update);
router.delete('/teams/:id', requireRole('admin'), teamController.destroy);

// --- Players ---
router.get('/players', playerController.list);
router.get('/players/:id', playerController.show);
router.post(
  '/players',
  upload.single('photo'),
  [body('summoner_name').trim().notEmpty().withMessage('Summoner name is required')],
  playerController.create
);
router.patch('/players/:id', upload.single('photo'), playerController.update);
router.delete('/players/:id', requireRole('admin'), playerController.destroy);

// --- Matches ---
router.get('/matches', matchController.list);
router.get('/matches/:id', matchController.show);
router.post(
  '/matches',
  [
    body('tournament_id').isInt().withMessage('tournament_id is required'),
    body('team1_id').isInt().withMessage('team1_id is required'),
    body('team2_id').isInt().withMessage('team2_id is required')
  ],
  matchController.create
);
router.patch('/matches/:id', matchController.update);
router.delete('/matches/:id', requireRole('admin'), matchController.destroy);

// --- Games ---
router.get('/games', gameController.list);
router.get('/games/:id', gameController.show);
router.post(
  '/games',
  [
    body('match_id').isInt().withMessage('match_id is required'),
    body('blue_team_id').isInt().withMessage('blue_team_id is required'),
    body('red_team_id').isInt().withMessage('red_team_id is required')
  ],
  gameController.create
);
router.patch('/games/:id', gameController.update);
router.delete('/games/:id', requireRole('admin'), gameController.destroy);

// --- Broadcast control (operator or admin) ---
router.get('/broadcast/state', broadcastController.getLiveState);
router.post('/broadcast/game/start', requireRole('operator'), broadcastController.startGame);
router.patch('/broadcast/game/update', requireRole('operator'), broadcastController.updateGame);
router.post('/broadcast/game/end', requireRole('operator'), broadcastController.endGame);

module.exports = router;
