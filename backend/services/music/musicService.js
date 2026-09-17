const sayaMusicProvider = require('./providers/sayaMusicProvider');

class MusicService {
  constructor() {
    this.providers = new Map();
    // Register active provider(s)
    this.registerProvider(sayaMusicProvider);
    this.defaultProviderName = 'sayamusic';
  }

  registerProvider(provider) {
    if (provider && provider.name) {
      this.providers.set(provider.name, provider);
      console.log(`[MusicService] Registered provider: ${provider.name}`);
    }
  }

  getProvider(sourceName) {
    const name = sourceName || this.defaultProviderName;
    const provider = this.providers.get(name);
    if (!provider) {
      // Fall back to default provider if unknown source is requested
      return this.providers.get(this.defaultProviderName);
    }
    return provider;
  }

  async search(query, type = 'songs', source) {
    const provider = this.getProvider(source);
    if (!provider) {
      return { songs: [], artists: [], albums: [] };
    }
    return await provider.search(query, type);
  }

  async getTrack(trackId, source) {
    const provider = this.getProvider(source);
    if (!provider) return null;
    return await provider.getTrack(trackId);
  }

  async getAlbum(albumId, source) {
    const provider = this.getProvider(source);
    if (!provider) return null;
    return await provider.getAlbum(albumId);
  }

  async getArtist(artistId, source) {
    const provider = this.getProvider(source);
    if (!provider) return null;
    return await provider.getArtist(artistId);
  }

  async resolvePlayback(trackId, source) {
    const provider = this.getProvider(source);
    if (!provider) {
      return {
        trackId,
        source: source || 'unknown',
        audioUrl: null,
        playable: false,
        expiresAt: null
      };
    }
    return await provider.resolvePlayback(trackId);
  }
}

module.exports = new MusicService();
