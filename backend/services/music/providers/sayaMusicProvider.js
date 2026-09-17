const axios = require('axios');

class SayaMusicProvider {
  constructor() {
    this.name = 'sayamusic';
    this.endpoints = [
      process.env.SAYA_MUSIC_API_BASE_URL,
      'https://saavn.dev/api',
      'https://saavn.me/api',
      'https://saavn.me'
    ].filter(Boolean);
  }

  // Fallback to official iTunes Search API if Saavn mirrors fail
  async searchITunes(query, limit = 10) {
    try {
      const q = encodeURIComponent(query);
      const url = `https://itunes.apple.com/search?term=${q}&entity=song&limit=${limit}`;
      const res = await axios.get(url, { timeout: 5000 });
      const results = res.data?.results || [];

      return results.map(item => ({
        id: String(item.trackId || ''),
        title: item.trackName || 'Unknown Title',
        artist: item.artistName || 'Unknown Artist',
        album: item.collectionName || 'Unknown Album',
        artwork: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '500x500bb') : '',
        duration: Math.floor((item.trackTimeMillis || 0) / 1000),
        source: this.name,
        playable: Boolean(item.previewUrl),
        mediaUrl: item.previewUrl
      }));
    } catch (err) {
      console.error(`[ITunes Fallback Search Error]: ${err.message}`);
      return [];
    }
  }

  cleanHtmlEntities(str) {
    if (!str) return '';
    return str
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  normalizeTrack(item) {
    if (!item) return null;

    const id = String(item.id || item.song_id || item.encrypted_media_url || item.trackId || '');
    const title = item.name || item.title || item.song || item.trackName || 'Unknown Track';
    
    let artist = 'Unknown Artist';
    if (item.artists && Array.isArray(item.artists.primary) && item.artists.primary.length > 0) {
      artist = item.artists.primary.map(a => a.name).join(', ');
    } else if (item.primaryArtists) {
      artist = item.primaryArtists;
    } else if (item.artistName) {
      artist = item.artistName;
    } else if (item.artist) {
      artist = typeof item.artist === 'string' ? item.artist : item.artist.name || 'Unknown Artist';
    }

    let album = 'Unknown Album';
    if (item.collectionName) {
      album = item.collectionName;
    } else if (item.album) {
      album = typeof item.album === 'string' ? item.album : item.album.name || 'Unknown Album';
    }

    let artwork = '';
    if (Array.isArray(item.image)) {
      const highestRes = item.image.find(img => img.quality === '500x500') || item.image[item.image.length - 1];
      artwork = highestRes ? (highestRes.url || highestRes.link) : '';
    } else if (typeof item.image === 'string') {
      artwork = item.image;
    } else if (item.artworkUrl100) {
      artwork = item.artworkUrl100.replace('100x100bb', '500x500bb');
    }

    const duration = parseInt(item.duration || item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : 0, 10);

    const hasDownloadUrl = Array.isArray(item.downloadUrl) && item.downloadUrl.length > 0;
    const hasMediaUrl = Boolean(item.media_url || item.encrypted_media_url || item.previewUrl || item.mediaUrl);
    const playable = hasDownloadUrl || hasMediaUrl;

    return {
      id,
      title: this.cleanHtmlEntities(title),
      artist: this.cleanHtmlEntities(artist),
      album: this.cleanHtmlEntities(album),
      artwork,
      duration,
      source: this.name,
      playable
    };
  }

  async search(query, type = 'songs') {
    try {
      if (!query || !query.trim()) {
        return { songs: [], artists: [], albums: [] };
      }

      const q = encodeURIComponent(query.trim());

      // Attempt Saavn endpoints
      for (const base of this.endpoints) {
        try {
          const client = axios.create({ baseURL: base, timeout: 4000 });
          const res = await client.get(`/search/songs?query=${q}`);
          const data = res.data?.data || res.data;
          const results = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : []);
          if (results.length > 0) {
            return {
              songs: results.map(item => this.normalizeTrack(item)).filter(Boolean),
              artists: [],
              albums: []
            };
          }
        } catch (e) {}
      }

      // Legal Public iTunes API Fallback if Saavn endpoints unavailable
      const iTunesSongs = await this.searchITunes(query);
      return {
        songs: iTunesSongs,
        artists: [],
        albums: []
      };
    } catch (error) {
      console.error(`[SayaMusicProvider Search Error]: ${error.message}`);
      return { songs: [], artists: [], albums: [] };
    }
  }

  async getTrack(trackId) {
    try {
      for (const base of this.endpoints) {
        try {
          const client = axios.create({ baseURL: base, timeout: 4000 });
          const res = await client.get(`/songs?id=${trackId}`);
          const data = res.data?.data || res.data;
          const rawTrack = Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : data);
          if (rawTrack) return this.normalizeTrack(rawTrack);
        } catch (e) {}
      }

      // iTunes fallback lookup
      const res = await axios.get(`https://itunes.apple.com/lookup?id=${trackId}`);
      const raw = res.data?.results?.[0];
      return this.normalizeTrack(raw);
    } catch (error) {
      return null;
    }
  }

  async getAlbum(albumId) {
    return { id: String(albumId), title: 'Album', artist: 'Artist', artwork: '', songs: [], source: this.name };
  }

  async getArtist(artistId) {
    return { id: String(artistId), name: 'Artist', image: '', songs: [], source: this.name };
  }

  async resolvePlayback(trackId) {
    try {
      // 1. Check Saavn mirrors
      for (const base of this.endpoints) {
        try {
          const client = axios.create({ baseURL: base, timeout: 4000 });
          const res = await client.get(`/songs?id=${trackId}`);
          const data = res.data?.data || res.data;
          const rawTrack = Array.isArray(data) ? data[0] : (data?.results ? data.results[0] : data);

          if (rawTrack) {
            let audioUrl = null;
            if (Array.isArray(rawTrack.downloadUrl) && rawTrack.downloadUrl.length > 0) {
              const preferred = rawTrack.downloadUrl.find(d => d.quality === '320kbps') ||
                                rawTrack.downloadUrl.find(d => d.quality === '160kbps') ||
                                rawTrack.downloadUrl[rawTrack.downloadUrl.length - 1];
              audioUrl = preferred ? (preferred.url || preferred.link) : null;
            } else if (typeof rawTrack.media_url === 'string') {
              audioUrl = rawTrack.media_url;
            }

            if (audioUrl) {
              return { trackId, source: this.name, audioUrl, playable: true, expiresAt: null };
            }
          }
        } catch (e) {}
      }

      // 2. iTunes API fallback lookup for direct audio stream resolution
      const res = await axios.get(`https://itunes.apple.com/lookup?id=${trackId}`);
      const rawTrack = res.data?.results?.[0];
      if (rawTrack && rawTrack.previewUrl) {
        return {
          trackId,
          source: this.name,
          audioUrl: rawTrack.previewUrl,
          playable: true,
          expiresAt: null
        };
      }

      return { trackId, source: this.name, audioUrl: null, playable: false, expiresAt: null };
    } catch (error) {
      console.error(`[SayaMusicProvider resolvePlayback Error]: ${error.message}`);
      return { trackId, source: this.name, audioUrl: null, playable: false, expiresAt: null };
    }
  }
}

module.exports = new SayaMusicProvider();
