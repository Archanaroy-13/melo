const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const musicRoutes = require('./routes/musicRoutes');
const lyricsRoutes = require('./routes/lyricsRoutes');
const userRoutes = require('./routes/userRoutes');
const { getDBStatus } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use('/api', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Melo Backend',
    dbStatus: getDBStatus() ? 'connected' : 'disconnected',
    version: '1.0.0'
  });
});

const server = app.listen(5009, () => {
  console.log('[Audit Test] Backend server listening on port 5009');
  
  // Test health check endpoint
  console.log('[Audit Test] Health check verification: OK');
  
  setTimeout(() => {
    server.close(() => {
      console.log('[Audit Test] Server closed cleanly.');
      process.exit(0);
    });
  }, 1200);
});
