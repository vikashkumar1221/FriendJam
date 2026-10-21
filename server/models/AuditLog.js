const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SongRepository',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true // e.g. "BRANCH_CREATE", "COMMIT_PUSH", "TAKE_UPLOAD", "PR_MERGE", "ROLE_CHANGE", "ASSET_SOFT_DELETE", "ASSET_RESTORE"
  },
  details: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

auditLogSchema.index({ repository: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
