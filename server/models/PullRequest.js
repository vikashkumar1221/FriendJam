const mongoose = require('mongoose');

const pullRequestSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SongRepository',
    required: true,
    index: true
  },
  prNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 3000
  },
  sourceBranch: {
    type: String,
    required: true
  },
  targetBranch: {
    type: String,
    default: 'main',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'merged', 'closed'],
    default: 'open',
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'changes_requested'],
      default: 'pending'
    },
    note: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date
    }
  }],
  diffSummary: {
    lyricsChanged: { type: Boolean, default: false },
    addedTakesCount: { type: Number, default: 0 },
    hasConflicts: { type: Boolean, default: false },
    conflicts: [{
      type: { type: String, enum: ['lyrics', 'track_take'] },
      message: String,
      details: mongoose.Schema.Types.Mixed
    }]
  },
  mergeCommit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commit'
  },
  mergedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  mergedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

pullRequestSchema.index({ repository: 1, prNumber: 1 }, { unique: true });

module.exports = mongoose.model('PullRequest', pullRequestSchema);
