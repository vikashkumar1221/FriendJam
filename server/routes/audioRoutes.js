const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireRepoRole } = require('../middleware/auth');
const { audioUpload, UPLOADS_DIR } = require('../middleware/upload');
const { extractWaveformPeaks, getFileChecksum, estimateDurationSeconds } = require('../services/audioService');

// Get all active tracks for a branch
router.get('/:repoId/tracks', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const branchName = req.query.branch || req.repository.defaultBranch || 'main';

    const tracks = await Asset.find({
      repository: req.repository._id,
      branch: branchName,
      isDeleted: false
    }).populate('takes.uploadedBy', 'username displayName avatar');

    res.json({ tracks, branch: branchName });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audio tracks.' });
  }
});

// Create a new track (e.g. "Rhythm Guitar")
router.post('/:repoId/tracks', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const { trackName, category, branch } = req.body;
    const branchName = branch || req.repository.defaultBranch || 'main';

    if (!trackName || !trackName.trim()) {
      return res.status(400).json({ error: 'Track name is required.' });
    }

    const existingTrack = await Asset.findOne({
      repository: req.repository._id,
      branch: branchName,
      trackName: trackName.trim(),
      isDeleted: false
    });

    if (existingTrack) {
      return res.status(400).json({ error: `A track named "${trackName.trim()}" already exists on branch "${branchName}".` });
    }

    const newTrack = new Asset({
      repository: req.repository._id,
      branch: branchName,
      trackName: trackName.trim(),
      category: category || 'vocals',
      volume: 80,
      pan: 0,
      isMuted: false,
      isSolo: false,
      takes: []
    });

    await newTrack.save();

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'TRACK_CREATED',
      details: `Created new audio track "${newTrack.trackName}" [${newTrack.category}] on ${branchName}.`
    }).save();

    res.status(201).json({ track: newTrack });
  } catch (err) {
    console.error('Error creating track:', err);
    res.status(500).json({ error: 'Failed to create audio track.' });
  }
});

// Upload a new take to a track (Preserves previous takes!)
router.post('/:repoId/tracks/:trackId/takes', authenticateToken, requireRepoRole('contributor'), audioUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file was uploaded.' });
    }

    const track = await Asset.findOne({
      _id: req.params.trackId,
      repository: req.repository._id,
      isDeleted: false
    });

    if (!track) {
      // Remove temporary uploaded file if track doesn't exist
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Track not found.' });
    }

    const filePath = req.file.path;
    const waveformData = extractWaveformPeaks(filePath, 100);
    const checksum = getFileChecksum(filePath);
    const duration = estimateDurationSeconds(req.file.size, req.file.mimetype);

    const takeNumber = (track.takes.length || 0) + 1;
    const takeId = `take-${crypto.randomBytes(4).toString('hex')}`;
    const label = req.body.label && req.body.label.trim()
      ? req.body.label.trim()
      : `Take 0${takeNumber}`;

    const newTake = {
      takeId,
      takeNumber,
      label,
      audioUrl: `/uploads/audio/${path.basename(filePath)}`,
      originalFileName: req.file.originalname,
      fileHash: checksum,
      duration,
      sampleRate: 44100,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      waveformData,
      uploadedBy: req.user._id,
      notes: (req.body.notes || '').trim(),
      isDeleted: false,
      createdAt: new Date()
    };

    track.takes.push(newTake);
    // Set this newly uploaded take as active by default
    track.activeTakeId = takeId;
    await track.save();

    await track.populate('takes.uploadedBy', 'username displayName avatar');

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'TAKE_UPLOADED',
      details: `Uploaded new take "${newTake.label}" for track "${track.trackName}" on ${track.branch}.`
    }).save();

    res.status(201).json({
      message: `Uploaded ${newTake.label} successfully.`,
      track,
      take: newTake
    });
  } catch (err) {
    console.error('Error uploading take:', err);
    res.status(500).json({ error: 'Failed to process audio take.' });
  }
});

// Switch active take for a track
router.put('/:repoId/tracks/:trackId/active-take', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const { takeId } = req.body;
    const track = await Asset.findOne({
      _id: req.params.trackId,
      repository: req.repository._id,
      isDeleted: false
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }

    const takeExists = track.takes.find(t => t.takeId === takeId && !t.isDeleted);
    if (!takeExists) {
      return res.status(404).json({ error: 'Take not found on this track.' });
    }

    track.activeTakeId = takeId;
    await track.save();

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'TAKE_ACTIVATED',
      details: `Switched active take to "${takeExists.label}" on track "${track.trackName}".`
    }).save();

    res.json({ message: 'Active take updated.', track });
  } catch (err) {
    res.status(500).json({ error: 'Failed to switch active take.' });
  }
});

// Update track mix settings (volume, pan, mute, solo)
router.put('/:repoId/tracks/:trackId/mix', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const { volume, pan, isMuted, isSolo } = req.body;
    const track = await Asset.findOne({
      _id: req.params.trackId,
      repository: req.repository._id,
      isDeleted: false
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }

    if (volume !== undefined) track.volume = Math.max(0, Math.min(100, Number(volume)));
    if (pan !== undefined) track.pan = Math.max(-100, Math.min(100, Number(pan)));
    if (isMuted !== undefined) track.isMuted = Boolean(isMuted);
    if (isSolo !== undefined) track.isSolo = Boolean(isSolo);

    await track.save();
    res.json({ track });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update track mix settings.' });
  }
});

// Soft delete track (Moves to trash)
router.delete('/:repoId/tracks/:trackId', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const track = await Asset.findOne({
      _id: req.params.trackId,
      repository: req.repository._id,
      isDeleted: false
    });

    if (!track) {
      return res.status(404).json({ error: 'Track not found.' });
    }

    track.isDeleted = true;
    track.deletedAt = new Date();
    track.deletedBy = req.user._id;
    await track.save();

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'TRACK_SOFT_DELETED',
      details: `Moved track "${track.trackName}" to trash.`
    }).save();

    res.json({ message: `Track "${track.trackName}" moved to trash.`, trackId: track._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete track.' });
  }
});

// Secure download / export of audio take
router.get('/:repoId/takes/:takeId/download', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const track = await Asset.findOne({
      repository: req.repository._id,
      'takes.takeId': req.params.takeId
    });

    if (!track) {
      return res.status(404).json({ error: 'Audio take not found.' });
    }

    const take = track.takes.find(t => t.takeId === req.params.takeId);
    if (!take) {
      return res.status(404).json({ error: 'Audio take not found.' });
    }

    const filename = path.basename(take.audioUrl);
    const fullPath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Audio file not found on storage disk.' });
    }

    res.download(fullPath, take.originalFileName || filename);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download audio file.' });
  }
});

module.exports = router;
