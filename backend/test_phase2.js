const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const { getDBStatus } = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Melo Backend',
    dbStatus: getDBStatus() ? 'connected' : 'disconnected'
  });
});

const server = app.listen(5005, () => {
  console.log('[Phase 2 Test] Server listening on port 5005');
  setTimeout(() => {
    server.close(() => {
      console.log('[Phase 2 Test] Server closed cleanly.');
      process.exit(0);
    });
  }, 1500);
});
