const express = require('express');
const router = express.Router();
const lyricsController = require('../controllers/lyricsController');

router.get('/', lyricsController.getLyrics);

module.exports = router;
