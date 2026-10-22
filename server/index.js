const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const { seedInitialData } = require('./seeds/seedData');
const { UPLOADS_DIR } = require('./middleware/upload');

// Import routes
const authRoutes = require('./routes/authRoutes');
const repoRoutes = require('./routes/repoRoutes');
const branchRoutes = require('./routes/branchRoutes');
const commitRoutes = require('./routes/commitRoutes');
const audioRoutes = require('./routes/audioRoutes');
const lyricsRoutes = require('./routes/lyricsRoutes');
const pullRequestRoutes = require('./routes/pullRequestRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static serving for uploaded audio
app.use('/uploads/audio', express.static(UPLOADS_DIR));

// Static serving for frontend build if present
const CLIENT_DIST = path.join(__dirname, '../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    }
    next();
  });
}

// Attach Socket.io to req for routes to emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/repos', branchRoutes);
app.use('/api/repos', commitRoutes);
app.use('/api/repos', audioRoutes);
app.use('/api/repos', lyricsRoutes);
app.use('/api/repos', pullRequestRoutes);
app.use('/api/repos', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'FriendJam — GitHub for Musicians',
    timestamp: new Date().toISOString()
  });
});

// Real-time collaboration socket events
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Join repository room
  socket.on('join_repo', (repoId) => {
    socket.join(`repo:${repoId}`);
    console.log(`[Socket] ${socket.id} joined room repo:${repoId}`);
  });

  // Leave repository room
  socket.on('leave_repo', (repoId) => {
    socket.leave(`repo:${repoId}`);
  });

  // Real-time simultaneous lyrics editing
  socket.on('lyrics_draft_change', (data) => {
    socket.to(`repo:${data.repoId}`).emit('lyrics_draft_updated', {
      branch: data.branch,
      rawText: data.rawText,
      user: data.user
    });
  });

  // Real-time audio playback position sync (collaborative listening)
  socket.on('audio_sync_seek', (data) => {
    socket.to(`repo:${data.repoId}`).emit('audio_sync_seek', data);
  });

  // New comment posted
  socket.on('new_comment', (data) => {
    socket.to(`repo:${data.repoId}`).emit('comment_added', data.comment);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5055;

async function startServer() {
  try {
    await connectDB();
    await seedInitialData();

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🎵 FriendJam API running on http://localhost:${PORT}`);
      console.log(`   Audio uploads directory: ${UPLOADS_DIR}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start MusicCollab server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };
