const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SongRepository',
    required: true,
    index: true
  },
  resourceType: {
    type: String,
    enum: ['audio_timestamp', 'lyrics_line', 'pull_request', 'commit'],
    required: true,
    index: true
  },
  resourceId: {
    type: String,
    default: ''
  },
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  },
  timestampSeconds: {
    type: Number, // e.g. 45.2 seconds in the song
    default: null
  },
  lineId: {
    type: String, // lyrics line identifier
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1500
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

commentSchema.index({ repository: 1, resourceType: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
