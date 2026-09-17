const musicService = require('./services/music/musicService');

async function testPhase3() {
  console.log('--- Testing Phase 3 Music Service & Provider Adapter ---');
  try {
    const searchRes = await musicService.search('Midnight', 'songs');
    console.log(`[Search Results] Found ${searchRes.songs.length} tracks.`);
    
    if (searchRes.songs.length > 0) {
      const firstTrack = searchRes.songs[0];
      console.log(`[Track Metadata Sample]:`, {
        id: firstTrack.id,
        title: firstTrack.title,
        artist: firstTrack.artist,
        album: firstTrack.album,
        source: firstTrack.source,
        playable: firstTrack.playable
      });

      console.log('\n--- Testing Dynamic Playback Resolution (POST /api/music/resolve) ---');
      const resolveRes = await musicService.resolvePlayback(firstTrack.id, firstTrack.source);
      console.log(`[Playback Resolution Result]:`, {
        trackId: resolveRes.trackId,
        source: resolveRes.source,
        hasAudioUrl: Boolean(resolveRes.audioUrl),
        playable: resolveRes.playable,
        expiresAt: resolveRes.expiresAt
      });
    } else {
      console.log('[Info] Search returned 0 results from remote endpoint.');
    }
    console.log('--- Phase 3 Provider Adapter Test Completed ---');
    process.exit(0);
  } catch (err) {
    console.error('[Phase 3 Test Error]:', err.message);
    process.exit(1);
  }
}

testPhase3();
