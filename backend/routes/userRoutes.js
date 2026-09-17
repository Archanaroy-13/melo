const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userData = require('../controllers/userDataController');

// All user data routes require single-user auth
router.use(authMiddleware);

// Favorites
router.get('/favorites', userData.getFavorites);
router.post('/favorites', userData.addFavorite);
router.delete('/favorites/:trackId', userData.removeFavorite);

// Library
router.get('/library', userData.getLibrary);
router.post('/library', userData.addToLibrary);
router.delete('/library/:trackId', userData.removeFromLibrary);

// Playlists
router.get('/playlists', userData.getPlaylists);
router.post('/playlists', userData.createPlaylist);
router.put('/playlists/:id', userData.updatePlaylist);
router.delete('/playlists/:id', userData.deletePlaylist);
router.post('/playlists/:id/tracks', userData.addTrackToPlaylist);
router.delete('/playlists/:id/tracks/:trackId', userData.removeTrackFromPlaylist);
router.put('/playlists/:id/reorder', userData.reorderPlaylistTracks);

// Listening History
router.get('/history', userData.getHistory);
router.post('/history', userData.recordHistory);
router.delete('/history', userData.clearHistory);

module.exports = router;
