const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireRepoRole } = require('../middleware/auth');

// Get comments for a resource (audio timestamps, lyrics line, pr, or commit)
router.get('/:repoId/comments', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const { resourceType, resourceId, lineId, trackId } = req.query;
    const filter = { repository: req.repository._id };

    if (resourceType) filter.resourceType = resourceType;
    if (resourceId) filter.resourceId = resourceId;
    if (lineId) filter.lineId = lineId;
    if (trackId) filter.trackId = trackId;

    const comments = await Comment.find(filter)
      .populate('author', 'username displayName avatar primaryRole')
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// Post a comment
router.post('/:repoId/comments', authenticateToken, requireRepoRole('viewer'), async (req, res) => {
  try {
    const { resourceType, resourceId, trackId, timestampSeconds, lineId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const comment = new Comment({
      repository: req.repository._id,
      resourceType: resourceType || 'audio_timestamp',
      resourceId: resourceId || '',
      trackId: trackId || null,
      timestampSeconds: timestampSeconds !== undefined ? Number(timestampSeconds) : null,
      lineId: lineId || null,
      author: req.user._id,
      content: content.trim()
    });

    await comment.save();
    await comment.populate('author', 'username displayName avatar primaryRole');

    res.status(201).json({ comment });
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: 'Failed to post comment.' });
  }
});

// Toggle resolved status
router.put('/:repoId/comments/:commentId/resolve', authenticateToken, requireRepoRole('contributor'), async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      repository: req.repository._id
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    comment.resolved = !comment.resolved;
    comment.resolvedBy = comment.resolved ? req.user._id : null;
    await comment.save();

    res.json({ comment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update comment resolution.' });
  }
});

module.exports = router;
