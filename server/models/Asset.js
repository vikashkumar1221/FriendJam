const mongoose = require('mongoose');

const takeSchema = new mongoose.Schema({
  takeId: {
    type: String,
    required: true
  },
  takeNumber: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: 'Initial Take'
  },
  audioUrl: {
    type: String,
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileHash: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0 // in seconds
  },
  sampleRate: {
    type: Number,
    default: 44100
  },
  fileSize: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: 'audio/wav'
  },
  waveformData: {
    type: [Number],
    default: []
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const assetSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SongRepository',
    required: true,
    index: true
  },
  branch: {
    type: String,
    default: 'main',
    index: true
  },
  trackName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['vocals', 'guitar', 'bass', 'drums', 'keys', 'instruments', 'master', 'other'],
    default: 'vocals'
  },
  activeTakeId: {
    type: String
  },
  takes: [takeSchema],
  volume: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  pan: {
    type: Number,
    default: 0,
    min: -100,
    max: 100
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isSolo: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

assetSchema.index({ repository: 1, branch: 1, trackName: 1 });

module.exports = mongoose.model('Asset', assetSchema);
