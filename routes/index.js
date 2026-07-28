const express = require('express');
const pageController = require('../controllers/pageController');

const router = express.Router();

router.get('/', pageController.redirectToLogin);
router.get('/health', pageController.healthCheck);
router.get('/api/status', pageController.runtimeStatus);

module.exports = router;
