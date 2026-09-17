const mongoose = require('mongoose');

const recentlyPlayedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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
  playedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

recentlyPlayedSchema.index({ userId: 1, playedAt: -1 });

module.exports = mongoose.model('RecentlyPlayed', recentlyPlayedSchema);
