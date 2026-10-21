const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const Asset = require('../models/Asset');
const LyricsDocument = require('../models/LyricsDocument');
const PullRequest = require('../models/PullRequest');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireRepoRole } = require('../middleware/auth');
const { computeLyricsDiff, compareTrackAssets } = require('../services/diffService');

// List branches for repository
router.get('/:repoId/branches', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const branches = await Branch.find({ repository: req.repository._id })
      .populate('createdBy', 'username displayName')
      .populate('headCommit')
      .sort({ createdAt: -1 });

    res.json({ branches, protectedBranches: req.repository.protectedBranches || ['main'] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch branches.' });
  }
});

// Create new branch
router.post('/:repoId/branches', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const { name, fromBranch } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Branch name is required.' });
    }

    const cleanBranchName = name.trim().toLowerCase().replace(/[^a-z0-9/_-]/g, '-');
    const sourceBranchName = fromBranch || req.repository.defaultBranch || 'main';

    const existingBranch = await Branch.findOne({
      repository: req.repository._id,
      name: cleanBranchName
    });

    if (existingBranch) {
      return res.status(400).json({ error: `Branch "${cleanBranchName}" already exists.` });
    }

    const parentBranch = await Branch.findOne({
      repository: req.repository._id,
      name: sourceBranchName
    });

    const newBranch = new Branch({
      repository: req.repository._id,
      name: cleanBranchName,
      createdFromBranch: sourceBranchName,
      headCommit: parentBranch ? parentBranch.headCommit : null,
      createdBy: req.user._id,
      isProtected: false
    });

    await newBranch.save();

    // Copy lyrics state from source branch
    const sourceLyrics = await LyricsDocument.findOne({
      repository: req.repository._id,
      branch: sourceBranchName
    });

    if (sourceLyrics) {
      const clonedLyrics = new LyricsDocument({
        repository: req.repository._id,
        branch: cleanBranchName,
        title: sourceLyrics.title,
        rawText: sourceLyrics.rawText,
        sections: sourceLyrics.sections,
        version: sourceLyrics.version,
        draft: {
          rawText: sourceLyrics.rawText,
          lastEditedBy: req.user._id,
          lastSavedAt: new Date()
        },
        publishedCommitId: sourceLyrics.publishedCommitId
      });
      await clonedLyrics.save();
    }

    // Copy active track state from source branch
    const sourceTracks = await Asset.find({
      repository: req.repository._id,
      branch: sourceBranchName,
      isDeleted: false
    });

    for (const track of sourceTracks) {
      const clonedTrack = new Asset({
        repository: req.repository._id,
        branch: cleanBranchName,
        trackName: track.trackName,
        category: track.category,
        activeTakeId: track.activeTakeId,
        takes: track.takes,
        volume: track.volume,
        pan: track.pan,
        isMuted: track.isMuted,
        isSolo: track.isSolo
      });
      await clonedTrack.save();
    }

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'BRANCH_CREATE',
      details: `Created new branch "${cleanBranchName}" branched off "${sourceBranchName}".`
    }).save();

    res.status(201).json({ branch: newBranch });
  } catch (err) {
    console.error('Error creating branch:', err);
    res.status(500).json({ error: 'Failed to create branch.' });
  }
});

// Compare two branches (diff lyrics and tracks)
router.get('/:repoId/branches/compare', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const { base, head } = req.query;

    if (!base || !head) {
      return res.status(400).json({ error: 'Both "base" and "head" branch query parameters are required.' });
    }

    const baseLyrics = await LyricsDocument.findOne({ repository: req.repository._id, branch: base });
    const headLyrics = await LyricsDocument.findOne({ repository: req.repository._id, branch: head });

    const lyricsDiff = computeLyricsDiff(
      baseLyrics ? baseLyrics.rawText : '',
      headLyrics ? headLyrics.rawText : ''
    );

    const baseTracks = await Asset.find({ repository: req.repository._id, branch: base, isDeleted: false });
    const headTracks = await Asset.find({ repository: req.repository._id, branch: head, isDeleted: false });

    const trackComparison = compareTrackAssets(headTracks, baseTracks);

    res.json({
      base,
      head,
      lyricsDiff,
      baseLyricsText: baseLyrics ? baseLyrics.rawText : '',
      headLyricsText: headLyrics ? headLyrics.rawText : '',
      trackComparison
    });
  } catch (err) {
    console.error('Error comparing branches:', err);
    res.status(500).json({ error: 'Failed to compare branches.' });
  }
});

// Delete branch
router.delete('/:repoId/branches/:branchName', authenticateToken, requireRepoRole('maintainer'), async (req, res) => {
  try {
    const { branchName } = req.params;

    if (branchName === 'main' || req.repository.protectedBranches.includes(branchName)) {
      return res.status(400).json({ error: `Cannot delete protected branch "${branchName}".` });
    }

    // Check if branch has an open PR
    const openPR = await PullRequest.findOne({
      repository: req.repository._id,
      sourceBranch: branchName,
      status: 'open'
    });

    if (openPR) {
      return res.status(400).json({
        error: `Cannot delete branch "${branchName}" because Pull Request #${openPR.prNumber} is currently open.`
      });
    }

    await Branch.findOneAndDelete({
      repository: req.repository._id,
      name: branchName
    });

    // Clean up branch assets and lyrics
    await Asset.deleteMany({ repository: req.repository._id, branch: branchName });
    await LyricsDocument.deleteMany({ repository: req.repository._id, branch: branchName });

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'BRANCH_DELETE',
      details: `Deleted branch "${branchName}".`
    }).save();

    res.json({ message: `Branch "${branchName}" successfully deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete branch.' });
  }
});

module.exports = router;
