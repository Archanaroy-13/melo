const Favorite = require('../models/Favorite');
const UserLibrary = require('../models/UserLibrary');
const Playlist = require('../models/Playlist');
const RecentlyPlayed = require('../models/RecentlyPlayed');

// Helper to sanitize incoming track payload to stable metadata only (no audioUrl)
const sanitizeTrackInput = (body) => ({
  trackId: String(body.id || body.trackId || ''),
  source: body.source || 'sayamusic',
  title: body.title || 'Unknown Title',
  artist: body.artist || 'Unknown Artist',
  album: body.album || 'Unknown Album',
  artwork: body.artwork || '',
  duration: Number(body.duration || 0)
});

// --- FAVORITES ---
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.find({ userId }).sort({ addedAt: -1 });
    const formatted = favorites.map(f => ({
      id: f.trackId,
      trackId: f.trackId,
      source: f.source,
      title: f.title,
      artist: f.artist,
      album: f.album,
      artwork: f.artwork,
      duration: f.duration,
      addedAt: f.addedAt,
      playable: true
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
};

const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = sanitizeTrackInput(req.body);
    if (!data.trackId) {
      return res.status(400).json({ error: 'Track ID is required.' });
    }

    const fav = await Favorite.findOneAndUpdate(
      { userId, trackId: data.trackId, source: data.source },
      { $set: { ...data, userId, addedAt: new Date() } },
      { upsert: true, new: true }
    );

    return res.status(201).json(fav);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add favorite.' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trackId } = req.params;
    const source = req.query.source || 'sayamusic';

    await Favorite.deleteOne({ userId, trackId, source });
    return res.json({ message: 'Removed from favorites.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove favorite.' });
  }
};

// --- LIBRARY ---
const getLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const libraryItems = await UserLibrary.find({ userId }).sort({ addedAt: -1 });
    const formatted = libraryItems.map(item => ({
      id: item.trackId,
      trackId: item.trackId,
      source: item.source,
      title: item.title,
      artist: item.artist,
      album: item.album,
      artwork: item.artwork,
      duration: item.duration,
      addedAt: item.addedAt,
      playable: true
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch library.' });
  }
};

const addToLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = sanitizeTrackInput(req.body);
    if (!data.trackId) {
      return res.status(400).json({ error: 'Track ID is required.' });
    }

    const item = await UserLibrary.findOneAndUpdate(
      { userId, trackId: data.trackId, source: data.source },
      { $set: { ...data, userId, addedAt: new Date() } },
      { upsert: true, new: true }
    );

    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save to library.' });
  }
};

const removeFromLibrary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trackId } = req.params;
    const source = req.query.source || 'sayamusic';

    await UserLibrary.deleteOne({ userId, trackId, source });
    return res.json({ message: 'Removed from library.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove from library.' });
  }
};

// --- PLAYLISTS ---
const getPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;
    const playlists = await Playlist.find({ userId }).sort({ updatedAt: -1 });
    return res.json(playlists);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch playlists.' });
  }
};

const createPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, coverArtwork } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Playlist name is required.' });
    }

    const playlist = await Playlist.create({
      userId,
      name: name.trim(),
      description: description ? description.trim() : '',
      coverArtwork: coverArtwork || '',
      tracks: []
    });

    return res.status(201).json(playlist);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create playlist.' });
  }
};

const updatePlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, coverArtwork } = req.body;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          name: name ? name.trim() : undefined,
          description: description !== undefined ? description.trim() : undefined,
          coverArtwork: coverArtwork !== undefined ? coverArtwork : undefined,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });
    return res.json(playlist);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update playlist.' });
  }
};

const deletePlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await Playlist.deleteOne({ _id: id, userId });
    return res.json({ message: 'Playlist deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete playlist.' });
  }
};

const addTrackToPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const data = sanitizeTrackInput(req.body);

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });

    playlist.tracks.push(data);
    playlist.updatedAt = new Date();
    if (!playlist.coverArtwork && data.artwork) {
      playlist.coverArtwork = data.artwork;
    }
    await playlist.save();

    return res.json(playlist);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add track to playlist.' });
  }
};

const removeTrackFromPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, trackId } = req.params;
    const source = req.query.source || 'sayamusic';

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });

    playlist.tracks = playlist.tracks.filter(
      t => !(t.trackId === trackId && t.source === source)
    );
    playlist.updatedAt = new Date();
    await playlist.save();

    return res.json(playlist);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove track from playlist.' });
  }
};

const reorderPlaylistTracks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { tracks } = req.body;

    if (!Array.isArray(tracks)) {
      return res.status(400).json({ error: 'Tracks array is required.' });
    }

    const playlist = await Playlist.findOne({ _id: id, userId });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found.' });

    playlist.tracks = tracks.map(t => sanitizeTrackInput(t));
    playlist.updatedAt = new Date();
    await playlist.save();

    return res.json(playlist);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reorder playlist tracks.' });
  }
};

// --- RECENTLY PLAYED HISTORY ---
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await RecentlyPlayed.find({ userId }).sort({ playedAt: -1 }).limit(50);
    const formatted = history.map(h => ({
      id: h.trackId,
      trackId: h.trackId,
      source: h.source,
      title: h.title,
      artist: h.artist,
      album: h.album,
      artwork: h.artwork,
      duration: h.duration,
      playedAt: h.playedAt,
      playable: true
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch listening history.' });
  }
};

const recordHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = sanitizeTrackInput(req.body);
    if (!data.trackId) {
      return res.status(400).json({ error: 'Track ID is required.' });
    }

    // Deduplicate same trackId + source within a 5-minute window
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recent = await RecentlyPlayed.findOne({
      userId,
      trackId: data.trackId,
      source: data.source,
      playedAt: { $gte: fiveMinsAgo }
    });

    if (recent) {
      recent.playedAt = new Date();
      await recent.save();
      return res.json(recent);
    }

    const item = await RecentlyPlayed.create({
      ...data,
      userId,
      playedAt: new Date()
    });

    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record listening history.' });
  }
};

const clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    await RecentlyPlayed.deleteMany({ userId });
    return res.json({ message: 'Listening history cleared.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to clear listening history.' });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  getLibrary,
  addToLibrary,
  removeFromLibrary,
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
  getHistory,
  recordHistory,
  clearHistory
};
