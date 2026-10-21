const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const SongRepository = require('../models/SongRepository');
const RepositoryMember = require('../models/RepositoryMember');
const Branch = require('../models/Branch');
const Commit = require('../models/Commit');
const Asset = require('../models/Asset');
const LyricsDocument = require('../models/LyricsDocument');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { authenticateToken, requireRepoRole, optionalAuth } = require('../middleware/auth');

// List repositories for current user (owned + member)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const ownedRepos = await SongRepository.find({ owner: req.user._id, isArchived: false })
      .populate('owner', 'username displayName')
      .sort({ updatedAt: -1 });

    const memberships = await RepositoryMember.find({ user: req.user._id })
      .populate({
        path: 'repository',
        populate: { path: 'owner', select: 'username displayName' }
      });

    const memberRepos = memberships
      .map(m => {
        const repo = m.repository;
        if (!repo || repo.isArchived) return null;
        return {
          ...repo.toObject(),
          myRole: m.role,
          myInstrument: m.instrumentRole
        };
      })
      .filter(Boolean);

    // Merge and deduplicate
    const map = new Map();
    ownedRepos.forEach(r => {
      map.set(r._id.toString(), { ...r.toObject(), myRole: 'owner' });
    });
    memberRepos.forEach(r => {
      if (!map.has(r._id.toString())) {
        map.set(r._id.toString(), r);
      }
    });

    const allRepos = Array.from(map.values());
    res.json({ repositories: allRepos });
  } catch (err) {
    console.error('Error fetching repos:', err);
    res.status(500).json({ error: 'Failed to fetch repositories.' });
  }
});

// Create a new song repository
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, genre, bpm, keySignature, timeSignature, visibility } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Song name is required.' });
    }

    const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug || 'untitled-song';

    // Ensure slug uniqueness for this user
    let existing = await SongRepository.findOne({ owner: req.user._id, slug });
    let counter = 1;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await SongRepository.findOne({ owner: req.user._id, slug });
      counter++;
    }

    const repo = new SongRepository({
      name: name.trim(),
      slug,
      description: (description || '').trim(),
      genre: (genre || 'Alternative Rock').trim(),
      bpm: Number(bpm) || 120,
      keySignature: (keySignature || 'C Major').trim(),
      timeSignature: (timeSignature || '4/4').trim(),
      visibility: visibility || 'public',
      owner: req.user._id,
      defaultBranch: 'main',
      protectedBranches: ['main']
    });

    await repo.save();

    // Initial commit hash
    const initialHash = crypto.randomBytes(4).toString('hex');
    const initialCommit = new Commit({
      repository: repo._id,
      branch: 'main',
      commitHash: initialHash,
      message: 'Initial song repository initialization',
      author: req.user._id,
      snapshot: {
        lyrics: {
          content: '[Intro]\n\n[Verse 1]\n\n[Chorus]\n\n[Outro]',
          sections: [
            { id: 'sec-intro', label: 'Intro', lines: [''] },
            { id: 'sec-v1', label: 'Verse 1', lines: [''] },
            { id: 'sec-chorus', label: 'Chorus', lines: [''] },
            { id: 'sec-outro', label: 'Outro', lines: [''] }
          ],
          version: 1
        },
        tracks: []
      },
      changes: {
        lyricsChanged: true,
        addedTakes: []
      }
    });
    await initialCommit.save();

    // Create main branch
    const mainBranch = new Branch({
      repository: repo._id,
      name: 'main',
      headCommit: initialCommit._id,
      isProtected: true,
      createdBy: req.user._id
    });
    await mainBranch.save();

    // Create initial lyrics document for main
    const initialLyrics = new LyricsDocument({
      repository: repo._id,
      branch: 'main',
      title: `${repo.name} - Lyrics`,
      rawText: '[Intro]\n\n[Verse 1]\n\n[Chorus]\n\n[Outro]',
      sections: [
        { sectionId: 'sec-intro', label: 'Intro', lines: [{ lineId: 'l-1', text: '' }] },
        { sectionId: 'sec-v1', label: 'Verse 1', lines: [{ lineId: 'l-2', text: '' }] },
        { sectionId: 'sec-chorus', label: 'Chorus', lines: [{ lineId: 'l-3', text: '' }] },
        { sectionId: 'sec-outro', label: 'Outro', lines: [{ lineId: 'l-4', text: '' }] }
      ],
      version: 1,
      draft: {
        rawText: '[Intro]\n\n[Verse 1]\n\n[Chorus]\n\n[Outro]',
        lastEditedBy: req.user._id,
        lastSavedAt: new Date()
      },
      publishedCommitId: initialCommit._id
    });
    await initialLyrics.save();

    // Audit log
    await new AuditLog({
      repository: repo._id,
      user: req.user._id,
      action: 'REPO_INIT',
      details: `Created new song repository "${repo.name}" with default main branch.`
    }).save();

    res.status(201).json({
      repository: repo,
      branch: mainBranch
    });
  } catch (err) {
    console.error('Error creating repository:', err);
    res.status(500).json({ error: 'Failed to create song repository.' });
  }
});

// Get single repository by owner username and slug
router.get('/by-slug/:username/:slug', optionalAuth, async (req, res) => {
  try {
    const ownerUser = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!ownerUser) {
      return res.status(404).json({ error: 'Owner not found.' });
    }

    const repo = await SongRepository.findOne({ owner: ownerUser._id, slug: req.params.slug.toLowerCase() })
      .populate('owner', 'username displayName primaryRole instruments avatar');

    if (!repo) {
      return res.status(404).json({ error: 'Song repository not found.' });
    }

    // Role check for current user
    let userRole = 'viewer';
    let isMember = false;

    if (req.user) {
      if (repo.owner._id.toString() === req.user._id.toString()) {
        userRole = 'owner';
        isMember = true;
      } else {
        const member = await RepositoryMember.findOne({ repository: repo._id, user: req.user._id });
        if (member) {
          userRole = member.role;
          isMember = true;
        }
      }
    }

    if (repo.visibility === 'private' && !isMember) {
      return res.status(403).json({ error: 'This repository is private.' });
    }

    const members = await RepositoryMember.find({ repository: repo._id })
      .populate('user', 'username displayName primaryRole instruments avatar');

    const branches = await Branch.find({ repository: repo._id }).sort({ name: 1 });

    res.json({
      repository: repo,
      userRole,
      members,
      branches
    });
  } catch (err) {
    console.error('Error fetching repository:', err);
    res.status(500).json({ error: 'Error loading repository.' });
  }
});

// Update repository settings (requires maintainer or owner)
router.put('/:id', authenticateToken, requireRepoRole('maintainer'), async (req, res) => {
  try {
    const { name, description, genre, bpm, keySignature, timeSignature, status, visibility, protectedBranches } = req.body;
    const repo = req.repository;

    if (name) repo.name = name.trim();
    if (description !== undefined) repo.description = description.trim();
    if (genre) repo.genre = genre.trim();
    if (bpm) repo.bpm = Number(bpm);
    if (keySignature) repo.keySignature = keySignature.trim();
    if (timeSignature) repo.timeSignature = timeSignature.trim();
    if (status) repo.status = status;
    if (visibility) repo.visibility = visibility;
    if (protectedBranches && Array.isArray(protectedBranches)) {
      repo.protectedBranches = protectedBranches;
    }

    await repo.save();

    await new AuditLog({
      repository: repo._id,
      user: req.user._id,
      action: 'REPO_SETTINGS_UPDATE',
      details: `Updated repository metadata and configuration.`
    }).save();

    res.json({ repository: repo });
  } catch (err) {
    console.error('Error updating repository:', err);
    res.status(500).json({ error: 'Failed to update repository settings.' });
  }
});

// Member Management: Invite collaborator
router.post('/:id/members', authenticateToken, requireRepoRole('maintainer'), async (req, res) => {
  try {
    const { usernameOrEmail, role, instrumentRole } = req.body;
    const cleanSearch = (usernameOrEmail || '').trim().toLowerCase();

    const targetUser = await User.findOne({
      $or: [{ username: cleanSearch }, { email: cleanSearch }]
    });

    if (!targetUser) {
      return res.status(404).json({ error: `User "${usernameOrEmail}" was not found.` });
    }

    if (targetUser._id.toString() === req.repository.owner.toString()) {
      return res.status(400).json({ error: 'Owner is already in the repository.' });
    }

    let member = await RepositoryMember.findOne({
      repository: req.repository._id,
      user: targetUser._id
    });

    if (member) {
      return res.status(400).json({ error: 'User is already a collaborator on this project.' });
    }

    member = new RepositoryMember({
      repository: req.repository._id,
      user: targetUser._id,
      role: role || 'contributor',
      instrumentRole: instrumentRole || targetUser.primaryRole || 'Musician',
      invitedBy: req.user._id
    });

    await member.save();
    await member.populate('user', 'username displayName primaryRole instruments avatar');

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'MEMBER_INVITED',
      details: `Invited @${targetUser.username} as ${member.role} (${member.instrumentRole}).`
    }).save();

    res.status(201).json({ member });
  } catch (err) {
    console.error('Error inviting member:', err);
    res.status(500).json({ error: 'Failed to invite collaborator.' });
  }
});

// Member Management: Update member role
router.put('/:id/members/:userId', authenticateToken, requireRepoRole('maintainer'), async (req, res) => {
  try {
    const { role, instrumentRole } = req.body;

    const member = await RepositoryMember.findOne({
      repository: req.repository._id,
      user: req.params.userId
    });

    if (!member) {
      return res.status(404).json({ error: 'Collaborator not found.' });
    }

    if (role) member.role = role;
    if (instrumentRole) member.instrumentRole = instrumentRole;

    await member.save();
    await member.populate('user', 'username displayName primaryRole instruments avatar');

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'MEMBER_ROLE_CHANGE',
      details: `Updated role for collaborator to ${member.role} (${member.instrumentRole}).`
    }).save();

    res.json({ member });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update member role.' });
  }
});

// Member Management: Remove member
router.delete('/:id/members/:userId', authenticateToken, requireRepoRole('maintainer'), async (req, res) => {
  try {
    const member = await RepositoryMember.findOneAndDelete({
      repository: req.repository._id,
      user: req.params.userId
    });

    if (!member) {
      return res.status(404).json({ error: 'Collaborator not found.' });
    }

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'MEMBER_REMOVED',
      details: `Removed collaborator from repository.`
    }).save();

    res.json({ message: 'Member successfully removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove collaborator.' });
  }
});

// Get Audit Logs
router.get('/:id/audit-log', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const logs = await AuditLog.find({ repository: req.repository._id })
      .populate('user', 'username displayName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load audit logs.' });
  }
});

// Trash bin retrieval
router.get('/:id/trash', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const deletedTracks = await Asset.find({
      repository: req.repository._id,
      isDeleted: true
    }).populate('deletedBy', 'username displayName');

    res.json({ trash: deletedTracks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load trash bin.' });
  }
});

// Restore from trash bin
router.post('/:id/trash/:assetId/restore', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const asset = await Asset.findOne({
      _id: req.params.assetId,
      repository: req.repository._id,
      isDeleted: true
    });

    if (!asset) {
      return res.status(404).json({ error: 'Deleted asset not found in trash.' });
    }

    asset.isDeleted = false;
    asset.deletedAt = null;
    asset.deletedBy = null;
    await asset.save();

    await new AuditLog({
      repository: req.repository._id,
      user: req.user._id,
      action: 'ASSET_RESTORED',
      details: `Restored track "${asset.trackName}" from trash bin.`
    }).save();

    res.json({ message: `Track "${asset.trackName}" restored successfully.`, asset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore asset.' });
  }
});

module.exports = router;
