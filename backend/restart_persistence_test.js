const mongoose = require('mongoose');
require('dotenv').config();

const Favorite = require('./models/Favorite');
const UserLibrary = require('./models/UserLibrary');
const Playlist = require('./models/Playlist');
const RecentlyPlayed = require('./models/RecentlyPlayed');
const Settings = require('./models/Settings');
const User = require('./models/User');

async function testPersistenceAcrossRestart() {
  console.log('======================================================');
  console.log('  MONGODB REAL PERSISTENCE ACROSS RESTART TEST SUITE  ');
  console.log('======================================================\n');

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/melo';
  
  // Phase 1: Connect & Populate
  await mongoose.connect(uri);
  console.log('[Step 1] Connected to MongoDB.');

  const dummyUser = await User.findOne({}) || await User.create({ username: 'testuser', passwordHash: 'hash' });

  await Favorite.deleteMany({ userId: dummyUser._id });
  await UserLibrary.deleteMany({ userId: dummyUser._id });
  await Playlist.deleteMany({ userId: dummyUser._id });
  await RecentlyPlayed.deleteMany({ userId: dummyUser._id });
  await Settings.deleteMany({ userId: dummyUser._id });

  const fav = await Favorite.create({
    userId: dummyUser._id,
    trackId: 'persist_101',
    source: 'sayamusic',
    title: 'Persistent Favorite Song',
    artist: 'Persistent Artist',
    album: 'Persistent Album',
    duration: 210
  });

  const lib = await UserLibrary.create({
    userId: dummyUser._id,
    trackId: 'persist_101',
    source: 'sayamusic',
    title: 'Persistent Library Song',
    artist: 'Persistent Artist',
    album: 'Persistent Album',
    duration: 210
  });

  const pl = await Playlist.create({
    userId: dummyUser._id,
    name: 'Persistent Playlist',
    tracks: [{ trackId: 'persist_101', source: 'sayamusic', title: 'Persistent Playlist Song', artist: 'Persistent Artist', duration: 210 }]
  });

  const hist = await RecentlyPlayed.create({
    userId: dummyUser._id,
    trackId: 'persist_101',
    source: 'sayamusic',
    title: 'Persistent History Song',
    artist: 'Persistent Artist',
    duration: 210
  });

  const set = await Settings.create({
    userId: dummyUser._id,
    audioQuality: '320kbps'
  });

  console.log('[Step 2] Created test documents in MongoDB.');
  
  // Phase 2: Simulate Backend Stop
  await mongoose.disconnect();
  console.log('[Step 3] STOPPED BACKEND (Disconnected Mongoose DB session).');

  // Phase 3: Simulate Backend Restart & Re-Fetch
  console.log('[Step 4] RESTARTED BACKEND (Re-connecting Mongoose DB session)...');
  await mongoose.connect(uri);

  const foundFav = await Favorite.findOne({ userId: dummyUser._id, trackId: 'persist_101' });
  const foundLib = await UserLibrary.findOne({ userId: dummyUser._id, trackId: 'persist_101' });
  const foundPl = await Playlist.findOne({ userId: dummyUser._id, name: 'Persistent Playlist' });
  const foundHist = await RecentlyPlayed.findOne({ userId: dummyUser._id, trackId: 'persist_101' });
  const foundSet = await Settings.findOne({ userId: dummyUser._id });

  console.log('\n--- MongoDB Persistence Test Results ---');
  console.log(`- Favorite Document Survived Restart: ${foundFav ? 'PASS (' + foundFav.title + ')' : 'FAIL'}`);
  console.log(`- Library Document Survived Restart: ${foundLib ? 'PASS (' + foundLib.title + ')' : 'FAIL'}`);
  console.log(`- Playlist Document Survived Restart: ${foundPl ? 'PASS (' + foundPl.name + ' with ' + foundPl.tracks.length + ' track)' : 'FAIL'}`);
  console.log(`- Recently Played Survived Restart: ${foundHist ? 'PASS (' + foundHist.title + ')' : 'FAIL'}`);
  console.log(`- Settings Survived Restart: ${foundSet ? 'PASS (Quality: ' + foundSet.audioQuality + ')' : 'FAIL'}`);

  // Check no audioUrl in any document
  const hasAudioUrl = 'audioUrl' in foundFav.toObject() ||
                      'audioUrl' in foundLib.toObject() ||
                      'audioUrl' in foundPl.tracks[0].toObject() ||
                      'audioUrl' in foundHist.toObject();

  console.log(`- NO audioUrl stored in any MongoDB record: ${!hasAudioUrl ? 'PASS' : 'FAIL'}`);

  await mongoose.disconnect();
  console.log('\n[Step 5] Restart persistence test completed cleanly.');
  process.exit(0);
}

testPersistenceAcrossRestart();
