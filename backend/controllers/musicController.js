const musicService = require('../services/music/musicService');

const search = async (req, res) => {
  try {
    const { q, type = 'songs', source } = req.query;
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.json({ songs: [], artists: [], albums: [] });
    }
    const results = await musicService.search(q, type, source);
    return res.json(results);
  } catch (error) {
    console.error('[MusicController Search Error]:', error);
    return res.status(500).json({ error: 'Music service temporarily unavailable.' });
  }
};

const getTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Track ID is required.' });
    }
    const track = await musicService.getTrack(id, source);
    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }
    return res.json(track);
  } catch (error) {
    console.error('[MusicController getTrack Error]:', error);
    return res.status(500).json({ error: 'Music service temporarily unavailable.' });
  }
};

const getAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Album ID is required.' });
    }
    const album = await musicService.getAlbum(id, source);
    if (!album) {
      return res.status(404).json({ error: 'Album not found.' });
    }
    return res.json(album);
  } catch (error) {
    console.error('[MusicController getAlbum Error]:', error);
    return res.status(500).json({ error: 'Music service temporarily unavailable.' });
  }
};

const getArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { source } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Artist ID is required.' });
    }
    const artist = await musicService.getArtist(id, source);
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found.' });
    }
    return res.json(artist);
  } catch (error) {
    console.error('[MusicController getArtist Error]:', error);
    return res.status(500).json({ error: 'Music service temporarily unavailable.' });
  }
};

const resolvePlayback = async (req, res) => {
  try {
    const { trackId, source } = req.body;
    if (!trackId) {
      return res.status(400).json({ error: 'trackId is required for playback resolution.' });
    }
    const result = await musicService.resolvePlayback(trackId, source);
    return res.json(result);
  } catch (error) {
    console.error('[MusicController resolvePlayback Error]:', error);
    return res.json({
      trackId: req.body?.trackId || '',
      source: req.body?.source || 'unknown',
      audioUrl: null,
      playable: false,
      expiresAt: null
    });
  }
};

module.exports = {
  search,
  getTrack,
  getAlbum,
  getArtist,
  resolvePlayback
};
