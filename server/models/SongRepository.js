const mongoose = require('mongoose');

const songRepositorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  genre: {
    type: String,
    default: 'Alternative Rock',
    trim: true
  },
  bpm: {
    type: Number,
    default: 120,
    min: 20,
    max: 300
  },
  keySignature: {
    type: String,
    default: 'C Major',
    trim: true
  },
  timeSignature: {
    type: String,
    default: '4/4',
    trim: true
  },
  status: {
    type: String,
    enum: ['Idea / Jam', 'Tracking', 'Arrangement', 'Mixing', 'Mastering', 'Released'],
    default: 'Tracking'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  defaultBranch: {
    type: String,
    default: 'main'
  },
  protectedBranches: {
    type: [String],
    default: ['main']
  },
  coverArt: {
    type: String,
    default: ''
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  trash: [{
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    assetName: String,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

songRepositorySchema.index({ owner: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('SongRepository', songRepositorySchema);
