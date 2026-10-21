const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Commit = require('../models/Commit');
const Branch = require('../models/Branch');
const Asset = require('../models/Asset');
const LyricsDocument = require('../models/LyricsDocument');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireRepoRole } = require('../middleware/auth');
const { computeLyricsDiff } = require('../services/diffService');

// List commits for a branch
router.get('/:repoId/commits', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const branchName = req.query.branch || req.repository.defaultBranch || 'main';

    const commits = await Commit.find({
      repository: req.repository._id,
      branch: branchName
    })
      .populate('author', 'username displayName primaryRole avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ commits, branch: branchName });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch commits.' });
  }
});

// Get single commit details with diff against its parent
router.get('/:repoId/commits/:commitHash', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const commit = await Commit.findOne({
      repository: req.repository._id,
      commitHash: req.params.commitHash
    }).populate('author', 'username displayName primaryRole avatar');

    if (!commit) {
      return res.status(404).json({ error: 'Commit not found.' });
    }

    let parentCommit = null;
    let lyricsDiff = [];

    if (commit.parentCommits && commit.parentCommits.length > 0) {
      parentCommit = await Commit.findById(commit.parentCommits[0]);
      if (parentCommit && parentCommit.snapshot && parentCommit.snapshot.lyrics) {
        lyricsDiff = computeLyricsDiff(
          parentCommit.snapshot.lyrics.content || '',
          commit.snapshot.lyrics ? commit.snapshot.lyrics.content || '' : ''
        );
      }
    }

    res.json({
      commit,
      parentCommit,
      lyricsDiff
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch commit details.' });
  }
});

// Create a new commit manually or upon saving
router.post('/:repoId/commits', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const { branch, message, lyricsChanged, addedTakes } = req.body;
    const branchName = branch || req.repository.defaultBranch || 'main';

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Commit message is required.' });
    }

    const branchDoc = await Branch.findOne({ repository: req.repository._id, name: branchName });
    if (!branchDoc) {
      return res.status(404).json({ error: `Branch "${branchName}" not found.` });
    }

    // Capture current lyrics state
    const currentLyrics = await LyricsDocument.findOne({ repository: req.repository._id, branch: branchName });

    // Capture current tracks state
    const currentTracks = await Asset.find({ repository: req.repository._id, branch: branchName, isDeleted: false });

    const trackSnapshots = currentTracks.map(t => {
      const activeTake = t.takes.find(tk => tk.takeId === t.activeTakeId) || t.takes[0];
      return {
        assetId: t._id,
        trackName: t.trackName,
        category: t.category,
        takeId: t.activeTakeId,
        takeNumber: activeTake ? activeTake.takeNumber : 1,
        label: activeTake ? activeTake.label : '',
        audioUrl: activeTake ? activeTake.audioUrl : '',
        originalFileName: activeTake ? activeTake.originalFileName : '',
        duration: activeTake ? activeTake.duration : 0,
        volume: t.volume,
        pan: t.pan,
        isMuted: t.isMuted,
        isSolo: t.isSolo
      };
    });

    const commitHash = crypto.randomBytes(4).toString('hex');
    const commit = new Commit({
      repository: req.repository._id,
      branch: branchName,
      commitHash,
      parentCommits: branchDoc.headCommit ? [branchDoc.headCommit] : [],
      message: message.trim(),
      author: req.user._id,
      snapshot: {
        lyrics: currentLyrics ? {
          content: currentLyrics.rawText,
          sections: (currentLyrics.sections || []).map(s => ({
            id: s.sectionId,
            label: s.label,
            lines: (s.lines || []).map(l => l.text)
          })),
          version: currentLyrics.version
        } : null,
        tracks: trackSnapshots
      },
      changes: {
        lyricsChanged: Boolean(lyricsChanged),
        addedTakes: addedTakes || []
      }
    });

    await commit.save();

    // Update branch headCommit
    branchDoc.headCommit = commit._id;
    await branchDoc.save();

    // Update publishedCommitId on lyrics
    if (currentLyrics) {
      currentLyrics.publishedCommitId = commit._id;
      await currentLyrics.save();
    }

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'COMMIT_CREATED',
      details: `Created commit [${commitHash}] on ${branchName}: "${commit.message}"`
    }).save();

    res.status(201).json({ commit });
  } catch (err) {
    console.error('Error creating commit:', err);
    res.status(500).json({ error: 'Failed to record commit.' });
  }
});

// Revert a commit (creates a new commit restoring the parent's state)
router.post('/:repoId/commits/:commitHash/revert', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const targetCommit = await Commit.findOne({
      repository: req.repository._id,
      commitHash: req.params.commitHash
    });

    if (!targetCommit) {
      return res.status(404).json({ error: 'Commit to revert was not found.' });
    }

    if (!targetCommit.parentCommits || targetCommit.parentCommits.length === 0) {
      return res.status(400).json({ error: 'Cannot revert the initial repository commit.' });
    }

    const parentCommit = await Commit.findById(targetCommit.parentCommits[0]);
    if (!parentCommit) {
      return res.status(404).json({ error: 'Parent commit of the target commit could not be loaded.' });
    }

    const branchName = targetCommit.branch;
    const branchDoc = await Branch.findOne({ repository: req.repository._id, name: branchName });

    // Restore lyrics state to parent commit
    if (parentCommit.snapshot.lyrics) {
      const lyricsDoc = await LyricsDocument.findOne({ repository: req.repository._id, branch: branchName });
      if (lyricsDoc) {
        lyricsDoc.rawText = parentCommit.snapshot.lyrics.content;
        lyricsDoc.version += 1;
        lyricsDoc.draft.rawText = parentCommit.snapshot.lyrics.content;
        lyricsDoc.draft.lastEditedBy = req.user._id;
        lyricsDoc.draft.lastSavedAt = new Date();
        await lyricsDoc.save();
      }
    }

    // Revert commit creates a new commit
    const revertHash = crypto.randomBytes(4).toString('hex');
    const revertCommit = new Commit({
      repository: req.repository._id,
      branch: branchName,
      commitHash: revertHash,
      parentCommits: branchDoc.headCommit ? [branchDoc.headCommit] : [],
      message: `Revert "[${targetCommit.commitHash}] ${targetCommit.message}"`,
      author: req.user._id,
      snapshot: parentCommit.snapshot,
      changes: {
        lyricsChanged: Boolean(targetCommit.changes.lyricsChanged),
        revertedFromCommit: targetCommit.commitHash
      }
    });

    await revertCommit.save();

    branchDoc.headCommit = revertCommit._id;
    await branchDoc.save();

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'COMMIT_REVERTED',
      details: `Reverted commit [${targetCommit.commitHash}] via new commit [${revertHash}].`
    }).save();

    res.json({
      message: `Successfully reverted commit ${targetCommit.commitHash}.`,
      commit: revertCommit
    });
  } catch (err) {
    console.error('Error reverting commit:', err);
    res.status(500).json({ error: 'Failed to revert commit.' });
  }
});

// Restore previous version (creates new commit pointing to historic snapshot)
router.post('/:repoId/commits/:commitHash/restore', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const historicalCommit = await Commit.findOne({
      repository: req.repository._id,
      commitHash: req.params.commitHash
    });

    if (!historicalCommit) {
      return res.status(404).json({ error: 'Historical commit not found.' });
    }

    const branchName = req.body.branch || historicalCommit.branch;
    const branchDoc = await Branch.findOne({ repository: req.repository._id, name: branchName });

    if (!branchDoc) {
      return res.status(404).json({ error: `Target branch "${branchName}" not found.` });
    }

    // Apply snapshot lyrics
    if (historicalCommit.snapshot && historicalCommit.snapshot.lyrics) {
      const lyricsDoc = await LyricsDocument.findOne({ repository: req.repository._id, branch: branchName });
      if (lyricsDoc) {
        lyricsDoc.rawText = historicalCommit.snapshot.lyrics.content;
        lyricsDoc.version += 1;
        lyricsDoc.draft.rawText = historicalCommit.snapshot.lyrics.content;
        await lyricsDoc.save();
      }
    }

    const restoreHash = crypto.randomBytes(4).toString('hex');
    const restoreCommit = new Commit({
      repository: req.repository._id,
      branch: branchName,
      commitHash: restoreHash,
      parentCommits: branchDoc.headCommit ? [branchDoc.headCommit] : [],
      message: `Restore state to commit [${historicalCommit.commitHash}]: ${historicalCommit.message}`,
      author: req.user._id,
      snapshot: historicalCommit.snapshot,
      changes: {
        restoredFromCommit: historicalCommit.commitHash
      }
    });

    await restoreCommit.save();

    branchDoc.headCommit = restoreCommit._id;
    await branchDoc.save();

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'VERSION_RESTORED',
      details: `Restored repository state from commit [${historicalCommit.commitHash}] on ${branchName}.`
    }).save();

    res.json({
      message: `Successfully restored state from commit ${historicalCommit.commitHash}.`,
      commit: restoreCommit
    });
  } catch (err) {
    console.error('Error restoring commit:', err);
    res.status(500).json({ error: 'Failed to restore historical commit.' });
  }
});

module.exports = router;
