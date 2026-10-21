const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const PullRequest = require('../models/PullRequest');
const Branch = require('../models/Branch');
const Commit = require('../models/Commit');
const Asset = require('../models/Asset');
const LyricsDocument = require('../models/LyricsDocument');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const { authenticateToken, requireRepoRole } = require('../middleware/auth');
const { computeLyricsDiff, detectLyricsConflicts, compareTrackAssets } = require('../services/diffService');

// List PRs for repository
router.get('/:repoId/pulls', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const status = req.query.status || 'open';
    const filter = { repository: req.repository._id };
    if (status !== 'all') {
      filter.status = status;
    }

    const prs = await PullRequest.find(filter)
      .populate('author', 'username displayName avatar')
      .populate('mergedBy', 'username displayName')
      .populate('reviewers.user', 'username displayName avatar')
      .sort({ createdAt: -1 });

    res.json({ pullRequests: prs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pull requests.' });
  }
});

// Create a new Pull Request
router.post('/:repoId/pulls', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const { title, description, sourceBranch, targetBranch } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required for the pull request.' });
    }

    if (!sourceBranch || !targetBranch) {
      return res.status(400).json({ error: 'Source and target branches must be specified.' });
    }

    if (sourceBranch === targetBranch) {
      return res.status(400).json({ error: 'Source and target branches cannot be the same.' });
    }

    const existingPR = await PullRequest.findOne({
      repository: req.repository._id,
      sourceBranch,
      targetBranch,
      status: 'open'
    });

    if (existingPR) {
      return res.status(400).json({ error: `An open pull request (#${existingPR.prNumber}) already exists for this branch comparison.` });
    }

    // Compare lyrics
    const sourceLyrics = await LyricsDocument.findOne({ repository: req.repository._id, branch: sourceBranch });
    const targetLyrics = await LyricsDocument.findOne({ repository: req.repository._id, branch: targetBranch });

    const sourceText = sourceLyrics ? sourceLyrics.rawText : '';
    const targetText = targetLyrics ? targetLyrics.rawText : '';

    const lyricsDiff = computeLyricsDiff(targetText, sourceText);
    const lyricsChanged = lyricsDiff.some(d => d.type !== 'unchanged');

    // Check for simultaneous conflict in lyrics
    const conflictResult = detectLyricsConflicts(targetText, targetText, sourceText);

    // Compare tracks
    const sourceTracks = await Asset.find({ repository: req.repository._id, branch: sourceBranch, isDeleted: false });
    const targetTracks = await Asset.find({ repository: req.repository._id, branch: targetBranch, isDeleted: false });
    const trackDiff = compareTrackAssets(sourceTracks, targetTracks);

    const count = await PullRequest.countDocuments({ repository: req.repository._id });
    const prNumber = count + 1;

    const pr = new PullRequest({
      repository: req.repository._id,
      prNumber,
      title: title.trim(),
      description: (description || '').trim(),
      sourceBranch,
      targetBranch,
      status: 'open',
      author: req.user._id,
      reviewers: [],
      diffSummary: {
        lyricsChanged,
        addedTakesCount: trackDiff.addedTracks.length + trackDiff.modifiedTracks.length,
        hasConflicts: conflictResult.hasConflicts,
        conflicts: conflictResult.conflicts.map(c => ({
          type: 'lyrics',
          message: `Conflict around line ${c.lineIndex + 1}`,
          details: c
        }))
      }
    });

    await pr.save();
    await pr.populate('author', 'username displayName avatar');

    // Notify repository owner and maintainers
    if (req.repository.owner.toString() !== req.user._id.toString()) {
      await new Notification({
        recipient: req.repository.owner,
        sender: req.user._id,
        repository: req.repository._id,
        type: 'pr_opened',
        title: `New Pull Request #${pr.prNumber}`,
        message: `@${req.user.username} opened PR: "${pr.title}" (${sourceBranch} -> ${targetBranch})`,
        link: `/${req.repository.slug}/pulls/${pr.prNumber}`
      }).save();
    }

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'PR_OPENED',
      details: `Opened PR #${pr.prNumber}: "${pr.title}" (${sourceBranch} -> ${targetBranch})`
    }).save();

    res.status(201).json({ pullRequest: pr });
  } catch (err) {
    console.error('Error opening PR:', err);
    res.status(500).json({ error: 'Failed to create pull request.' });
  }
});

// Get single PR with full diff and reviews
router.get('/:repoId/pulls/:prNumber', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const pr = await PullRequest.findOne({
      repository: req.repository._id,
      prNumber: Number(req.params.prNumber)
    })
      .populate('author', 'username displayName avatar')
      .populate('mergedBy', 'username displayName')
      .populate('reviewers.user', 'username displayName avatar');

    if (!pr) {
      return res.status(404).json({ error: 'Pull request not found.' });
    }

    const sourceLyrics = await LyricsDocument.findOne({ repository: req.repository._id, branch: pr.sourceBranch });
    const targetLyrics = await LyricsDocument.findOne({ repository: req.repository._id, branch: pr.targetBranch });

    const sourceTracks = await Asset.find({ repository: req.repository._id, branch: pr.sourceBranch, isDeleted: false });
    const targetTracks = await Asset.find({ repository: req.repository._id, branch: pr.targetBranch, isDeleted: false });

    const lyricsDiff = computeLyricsDiff(
      targetLyrics ? targetLyrics.rawText : '',
      sourceLyrics ? sourceLyrics.rawText : ''
    );

    const trackComparison = compareTrackAssets(sourceTracks, targetTracks);

    res.json({
      pullRequest: pr,
      lyricsDiff,
      trackComparison,
      sourceLyricsText: sourceLyrics ? sourceLyrics.rawText : '',
      targetLyricsText: targetLyrics ? targetLyrics.rawText : ''
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load pull request.' });
  }
});

// Submit review (Approve or Request Changes)
router.post('/:repoId/pulls/:prNumber/review', authenticateToken, requireRepoRole('reviewer'), async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!['approved', 'changes_requested'].includes(status)) {
      return res.status(400).json({ error: 'Review status must be "approved" or "changes_requested".' });
    }

    const pr = await PullRequest.findOne({
      repository: req.repository._id,
      prNumber: Number(req.params.prNumber)
    });

    if (!pr) {
      return res.status(404).json({ error: 'Pull request not found.' });
    }

    if (pr.status !== 'open') {
      return res.status(400).json({ error: 'Cannot review a closed or merged pull request.' });
    }

    // Add or update review from this user
    const existingIndex = pr.reviewers.findIndex(r => r.user.toString() === req.user._id.toString());
    if (existingIndex >= 0) {
      pr.reviewers[existingIndex].status = status;
      pr.reviewers[existingIndex].note = (note || '').trim();
      pr.reviewers[existingIndex].reviewedAt = new Date();
    } else {
      pr.reviewers.push({
        user: req.user._id,
        status,
        note: (note || '').trim(),
        reviewedAt: new Date()
      });
    }

    await pr.save();
    await pr.populate('reviewers.user', 'username displayName avatar');

    // Notify PR author
    if (pr.author.toString() !== req.user._id.toString()) {
      await new Notification({
        recipient: pr.author,
        sender: req.user._id,
        repository: req.repository._id,
        type: 'review_submitted',
        title: `Review on PR #${pr.prNumber}: ${status.toUpperCase().replace('_', ' ')}`,
        message: `@${req.user.username} marked your PR as ${status.replace('_', ' ')}.`,
        link: `/${req.repository.slug}/pulls/${pr.prNumber}`
      }).save();
    }

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'PR_REVIEW_SUBMITTED',
      details: `Submitted review "${status}" on PR #${pr.prNumber}.`
    }).save();

    res.json({ message: 'Review successfully recorded.', pullRequest: pr });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record review.' });
  }
});

// Merge Pull Request
router.post('/:repoId/pulls/:prNumber/merge', authenticateToken, async (req, res) => {
  try {
    const pr = await PullRequest.findOne({
      repository: req.repository._id,
      prNumber: Number(req.params.prNumber)
    });

    if (!pr) {
      return res.status(404).json({ error: 'Pull request not found.' });
    }

    if (pr.status !== 'open') {
      return res.status(400).json({ error: 'This pull request is already closed or merged.' });
    }

    // Permission check: To merge into a protected branch (like 'main'), user MUST be maintainer or owner
    const isProtected = (req.repository.protectedBranches || ['main']).includes(pr.targetBranch);
    if (isProtected) {
      const isOwner = req.repository.owner.toString() === req.user._id.toString();
      const isMaintainer = req.repoRole === 'maintainer';

      if (!isOwner && !isMaintainer) {
        return res.status(403).json({
          error: `Branch "${pr.targetBranch}" is protected. Only maintainers or repository owners can merge into it.`
        });
      }
    }

    // Safety rule: Do not merge unresolved conflicts automatically
    if (pr.diffSummary && pr.diffSummary.hasConflicts) {
      return res.status(409).json({
        error: 'Cannot merge with unresolved conflicts. Please resolve conflicting lyrics/tracks before merging.'
      });
    }

    // Fetch states
    const sourceLyrics = await LyricsDocument.findOne({ repository: req.repository._id, branch: pr.sourceBranch });
    const targetLyrics = await LyricsDocument.findOne({ repository: req.repository._id, branch: pr.targetBranch });

    const sourceTracks = await Asset.find({ repository: req.repository._id, branch: pr.sourceBranch, isDeleted: false });
    const targetTracks = await Asset.find({ repository: req.repository._id, branch: pr.targetBranch, isDeleted: false });

    // Apply lyrics merge: update target lyrics to source's content
    if (sourceLyrics && targetLyrics) {
      targetLyrics.rawText = sourceLyrics.rawText;
      targetLyrics.sections = sourceLyrics.sections;
      targetLyrics.version += 1;
      targetLyrics.draft.rawText = sourceLyrics.rawText;
      targetLyrics.draft.lastEditedBy = req.user._id;
      targetLyrics.draft.lastSavedAt = new Date();
      await targetLyrics.save();
    }

    // Apply tracks merge:
    // Safe rule: If target has the track, add any new takes from source to target rather than overwriting
    for (const sTrack of sourceTracks) {
      const existingInTarget = targetTracks.find(t => t.trackName === sTrack.trackName);
      if (existingInTarget) {
        // Append takes that don't already exist in target
        for (const take of sTrack.takes) {
          const alreadyHasTake = existingInTarget.takes.some(t => t.takeId === take.takeId || t.fileHash === take.fileHash);
          if (!alreadyHasTake) {
            const nextTakeNumber = existingInTarget.takes.length + 1;
            existingInTarget.takes.push({
              takeId: take.takeId,
              takeNumber: nextTakeNumber,
              label: `${take.label} (from ${pr.sourceBranch})`,
              audioUrl: take.audioUrl,
              originalFileName: take.originalFileName,
              fileHash: take.fileHash,
              duration: take.duration,
              sampleRate: take.sampleRate,
              fileSize: take.fileSize,
              mimeType: take.mimeType,
              waveformData: take.waveformData,
              uploadedBy: take.uploadedBy,
              notes: take.notes,
              createdAt: take.createdAt
            });
          }
        }
        // Activate incoming take
        existingInTarget.activeTakeId = sTrack.activeTakeId;
        await existingInTarget.save();
      } else {
        // Brand new track: clone into target branch
        const newTargetTrack = new Asset({
          repository: req.repository._id,
          branch: pr.targetBranch,
          trackName: sTrack.trackName,
          category: sTrack.category,
          activeTakeId: sTrack.activeTakeId,
          takes: sTrack.takes,
          volume: sTrack.volume,
          pan: sTrack.pan,
          isMuted: sTrack.isMuted,
          isSolo: sTrack.isSolo
        });
        await newTargetTrack.save();
      }
    }

    // Create merge commit
    const targetBranchDoc = await Branch.findOne({ repository: req.repository._id, name: pr.targetBranch });
    const sourceBranchDoc = await Branch.findOne({ repository: req.repository._id, name: pr.sourceBranch });

    const parentCommits = [];
    if (targetBranchDoc && targetBranchDoc.headCommit) parentCommits.push(targetBranchDoc.headCommit);
    if (sourceBranchDoc && sourceBranchDoc.headCommit) parentCommits.push(sourceBranchDoc.headCommit);

    const mergeHash = crypto.randomBytes(4).toString('hex');
    const mergeCommit = new Commit({
      repository: req.repository._id,
      branch: pr.targetBranch,
      commitHash: mergeHash,
      parentCommits,
      message: `Merge pull request #${pr.prNumber} from ${pr.sourceBranch} into ${pr.targetBranch}\n\n${pr.title}`,
      author: req.user._id,
      snapshot: {
        lyrics: targetLyrics ? {
          content: targetLyrics.rawText,
          sections: targetLyrics.sections.map(s => ({
            id: s.sectionId,
            label: s.label,
            lines: s.lines.map(l => l.text)
          })),
          version: targetLyrics.version
        } : null,
        tracks: []
      },
      changes: {
        lyricsChanged: Boolean(pr.diffSummary.lyricsChanged)
      }
    });

    await mergeCommit.save();

    if (targetBranchDoc) {
      targetBranchDoc.headCommit = mergeCommit._id;
      await targetBranchDoc.save();
    }

    // Finalize PR
    pr.status = 'merged';
    pr.mergeCommit = mergeCommit._id;
    pr.mergedBy = req.user._id;
    pr.mergedAt = new Date();
    await pr.save();

    // Notify author
    await new Notification({
      recipient: pr.author,
      sender: req.user._id,
      repository: req.repository._id,
      type: 'pr_merged',
      title: `PR #${pr.prNumber} Merged!`,
      message: `Your pull request "${pr.title}" was successfully merged into ${pr.targetBranch}.`,
      link: `/${req.repository.slug}/pulls/${pr.prNumber}`
    }).save();

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'PR_MERGED',
      details: `Merged PR #${pr.prNumber} [${mergeHash}] into ${pr.targetBranch}.`
    }).save();

    res.json({
      message: `Pull Request #${pr.prNumber} merged successfully.`,
      pullRequest: pr,
      mergeCommit
    });
  } catch (err) {
    console.error('Error merging PR:', err);
    res.status(500).json({ error: 'Failed to merge pull request.' });
  }
});

// Close PR without merging
router.post('/:repoId/pulls/:prNumber/close', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const pr = await PullRequest.findOne({
      repository: req.repository._id,
      prNumber: Number(req.params.prNumber)
    });

    if (!pr) {
      return res.status(404).json({ error: 'Pull request not found.' });
    }

    if (pr.status !== 'open') {
      return res.status(400).json({ error: 'Cannot close an already finished PR.' });
    }

    pr.status = 'closed';
    pr.closedAt = new Date();
    await pr.save();

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'PR_CLOSED',
      details: `Closed PR #${pr.prNumber} without merging.`
    }).save();

    res.json({ message: 'Pull request closed.', pullRequest: pr });
  } catch (err) {
    res.status(500).json({ error: 'Failed to close pull request.' });
  }
});

module.exports = router;
