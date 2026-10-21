const mongoose = require('mongoose');

const repositoryMemberSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SongRepository',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['owner', 'maintainer', 'contributor', 'reviewer', 'viewer'],
    default: 'contributor'
  },
  instrumentRole: {
    type: String,
    default: 'Musician' // e.g. "Songwriter", "Lead Guitar", "Drums", "Mix Engineer"
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

repositoryMemberSchema.index({ repository: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('RepositoryMember', repositoryMemberSchema);
