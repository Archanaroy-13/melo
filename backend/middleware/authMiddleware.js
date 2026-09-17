const jwt = require('jsonwebtoken');
const { getDBStatus } = require('../config/db');

const authMiddleware = (req, res, next) => {
  if (!getDBStatus()) {
    return res.status(503).json({
      error: 'Database connection unavailable.',
      message: 'MongoDB connection unavailable. Configure MONGODB_URI in .env.'
    });
  }

  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const secret = process.env.SESSION_SECRET || 'melo_private_secret_key_change_in_production_2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
};

module.exports = authMiddleware;
