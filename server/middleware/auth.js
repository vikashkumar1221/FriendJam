const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SongRepository = require('../models/SongRepository');
const RepositoryMember = require('../models/RepositoryMember');

const JWT_SECRET = process.env.JWT_SECRET || 'musiccollab_super_secret_jwt_key_2026';

// Verify Bearer JWT
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied: No authentication token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'User does not exist or token is invalid.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

// Optional auth for public repo access
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-passwordHash');
    }
  } catch {
    // Continue without user
  }
  next();
}

// Role-based authorization for a repository
const ROLE_HIERARCHY = {
  viewer: 1,
  contributor: 2,
  reviewer: 3,
  maintainer: 4,
  owner: 5
};

function requireRepoRole(minimumRole) {
  return async (req, res, next) => {
    try {
      const { repoId, id } = req.params;
      const repositoryId = repoId || id;

      if (!repositoryId) {
        return res.status(400).json({ error: 'Repository ID is required for authorization check.' });
      }

      const repository = await SongRepository.findById(repositoryId);
      if (!repository) {
        return res.status(404).json({ error: 'Repository not found.' });
      }

      req.repository = repository;

      // Check if user is owner of repo
      if (repository.owner.toString() === req.user._id.toString()) {
        req.repoRole = 'owner';
        return next();
      }

      // Check membership
      const member = await RepositoryMember.findOne({
        repository: repository._id,
        user: req.user._id
      });

      if (!member) {
        // If repo is public and minimum required is viewer, allow read
        if (repository.visibility === 'public' && minimumRole === 'viewer') {
          req.repoRole = 'viewer';
          return next();
        }
        return res.status(403).json({ error: 'You are not a member of this repository.' });
      }

      const userRolePower = ROLE_HIERARCHY[member.role] || 0;
      const requiredPower = ROLE_HIERARCHY[minimumRole] || 1;

      if (userRolePower < requiredPower) {
        return res.status(403).json({
          error: `Insufficient permissions: Requires '${minimumRole}', but your role is '${member.role}'.`
        });
      }

      req.repoRole = member.role;
      req.repoMember = member;
      next();
    } catch (err) {
      console.error('Role auth error:', err);
      res.status(500).json({ error: 'Internal authorization error.' });
    }
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRepoRole,
  JWT_SECRET,
  ROLE_HIERARCHY
};
