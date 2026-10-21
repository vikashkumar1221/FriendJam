const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName, primaryRole, instruments } = req.body;

    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ error: 'Username, email, password, and display name are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.username === cleanUsername
          ? 'Username is already taken.'
          : 'Email is already registered.'
      });
    }

    const passwordHash = await User.hashPassword(password);
    const user = new User({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      displayName: displayName.trim(),
      primaryRole: primaryRole || 'Musician',
      instruments: instruments || ['Songwriting']
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        primaryRole: user.primaryRole,
        instruments: user.instruments
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body; // login can be username or email

    if (!login || !password) {
      return res.status(400).json({ error: 'Please provide both username/email and password.' });
    }

    const cleanLogin = login.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ username: cleanLogin }, { email: cleanLogin }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        primaryRole: user.primaryRole,
        instruments: user.instruments
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Current user profile
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName,
      primaryRole: req.user.primaryRole,
      instruments: req.user.instruments,
      bio: req.user.bio
    }
  });
});

// Search users for repository invitation
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim() : '';
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { username: new RegExp(query, 'i') },
          { displayName: new RegExp(query, 'i') },
          { email: new RegExp(query, 'i') }
        ]
      };
    }

    const users = await User.find(filter)
      .limit(10)
      .select('username displayName primaryRole instruments email');

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Error searching users.' });
  }
});

module.exports = router;
