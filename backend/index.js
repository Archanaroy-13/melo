const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectDB, getDBStatus } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const musicRoutes = require('./routes/musicRoutes');
const lyricsRoutes = require('./routes/lyricsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
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

app.listen(PORT, () => {
  console.log(`[Melo Backend] Server running on port ${PORT}`);
});
