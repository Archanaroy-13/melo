import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ListMusic, Plus, Trash2, Music2, X, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Playlists() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverArtwork, setCoverArtwork] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchPlaylists = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/playlists');
      setPlaylists(res.data || []);
    } catch (err) {
      if (err.response && err.response.status === 503) {
        setError('Database connection unavailable. Configure MONGODB_URI in .env.');
      } else {
        setError('Failed to load playlists.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setCreating(true);
      const res = await axios.post('/api/playlists', {
        name: name.trim(),
        description: description.trim(),
        coverArtwork: coverArtwork.trim()
      });
      showToast(`Created playlist "${res.data.name}"`, 'success');
      setName('');
      setDescription('');
      setCoverArtwork('');
      setIsModalOpen(false);
      fetchPlaylists();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create playlist.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlaylist = async (e, id, pName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${pName}"?`)) return;

    try {
      await axios.delete(`/api/playlists/${id}`);
      showToast(`Deleted playlist "${pName}"`, 'info');
      setPlaylists(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      showToast('Failed to delete playlist.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121216] border border-zinc-800/80 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <ListMusic className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-outfit">Your Playlists</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              {playlists.length} custom collections
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Create Playlist
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Playlists Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#121216] border border-zinc-800/40 rounded-2xl p-4 animate-pulse">
              <div className="aspect-square rounded-xl bg-zinc-800 mb-3" />
              <div className="h-3.5 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-2.5 bg-zinc-800/70 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 bg-[#121216]/50 border border-zinc-800/60 rounded-2xl p-8">
          <ListMusic className="w-12 h-12 mx-auto mb-3 text-zinc-700 stroke-[1.5]" />
          <p className="text-sm font-semibold text-zinc-300">No playlists yet</p>
          <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto mb-4">
            Create custom collections to organize your favorite songs.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              onClick={() => navigate(`/playlists/${playlist._id}`)}
              className="group bg-[#121216] border border-zinc-800/60 hover:border-zinc-700/60 p-3.5 rounded-2xl transition-all cursor-pointer relative shadow-md"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3 relative">
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

                <button
                  onClick={(e) => handleDeletePlaylist(e, playlist._id, playlist.name)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                  title="Delete playlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs font-bold text-zinc-100 truncate">{playlist.name}</p>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                {playlist.tracks ? playlist.tracks.length : 0} tracks
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-outfit">Create New Playlist</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Chill Playlist"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Songs for late night study sessions"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Cover Artwork URL (Optional)</label>
                <input
                  type="url"
                  value={coverArtwork}
                  onChange={(e) => setCoverArtwork(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
