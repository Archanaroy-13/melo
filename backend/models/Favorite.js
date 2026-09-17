const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Unique compound index to prevent duplicate favorites at database level
favoriteSchema.index({ userId: 1, trackId: 1, source: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
