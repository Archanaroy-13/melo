const mongoose = require('mongoose');

const playlistTrackSchema = new mongoose.Schema({
  trackId: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true,
    default: 'sayamusic'
  },
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    default: 'Unknown Artist'
  },
  album: {
    type: String,
    default: 'Unknown Album'
  },
  artwork: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const playlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  coverArtwork: {
    type: String,
    default: ''
  },
  tracks: [playlistTrackSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

playlistSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Playlist', playlistSchema);
