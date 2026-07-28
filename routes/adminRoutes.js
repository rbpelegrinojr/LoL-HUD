const express = require('express');
const pageController = require('../controllers/pageController');
const { adminViewLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(adminViewLimiter);
router.get('/login', pageController.loginPage);
router.get('/dashboard', pageController.dashboardPage);

module.exports = router;
