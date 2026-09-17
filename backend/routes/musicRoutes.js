const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

router.get('/search', musicController.search);
router.get('/track/:id', musicController.getTrack);
router.get('/album/:id', musicController.getAlbum);
router.get('/artist/:id', musicController.getArtist);
router.post('/resolve', musicController.resolvePlayback);

module.exports = router;
