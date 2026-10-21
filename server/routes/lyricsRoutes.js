const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const LyricsDocument = require('../models/LyricsDocument');
const Commit = require('../models/Commit');
const Branch = require('../models/Branch');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireRepoRole } = require('../middleware/auth');
const { detectLyricsConflicts, computeLyricsDiff } = require('../services/diffService');

// Parse text into structured sections and lines
function parseSectionsFromText(rawText, userId, username) {
  const lines = (rawText || '').split('\n');
  const sections = [];
  let currentSection = {
    sectionId: 'sec-intro',
    label: 'Intro',
    lines: []
  };

  const headerRegex = /^\s*\[(.*?)\]\s*$/;

  lines.forEach((lineText, idx) => {
    const match = lineText.match(headerRegex);
    if (match) {
      if (currentSection.lines.length > 0 || currentSection.label !== 'Intro') {
        sections.push(currentSection);
      }
      currentSection = {
        sectionId: `sec-${idx}-${crypto.randomBytes(3).toString('hex')}`,
        label: match[1].trim(),
        lines: []
      };
    } else {
      currentSection.lines.push({
        lineId: `line-${idx}-${crypto.randomBytes(3).toString('hex')}`,
        text: lineText,
        contributor: userId,
        contributorName: username,
        lastModifiedAt: new Date()
      });
    }
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [
    { sectionId: 'sec-main', label: 'Verse 1', lines: [{ lineId: 'line-0', text: rawText, contributor: userId, contributorName: username, lastModifiedAt: new Date() }] }
  ];
}

// Get lyrics document for a branch
router.get('/:repoId/lyrics', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const branchName = req.query.branch || req.repository.defaultBranch || 'main';

    let lyricsDoc = await LyricsDocument.findOne({
      repository: req.repository._id,
      branch: branchName
    }).populate('draft.lastEditedBy', 'username displayName');

    if (!lyricsDoc) {
      // Create default if not present
      lyricsDoc = new LyricsDocument({
        repository: req.repository._id,
        branch: branchName,
        title: `${req.repository.name} - Lyrics`,
        rawText: '[Intro]\n\n[Verse 1]\n\n[Chorus]\n\n[Bridge]\n\n[Outro]',
        sections: [
          { sectionId: 's-1', label: 'Intro', lines: [] },
          { sectionId: 's-2', label: 'Verse 1', lines: [] },
          { sectionId: 's-3', label: 'Chorus', lines: [] },
          { sectionId: 's-4', label: 'Bridge', lines: [] },
          { sectionId: 's-5', label: 'Outro', lines: [] }
        ],
        draft: {
          rawText: '[Intro]\n\n[Verse 1]\n\n[Chorus]\n\n[Bridge]\n\n[Outro]',
          lastEditedBy: req.user._id,
          lastSavedAt: new Date()
        }
      });
      await lyricsDoc.save();
    }

    res.json({ lyrics: lyricsDoc, branch: branchName });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lyrics.' });
  }
});

// Autosave draft lyrics
router.put('/:repoId/lyrics/draft', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const { branch, rawText, expectedVersion } = req.body;
    const branchName = branch || req.repository.defaultBranch || 'main';

    let lyricsDoc = await LyricsDocument.findOne({
      repository: req.repository._id,
      branch: branchName
    });

    if (!lyricsDoc) {
      lyricsDoc = new LyricsDocument({
        repository: req.repository._id,
        branch: branchName,
        title: `${req.repository.name} - Lyrics`,
        rawText: rawText || '',
        version: 1
      });
    }

    // Optimistic concurrency check: if someone else committed since this client loaded
    if (expectedVersion && lyricsDoc.version > expectedVersion) {
      // Conflict check between current published lyrics and user's draft
      const conflictCheck = detectLyricsConflicts(lyricsDoc.rawText, lyricsDoc.draft.rawText, rawText);
      if (conflictCheck.hasConflicts) {
        return res.status(409).json({
          error: 'Simultaneous edit conflict detected.',
          hasConflict: true,
          conflicts: conflictCheck.conflicts,
          serverVersion: lyricsDoc.version,
          serverText: lyricsDoc.rawText,
          mergedPreview: conflictCheck.mergedPreview
        });
      }
    }

    lyricsDoc.draft.rawText = rawText;
    lyricsDoc.draft.lastEditedBy = req.user._id;
    lyricsDoc.draft.lastSavedAt = new Date();

    await lyricsDoc.save();
    res.json({
      message: 'Draft autosaved.',
      lastSavedAt: lyricsDoc.draft.lastSavedAt,
      version: lyricsDoc.version
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to autosave draft.' });
  }
});

// Commit lyrics changes to repository history
router.post('/:repoId/lyrics/commit', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const { branch, commitMessage, rawText } = req.body;
    const branchName = branch || req.repository.defaultBranch || 'main';

    if (!commitMessage || !commitMessage.trim()) {
      return res.status(400).json({ error: 'A commit message is required.' });
    }

    let lyricsDoc = await LyricsDocument.findOne({
      repository: req.repository._id,
      branch: branchName
    });

    const newText = rawText !== undefined ? rawText : (lyricsDoc ? lyricsDoc.draft.rawText : '');
    const previousText = lyricsDoc ? lyricsDoc.rawText : '';

    const sections = parseSectionsFromText(newText, req.user._id, req.user.displayName || req.user.username);

    if (!lyricsDoc) {
      lyricsDoc = new LyricsDocument({
        repository: req.repository._id,
        branch: branchName,
        title: `${req.repository.name} - Lyrics`,
        rawText: newText,
        sections,
        version: 1
      });
    } else {
      lyricsDoc.rawText = newText;
      lyricsDoc.sections = sections;
      lyricsDoc.version += 1;
      lyricsDoc.draft.rawText = newText;
      lyricsDoc.draft.lastEditedBy = req.user._id;
      lyricsDoc.draft.lastSavedAt = new Date();
    }

    const branchDoc = await Branch.findOne({ repository: req.repository._id, name: branchName });

    const commitHash = crypto.randomBytes(4).toString('hex');
    const commit = new Commit({
      repository: req.repository._id,
      branch: branchName,
      commitHash,
      parentCommits: branchDoc && branchDoc.headCommit ? [branchDoc.headCommit] : [],
      message: commitMessage.trim(),
      author: req.user._id,
      snapshot: {
        lyrics: {
          content: newText,
          sections: sections.map(s => ({
            id: s.sectionId,
            label: s.label,
            lines: s.lines.map(l => l.text)
          })),
          version: lyricsDoc.version
        },
        tracks: []
      },
      changes: {
        lyricsChanged: true
      }
    });

    await commit.save();

    lyricsDoc.publishedCommitId = commit._id;
    await lyricsDoc.save();

    if (branchDoc) {
      branchDoc.headCommit = commit._id;
      await branchDoc.save();
    }

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'LYRICS_COMMITTED',
      details: `Committed lyrics changes [${commitHash}] to ${branchName}: "${commit.message}"`
    }).save();

    res.status(201).json({
      message: 'Lyrics successfully committed.',
      commit,
      lyrics: lyricsDoc
    });
  } catch (err) {
    console.error('Error committing lyrics:', err);
    res.status(500).json({ error: 'Failed to commit lyrics.' });
  }
});

// Resolve lyrics conflict manually
router.post('/:repoId/lyrics/resolve-conflict', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const { branch, resolvedText, commitMessage } = req.body;
    const branchName = branch || req.repository.defaultBranch || 'main';

    let lyricsDoc = await LyricsDocument.findOne({
      repository: req.repository._id,
      branch: branchName
    });

    if (!lyricsDoc) {
      return res.status(404).json({ error: 'Lyrics document not found.' });
    }

    const sections = parseSectionsFromText(resolvedText, req.user._id, req.user.displayName || req.user.username);
    lyricsDoc.rawText = resolvedText;
    lyricsDoc.sections = sections;
    lyricsDoc.version += 1;
    lyricsDoc.draft.rawText = resolvedText;
    lyricsDoc.draft.lastEditedBy = req.user._id;
    lyricsDoc.draft.lastSavedAt = new Date();

    const branchDoc = await Branch.findOne({ repository: req.repository._id, name: branchName });
    const commitHash = crypto.randomBytes(4).toString('hex');
    const commit = new Commit({
      repository: req.repository._id,
      branch: branchName,
      commitHash,
      parentCommits: branchDoc && branchDoc.headCommit ? [branchDoc.headCommit] : [],
      message: commitMessage || `Resolve simultaneous lyrics editing conflict [${commitHash}]`,
      author: req.user._id,
      snapshot: {
        lyrics: {
          content: resolvedText,
          sections: sections.map(s => ({
            id: s.sectionId,
            label: s.label,
            lines: s.lines.map(l => l.text)
          })),
          version: lyricsDoc.version
        },
        tracks: []
      },
      changes: {
        lyricsChanged: true
      }
    });

    await commit.save();
    lyricsDoc.publishedCommitId = commit._id;
    await lyricsDoc.save();

    if (branchDoc) {
      branchDoc.headCommit = commit._id;
      await branchDoc.save();
    }

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'LYRICS_CONFLICT_RESOLVED',
      details: `Resolved editing conflict on ${branchName} via commit [${commitHash}].`
    }).save();

    res.json({
      message: 'Conflict resolved and committed.',
      commit,
      lyrics: lyricsDoc
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve conflict.' });
  }
});

module.exports = router;
