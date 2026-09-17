const axios = require('axios');

class LyricsService {
  constructor() {
    this.baseURL = process.env.LRCLIB_API_BASE_URL || 'https://lrclib.net/api';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 6000,
      headers: {
        'User-Agent': 'Melo-Music-App/1.0 (https://github.com/melo)'
      }
    });
  }

  // Parses standard LRC format "[mm:ss.xx] Lyric line text" into array of objects
  parseLrc(lrcString) {
    if (!lrcString || typeof lrcString !== 'string') return [];

    const lines = lrcString.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const ms = parseInt(match[3].padEnd(3, '0'), 10);
        const timeInSeconds = minutes * 60 + seconds + ms / 1000;
        const text = line.replace(timeRegex, '').trim();

        if (text) {
          result.push({ time: timeInSeconds, text });
        }
      }
    }

    return result.sort((a, b) => a.time - b.time);
  }

  async getLyrics(track, artist, album, duration) {
    if (!track || !artist) {
      return { synced: false, syncedLyrics: [], plainLyrics: null, available: false };
    }

    try {
      const params = {
        track_name: track,
        artist_name: artist
      };
      if (album) params.album_name = album;
      if (duration && !isNaN(duration) && duration > 0) {
        params.duration = Math.round(duration);
      }

      // Try exact lookup first
      let res;
      try {
        res = await this.client.get('/get', { params });
      } catch (err) {
        // Fall back to search endpoint if /get returns 404
        if (err.response && err.response.status === 404) {
          const searchRes = await this.client.get('/search', {
            params: { q: `${track} ${artist}` }
          });
          const searchData = Array.isArray(searchRes.data) ? searchRes.data[0] : null;
          if (searchData) {
            res = { data: searchData };
          } else {
            return { synced: false, syncedLyrics: [], plainLyrics: null, available: false };
          }
        } else {
          throw err;
        }
      }

      const data = res.data;
      if (!data) {
        return { synced: false, syncedLyrics: [], plainLyrics: null, available: false };
      }

      const parsedSynced = this.parseLrc(data.syncedLyrics);
      const hasSynced = parsedSynced.length > 0;
      const hasPlain = Boolean(data.plainLyrics && data.plainLyrics.trim());

      return {
        synced: hasSynced,
        syncedLyrics: parsedSynced,
        plainLyrics: data.plainLyrics || null,
        available: hasSynced || hasPlain
      };
    } catch (error) {
      console.error(`[LyricsService Error]: ${error.message}`);
      return { synced: false, syncedLyrics: [], plainLyrics: null, available: false };
    }
  }
}

module.exports = new LyricsService();
