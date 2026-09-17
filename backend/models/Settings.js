const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  audioQuality: {
    type: String,
    enum: ['low', 'medium', 'high', '320kbps'],
    default: '320kbps'
  },
  themeAccent: {
    type: String,
    default: 'purple'
  },
  autoPlayNext: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
