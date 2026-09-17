const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');

const getJwtSecret = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
    console.error('[FATAL ERROR]: SESSION_SECRET environment variable is missing in production mode!');
    throw new Error('SESSION_SECRET must be explicitly defined in production mode.');
  }
  return process.env.SESSION_SECRET || 'melo_private_secret_key_change_in_production_2026';
};

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const setup = async (req, res) => {
  if (!getDBStatus()) {
    return res.status(503).json({
      error: 'Database connection unavailable.',
      message: 'MongoDB connection unavailable. Configure MONGODB_URI in .env.'
    });
  }

  try {
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      return res.status(403).json({
        error: 'Setup disabled.',
        message: 'Master user account already exists. Setup is permanently disabled.'
      });
    }

    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: username.trim().toLowerCase(),
      passwordHash
    });

    const token = jwt.sign({ id: user._id, username: user.username }, getJwtSecret(), { expiresIn: '7d' });
    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'Master account created successfully.',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error('[Auth Setup Error]:', error);
    return res.status(500).json({ error: 'Failed to create master user account.' });
  }
};

const login = async (req, res) => {
  if (!getDBStatus()) {
    return res.status(503).json({
      error: 'Database connection unavailable.',
      message: 'MongoDB connection unavailable. Configure MONGODB_URI in .env.'
    });
  }

  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, getJwtSecret(), { expiresIn: '7d' });
    setAuthCookie(res, token);

    return res.json({
      message: 'Login successful.',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ error: 'Login failed due to a server error.' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ message: 'Logged out successfully.' });
};

const me = async (req, res) => {
  if (!getDBStatus()) {
    return res.status(503).json({
      dbConnected: false,
      error: 'Database connection unavailable.',
      message: 'MongoDB connection unavailable. Configure MONGODB_URI in .env.'
    });
  }

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      return res.json({ setupRequired: true, authenticated: false });
    }

    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json({ setupRequired: false, authenticated: false });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.json({ setupRequired: false, authenticated: false });
    }

    return res.json({
      setupRequired: false,
      authenticated: true,
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    return res.json({ setupRequired: false, authenticated: false });
  }
};

module.exports = { setup, login, logout, me };
