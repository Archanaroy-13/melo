const lyricsService = require('../services/lyrics/lyricsService');

const getLyrics = async (req, res) => {
  try {
    const { track, artist, album, duration } = req.query;
    if (!track || !artist) {
      return res.json({ synced: false, syncedLyrics: [], plainLyrics: null, available: false });
    }

    const lyrics = await lyricsService.getLyrics(track, artist, album, Number(duration));
    return res.json(lyrics);
  } catch (error) {
    console.error('[LyricsController Error]:', error);
    return res.json({ synced: false, syncedLyrics: [], plainLyrics: null, available: false });
  }
};

module.exports = { getLyrics };
