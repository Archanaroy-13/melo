import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAudio } from '../../context/AudioContext';
import { AlignLeft, Mic2, AlertCircle } from 'lucide-react';

const lyricsCache = new Map();

export default function LyricsView() {
  const { currentTrack, currentTime, seek } = useAudio();

  const [lyricsData, setLyricsData] = useState({ synced: false, syncedLyrics: [], plainLyrics: null, available: false });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const activeLineRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch lyrics when currentTrack changes
  useEffect(() => {
    if (!currentTrack) {
      setLyricsData({ synced: false, syncedLyrics: [], plainLyrics: null, available: false });
      return;
    }

    const cacheKey = `${currentTrack.id}-${currentTrack.title}-${currentTrack.artist}`;

    if (lyricsCache.has(cacheKey)) {
      setLyricsData(lyricsCache.get(cacheKey));
      return;
    }

    let isMounted = true;

    const fetchLyrics = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/lyrics', {
          params: {
            track: currentTrack.title,
            artist: currentTrack.artist,
            album: currentTrack.album,
            duration: currentTrack.duration
          }
        });

        if (isMounted) {
          const data = res.data || { synced: false, syncedLyrics: [], plainLyrics: null, available: false };
          lyricsCache.set(cacheKey, data);
          setLyricsData(data);
        }
      } catch (err) {
        if (isMounted) {
          setLyricsData({ synced: false, syncedLyrics: [], plainLyrics: null, available: false });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLyrics();

    return () => {
      isMounted = false;
    };
  }, [currentTrack]);

  // Determine active lyric index based on audio currentTime
  useEffect(() => {
    if (!lyricsData.synced || lyricsData.syncedLyrics.length === 0) {
      setActiveIndex(-1);
      return;
    }

    const lines = lyricsData.syncedLyrics;
    let index = -1;

    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        index = i;
      } else {
        break;
      }
    }

    setActiveIndex(index);
  }, [currentTime, lyricsData]);

  // Auto-scroll to center active line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!currentTrack) return null;

  return (
    <div className="h-full flex flex-col justify-center items-center select-none">
      {loading ? (
        <div className="flex flex-col items-center gap-3 text-zinc-500 py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Loading lyrics...</p>
        </div>
      ) : !lyricsData.available ? (
        <div className="flex flex-col items-center justify-center text-center p-8 text-zinc-500 my-auto">
          <AlertCircle className="w-10 h-10 mb-3 text-zinc-700 stroke-[1.5]" />
          <p className="text-sm font-semibold text-zinc-400">Lyrics unavailable</p>
          <p className="text-xs text-zinc-600 mt-1 max-w-xs">No synced or plain lyrics found for this track.</p>
        </div>
      ) : lyricsData.synced ? (
        /* Synchronized Lyrics View */
        <div
          ref={containerRef}
          className="w-full h-full overflow-y-auto pr-2 space-y-4 py-8 text-center scroll-smooth"
        >
          {lyricsData.syncedLyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`text-sm sm:text-base md:text-lg font-semibold transition-all duration-300 cursor-pointer px-4 py-1.5 rounded-xl ${
                  isActive
                    ? 'text-purple-400 font-extrabold scale-105 bg-purple-950/30 shadow-lg shadow-purple-950/40 opacity-100'
                    : 'text-zinc-500 hover:text-zinc-300 opacity-60 hover:opacity-90'
                }`}
              >
                {line.text}
              </p>
            );
          })}
        </div>
      ) : (
        /* Plain Unsynced Lyrics View */
        <div className="w-full h-full overflow-y-auto p-6 text-center text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {lyricsData.plainLyrics}
        </div>
      )}
    </div>
  );
}
