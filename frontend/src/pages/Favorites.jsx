import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackCard from '../components/music/TrackCard';
import { TrackSkeletonRow } from '../components/music/SkeletonLoader';
import { useAudio } from '../context/AudioContext';
import { Heart, Play, Shuffle, Search, AlertCircle } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export default function Favorites() {
  const { playTrack, toggleShuffle } = useAudio();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  const fetchFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/favorites');
      setTracks(res.data || []);
    } catch (err) {
      if (err.response && err.response.status === 503) {
        setError('Database connection unavailable. Configure MONGODB_URI in .env.');
      } else {
        setError('Failed to load favorites.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const filteredTracks = tracks.filter(
    t =>
      t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[0], filteredTracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (filteredTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredTracks.length);
      toggleShuffle();
      playTrack(filteredTracks[randomIndex], filteredTracks, randomIndex);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121216] border border-zinc-800/80 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Heart className="w-8 h-8 fill-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-outfit">Favorite Songs</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              {tracks.length} favorite tracks • {formatTime(totalDuration)} total duration
            </p>
          </div>
        </div>

        {tracks.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePlayAll}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition-all"
            >
              <Play className="w-4 h-4 fill-current" /> Play All
            </button>
            <button
              onClick={handleShuffleAll}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-all"
            >
              <Shuffle className="w-4 h-4 text-rose-400" /> Shuffle
            </button>
          </div>
        )}
      </div>

      {/* Filter Input */}
      {tracks.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter favorite tracks..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-rose-500"
          />
        </div>
      )}

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

      {/* Favorites List */}
      {!loading && !error && (
        filteredTracks.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 bg-[#121216]/50 border border-zinc-800/60 rounded-2xl p-8">
            <Heart className="w-12 h-12 mx-auto mb-3 text-zinc-700 stroke-[1.5]" />
            <p className="text-sm font-semibold text-zinc-300">
              {filterQuery ? `No favorites match "${filterQuery}"` : 'No favorite songs yet'}
            </p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
              Heart songs while listening to add them to your personal favorites collection.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
