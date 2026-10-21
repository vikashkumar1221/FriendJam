const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SongRepository',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdFromBranch: {
    type: String,
    default: 'main'
  },
  headCommit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commit'
  },
  isProtected: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

branchSchema.index({ repository: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Branch', branchSchema);
