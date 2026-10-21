const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SongRepository',
    required: true,
    index: true
  },
  branch: {
    type: String,
    required: true,
    index: true
  },
  commitHash: {
    type: String,
    required: true,
    index: true
  },
  parentCommits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commit'
  }],
  message: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  snapshot: {
    lyrics: {
      content: String,
      sections: [{
        id: String,
        label: String,
        lines: [String]
      }],
      version: Number
    },
    tracks: [{
      assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
      trackName: String,
      category: String,
      takeId: String,
      takeNumber: Number,
      label: String,
      audioUrl: String,
      originalFileName: String,
      duration: Number,
      volume: { type: Number, default: 80 },
      pan: { type: Number, default: 0 },
      isMuted: { type: Boolean, default: false },
      isSolo: { type: Boolean, default: false }
    }]
  },
  changes: {
    lyricsChanged: { type: Boolean, default: false },
    addedTakes: [{
      trackName: String,
      takeNumber: Number,
      label: String
    }],
    restoredFromCommit: { type: String, default: null },
    revertedFromCommit: { type: String, default: null }
  }
}, {
  timestamps: true
});

commitSchema.index({ repository: 1, createdAt: -1 });

module.exports = mongoose.model('Commit', commitSchema);
