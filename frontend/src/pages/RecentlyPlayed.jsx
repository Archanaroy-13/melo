import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackCard from '../components/music/TrackCard';
import { TrackSkeletonRow } from '../components/music/SkeletonLoader';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../context/ToastContext';
import { History, Play, Shuffle, Trash2, AlertCircle } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export default function RecentlyPlayed() {
  const { playTrack, toggleShuffle } = useAudio();
  const { showToast } = useToast();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/history');
      setTracks(res.data || []);
    } catch (err) {
      if (err.response && err.response.status === 503) {
        setError('Database connection unavailable. Configure MONGODB_URI in .env.');
      } else {
        setError('Failed to load listening history.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your listening history?')) return;
    try {
      await axios.delete('/api/history');
      setTracks([]);
      showToast('Listening history cleared.', 'info');
    } catch (err) {
      showToast('Failed to clear history.', 'error');
    }
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      toggleShuffle();
      playTrack(tracks[randomIndex], tracks, randomIndex);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121216] border border-zinc-800/80 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-outfit">Recently Played</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              {tracks.length} recently listened songs
            </p>
          </div>
        </div>

        {tracks.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePlayAll}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all"
            >
              <Play className="w-4 h-4 fill-current" /> Play History
            </button>
            <button
              onClick={handleClearHistory}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" /> Clear History
            </button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <TrackSkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* History Tracks List */}
      {!loading && !error && (
        tracks.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 bg-[#121216]/50 border border-zinc-800/60 rounded-2xl p-8">
            <History className="w-12 h-12 mx-auto mb-3 text-zinc-700 stroke-[1.5]" />
            <p className="text-sm font-semibold text-zinc-300">No listening history yet</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
              Songs you listen to for more than 30 seconds will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tracks.map((track, i) => (
              <TrackCard key={`${track.id}-${i}`} track={track} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
