const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimiter = require('../middleware/rateLimiter');

// Rate limited setup & login endpoints
router.post('/setup', rateLimiter(5, 60000), authController.setup);
router.post('/login', rateLimiter(10, 60000), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

module.exports = router;
