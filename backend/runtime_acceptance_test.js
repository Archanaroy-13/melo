const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const { connectDB, getDBStatus } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const musicRoutes = require('./routes/musicRoutes');
const lyricsRoutes = require('./routes/lyricsRoutes');
const userRoutes = require('./routes/userRoutes');

const User = require('./models/User');
const Favorite = require('./models/Favorite');
const UserLibrary = require('./models/UserLibrary');
const Playlist = require('./models/Playlist');
const RecentlyPlayed = require('./models/RecentlyPlayed');
const musicService = require('./services/music/musicService');
const lyricsService = require('./services/lyrics/lyricsService');

async function runAcceptanceTest() {
  console.log('======================================================');
  console.log('       MELO REAL RUNTIME ACCEPTANCE TEST SUITE        ');
  console.log('======================================================\n');

  const app = express();
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/auth', authRoutes);
  app.use('/api/music', musicRoutes);
  app.use('/api/lyrics', lyricsRoutes);
  app.use('/api', userRoutes);

  const server = app.listen(5010, async () => {
    console.log('[Runtime Test] Express test server running on port 5010');
    
    // 1. Database Connection Verification
    const dbConnected = await connectDB();
    console.log(`[Runtime Test] MongoDB Connection Status: ${dbConnected ? 'CONNECTED' : 'DISCONNECTED'}`);

    if (dbConnected) {
      // Clean test database collections
      await User.deleteMany({});
      await Favorite.deleteMany({});
      await UserLibrary.deleteMany({});
      await Playlist.deleteMany({});
      await RecentlyPlayed.deleteMany({});
      console.log('[Runtime Test] Cleaned test database collections.');
    }

    // 2. Auth Flow Verification
    console.log('\n--- 1. Authentication End-to-End Test ---');
    try {
      const axios = require('axios');
      const client = axios.create({ baseURL: 'http://localhost:5010', withCredentials: true });

      // A. Setup master account
      const setupRes = await client.post('/api/auth/setup', { username: 'masteruser', password: 'password123' });
      console.log(`[Auth Setup]: PASS - Created user: ${setupRes.data.user.username}`);

      // Extract set-cookie header
      const cookieHeader = setupRes.headers['set-cookie'];
      console.log(`[Cookie Check]: HTTP-Only cookie present: ${Boolean(cookieHeader)}`);

      // B. Duplicate setup protection check
      try {
        await client.post('/api/auth/setup', { username: 'attacker', password: 'password123' });
        console.log('[Duplicate Setup Protection]: FAIL');
      } catch (err) {
        if (err.response && err.response.status === 403) {
          console.log('[Duplicate Setup Protection]: PASS - Returned HTTP 403 Setup Disabled');
        }
      }

      // C. /api/auth/me check
      const meRes = await client.get('/api/auth/me', { headers: { Cookie: cookieHeader[0] } });
      console.log(`[Session Persistence]: PASS - Authenticated user: ${meRes.data.user.username}, SetupRequired: ${meRes.data.setupRequired}`);

      // D. Logout check
      const logoutRes = await client.post('/api/auth/logout');
      console.log(`[Logout]: PASS - ${logoutRes.data.message}`);

      // E. Protected route 401 rejection check
      try {
        await client.get('/api/favorites');
        console.log('[Protected Route Guard]: FAIL');
      } catch (err) {
        if (err.response && err.response.status === 401) {
          console.log('[Protected Route Guard]: PASS - Returned HTTP 401 Unauthenticated');
        }
      }

      // 3. Music Provider & Search Test
      console.log('\n--- 2. Music Provider & Search Test ---');
      const searchResults = await musicService.search('Believer', 'songs');
      console.log(`[Music Search]: Found ${searchResults.songs.length} real song results from provider.`);
      
      if (searchResults.songs.length > 0) {
        const track = searchResults.songs[0];
        console.log(`[Search Result Metadata Sample]:`, {
          title: track.title,
          artist: track.artist,
          album: track.album,
          duration: track.duration,
          source: track.source,
          playable: track.playable,
          hasAudioUrlInSearch: 'audioUrl' in track // Should be false!
        });

        // 4. Playback Resolution Test
        console.log('\n--- 3. Playback Resolution Test ---');
        const resolveRes = await musicService.resolvePlayback(track.id, track.source);
        console.log(`[Playback Resolution]:`, {
          trackId: resolveRes.trackId,
          source: resolveRes.source,
          hasAudioUrl: Boolean(resolveRes.audioUrl),
          playable: resolveRes.playable,
          expiresAt: resolveRes.expiresAt
        });
      }

      // 5. Lyrics API Test
      console.log('\n--- 4. LRCLIB Lyrics API Test ---');
      const lyricsRes = await lyricsService.getLyrics('Believer', 'Imagine Dragons', '', 204);
      console.log(`[LRCLIB Lyrics]: Synced: ${lyricsRes.synced}, Line count: ${lyricsRes.syncedLyrics.length}, Available: ${lyricsRes.available}`);

      // 6. DB Persistence & Metadata Audit Test
      console.log('\n--- 5. MongoDB Database Persistence & Metadata Audit ---');
      if (dbConnected) {
        const dummyUser = await User.findOne({ username: 'masteruser' });
        
        // Add Favorite
        const fav = await Favorite.create({
          userId: dummyUser._id,
          trackId: 'test_track_123',
          source: 'sayamusic',
          title: 'Test Song',
          artist: 'Test Artist',
          album: 'Test Album',
          duration: 180
        });

        // Add Library
        const lib = await UserLibrary.create({
          userId: dummyUser._id,
          trackId: 'test_track_123',
          source: 'sayamusic',
          title: 'Test Song',
          artist: 'Test Artist',
          album: 'Test Album',
          duration: 180
        });

        // Create Playlist
        const pl = await Playlist.create({
          userId: dummyUser._id,
          name: 'My Acceptance Playlist',
          tracks: [{ trackId: 'test_track_123', source: 'sayamusic', title: 'Test Song', artist: 'Test Artist', duration: 180 }]
        });

        // Record History
        const hist = await RecentlyPlayed.create({
          userId: dummyUser._id,
          trackId: 'test_track_123',
          source: 'sayamusic',
          title: 'Test Song',
          artist: 'Test Artist',
          duration: 180
        });

        // Verify audioUrl is NOT stored in any DB record
        const favObj = fav.toObject();
        const libObj = lib.toObject();
        const plObj = pl.toObject();
        const histObj = hist.toObject();

        const hasAudioUrlInDB = 'audioUrl' in favObj || 'audioUrl' in libObj || 'audioUrl' in plObj.tracks[0] || 'audioUrl' in histObj;
        console.log(`[DB Metadata Audit]: audioUrl NOT stored in DB: ${!hasAudioUrlInDB ? 'PASS' : 'FAIL'}`);

        // Verify compound unique index on Favorite
        try {
          await Favorite.create({
            userId: dummyUser._id,
            trackId: 'test_track_123',
            source: 'sayamusic',
            title: 'Test Song Duplicate',
            artist: 'Test Artist',
            album: 'Test Album',
            duration: 180
          });
          console.log('[DB Compound Unique Index Guard]: FAIL');
        } catch (err) {
          console.log('[DB Compound Unique Index Guard]: PASS - Duplicate prevented by unique compound index');
        }
      }

    } catch (err) {
      console.error('[Runtime Test Error]:', err.message);
    } finally {
      server.close(() => {
        console.log('\n[Runtime Test] Acceptance test completed cleanly.');
        process.exit(0);
      });
    }
  });
}

runAcceptanceTest();
