import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TrackCard from '../components/music/TrackCard';
import { TrackSkeletonRow } from '../components/music/SkeletonLoader';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../context/ToastContext';
import { ListMusic, Play, Shuffle, ArrowLeft, Trash2, ArrowUp, ArrowDown, Music2, AlertCircle } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, toggleShuffle } = useAudio();
  const { showToast } = useToast();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlaylist = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/playlists');
      const found = (res.data || []).find(p => p._id === id);
      if (found) {
        setPlaylist(found);
      } else {
        setError('Playlist not found.');
      }
    } catch (err) {
      setError('Failed to load playlist details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const handleRemoveTrack = async (trackId, source) => {
    try {
      const res = await axios.delete(`/api/playlists/${id}/tracks/${trackId}?source=${source}`);
      setPlaylist(res.data);
      showToast('Removed track from playlist.', 'info');
    } catch (err) {
      showToast('Failed to remove track.', 'error');
    }
  };

  const handleMoveTrack = async (index, direction) => {
    if (!playlist || !playlist.tracks) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= playlist.tracks.length) return;

    const newTracks = [...playlist.tracks];
    const [moved] = newTracks.splice(index, 1);
    newTracks.splice(targetIdx, 0, moved);

    // Optimistic UI update
    setPlaylist(prev => ({ ...prev, tracks: newTracks }));

    try {
      await axios.put(`/api/playlists/${id}/reorder`, { tracks: newTracks });
    } catch (err) {
      showToast('Failed to save track order.', 'error');
      fetchPlaylist();
    }
  };

  const normalizedTracks = playlist?.tracks ? playlist.tracks.map(t => ({
    id: t.trackId,
    trackId: t.trackId,
    source: t.source,
    title: t.title,
    artist: t.artist,
    album: t.album,
    artwork: t.artwork,
    duration: t.duration,
    playable: true
  })) : [];

  const totalDuration = normalizedTracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (normalizedTracks.length > 0) {
      playTrack(normalizedTracks[0], normalizedTracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (normalizedTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * normalizedTracks.length);
      toggleShuffle();
      playTrack(normalizedTracks[randomIndex], normalizedTracks, randomIndex);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/playlists')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Playlists
      </button>

      {/* Header Banner */}
      {loading ? (
        <div className="bg-[#121216] border border-zinc-800/80 p-6 rounded-2xl animate-pulse flex gap-6 items-center">
          <div className="w-24 h-24 rounded-xl bg-zinc-800 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-zinc-800 rounded w-1/3" />
            <div className="h-4 bg-zinc-800/60 rounded w-1/2" />
          </div>
        </div>
      ) : error || !playlist ? (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{error || 'Playlist not found.'}</span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#121216] border border-zinc-800/80 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 shadow-lg border border-zinc-800">
              {playlist.coverArtwork || (playlist.tracks && playlist.tracks[0]?.artwork) ? (
                <img
                  src={playlist.coverArtwork || playlist.tracks[0]?.artwork}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-gradient-to-tr from-zinc-900 to-zinc-800">
                  <Music2 className="w-10 h-10" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-outfit">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">{playlist.description}</p>
              )}
              <p className="text-xs text-zinc-500 mt-2">
                {normalizedTracks.length} tracks • {formatTime(totalDuration)} total duration
              </p>
            </div>
          </div>

          {normalizedTracks.length > 0 && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handlePlayAll}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> Play All
              </button>
              <button
                onClick={handleShuffleAll}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-all"
              >
                <Shuffle className="w-4 h-4 text-purple-400" /> Shuffle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Playlist Track List */}
      {!loading && playlist && (
        normalizedTracks.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 bg-[#121216]/50 border border-zinc-800/60 rounded-2xl p-8">
            <ListMusic className="w-12 h-12 mx-auto mb-3 text-zinc-700 stroke-[1.5]" />
            <p className="text-sm font-semibold text-zinc-300">This playlist is empty</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
              Add songs from search or search results to build this playlist.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {normalizedTracks.map((track, idx) => (
              <div key={`${track.id}-${idx}`} className="group flex items-center gap-2">
                {/* Up/Down Reorder Controls */}
                <div className="flex flex-col gap-0.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleMoveTrack(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:text-purple-400 disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveTrack(idx, 'down')}
                    disabled={idx === normalizedTracks.length - 1}
                    className="p-1 hover:text-purple-400 disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <TrackCard track={track} />
                </div>

                <button
                  onClick={() => handleRemoveTrack(track.id, track.source)}
                  className="p-2 text-zinc-500 hover:text-rose-400 rounded-xl hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove from playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
