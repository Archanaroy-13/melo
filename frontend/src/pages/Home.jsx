import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TrackCard from '../components/music/TrackCard';
import { TrackSkeletonRow, TrackSkeletonGrid } from '../components/music/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { Play, Search, Heart, Library, ListMusic, History, Sparkles, Music2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack } = useAudio();

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Compute greeting based on local time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [recentRes, favRes, playlistsRes] = await Promise.allSettled([
          axios.get('/api/history'),
          axios.get('/api/favorites'),
          axios.get('/api/playlists')
        ]);

        if (isMounted) {
          setRecentlyPlayed(recentRes.status === 'fulfilled' ? recentRes.value.data || [] : []);
          setFavorites(favRes.status === 'fulfilled' ? favRes.value.data || [] : []);
          setPlaylists(playlistsRes.status === 'fulfilled' ? playlistsRes.value.data || [] : []);
        }
      } catch (err) {
        // Handle gracefully
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#121216] to-[#121216] border border-purple-900/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Ad-Free Private Stream
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-outfit">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">{user?.username || 'Private Master'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Welcome to Melo — your sleek, personalized music sanctuary. Search songs, curate your library, or jump straight back into your history.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-all"
            >
              <Search className="w-4 h-4" /> Explore Music
            </button>
            <button
              onClick={() => navigate('/library')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-all"
            >
              <Library className="w-4 h-4 text-purple-400" /> Go to Library
            </button>
          </div>
        </div>
      </div>

      {/* Quick Play Grid (Recently Played or Favorites) */}
      {recentlyPlayed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" /> Jump Back In
            </h2>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              See All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyPlayed.slice(0, 6).map((track, i) => (
              <div
                key={`${track.id}-${i}`}
                onClick={() => playTrack(track, recentlyPlayed, i)}
                className="group flex items-center gap-3 p-2.5 rounded-2xl bg-[#121216] border border-zinc-800/60 hover:border-zinc-700/60 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                  {track.artwork ? (
                    <img src={track.artwork} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Music2 className="w-5 h-5" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-purple-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-100 truncate group-hover:text-purple-300 transition-colors">
                    {track.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Playlists Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-indigo-400" /> Your Playlists
          </h2>
          <button
            onClick={() => navigate('/playlists')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            View All ({playlists.length})
          </button>
        </div>

        {loading ? (
          <TrackSkeletonGrid count={4} />
        ) : playlists.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#121216]/60 border border-zinc-800/60 text-center text-zinc-500 text-xs">
            No custom playlists created yet. Head over to <button onClick={() => navigate('/playlists')} className="text-purple-400 font-semibold hover:underline">Playlists</button> to build your first collection.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.slice(0, 5).map((playlist) => (
              <div
                key={playlist._id}
                onClick={() => navigate(`/playlists/${playlist._id}`)}
                className="group bg-[#121216] border border-zinc-800/60 hover:border-zinc-700/60 p-3.5 rounded-2xl transition-all cursor-pointer shadow-md"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3">
                  {playlist.coverArtwork || (playlist.tracks && playlist.tracks[0]?.artwork) ? (
                    <img
                      src={playlist.coverArtwork || playlist.tracks[0]?.artwork}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-gradient-to-tr from-zinc-900 to-zinc-800">
                      <Music2 className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-zinc-100 truncate">{playlist.name}</p>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {playlist.tracks ? playlist.tracks.length : 0} tracks
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favorites Preview */}
      {favorites.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" /> Favorite Tracks
            </h2>
            <button
              onClick={() => navigate('/favorites')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              View All ({favorites.length})
            </button>
          </div>

          <div className="space-y-2">
            {favorites.slice(0, 5).map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
