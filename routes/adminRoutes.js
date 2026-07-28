const express = require('express');
const pageController = require('../controllers/pageController');
const authController = require('../controllers/authController');
const { adminViewLimiter, loginLimiter } = require('../middleware/rateLimiter');
const requireAuth = require('../middleware/authMiddleware');
const { doubleCsrfProtection } = require('../middleware/csrf');

const router = express.Router();

router.use(adminViewLimiter);
router.get('/login', pageController.loginPage);
router.post('/login', loginLimiter, doubleCsrfProtection, authController.postLogin);
router.get('/logout', authController.postLogout);
router.get('/dashboard', requireAuth, pageController.dashboardPage);
router.get('/tournaments', requireAuth, pageController.tournamentsPage);
router.get('/teams', requireAuth, pageController.teamsPage);
router.get('/players', requireAuth, pageController.playersPage);
router.get('/matches', requireAuth, pageController.matchesPage);
router.get('/broadcast', requireAuth, pageController.broadcastPage);

module.exports = router;
