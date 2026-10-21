const mongoose = require('mongoose');

const lyricsLineSchema = new mongoose.Schema({
  lineId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  contributor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contributorName: {
    type: String,
    default: 'Musician'
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
});

const lyricsSectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true // e.g. "Verse 1", "Chorus", "Bridge", "Outro"
  },
  lines: [lyricsLineSchema]
});

const lyricsDocumentSchema = new mongoose.Schema({
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
  title: {
    type: String,
    default: 'Lyrics'
  },
  rawText: {
    type: String,
    default: ''
  },
  sections: [lyricsSectionSchema],
  version: {
    type: Number,
    default: 1
  },
  draft: {
    rawText: { type: String, default: '' },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastSavedAt: { type: Date, default: Date.now }
  },
  publishedCommitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commit'
  }
}, {
  timestamps: true
});

lyricsDocumentSchema.index({ repository: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('LyricsDocument', lyricsDocumentSchema);
