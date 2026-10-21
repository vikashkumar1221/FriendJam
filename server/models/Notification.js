const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SongRepository'
  },
  type: {
    type: String,
    enum: [
      'pr_opened',
      'pr_merged',
      'review_requested',
      'review_submitted',
      'take_uploaded',
      'conflict_detected',
      'branch_created',
      'commit_created',
      'mention'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
