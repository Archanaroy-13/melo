import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDebounce } from '../hooks/useDebounce';
import TrackCard from '../components/music/TrackCard';
import { TrackSkeletonRow, TrackSkeletonGrid } from '../components/music/SkeletonLoader';
import { Search as SearchIcon, X, Music2, User, Disc, AlertTriangle } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function Search() {
  const { playTrack } = useAudio();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'songs' | 'artists' | 'albums'
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('melo_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const saveRecentSearch = (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('melo_recent_searches', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('melo_recent_searches');
    } catch (e) {}
  };

  // Perform search query
  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setResults({ songs: [], artists: [], albums: [] });
      setLoading(false);
      setError('');
      return;
    }

    let isMounted = true;

    const performSearch = async () => {
      setLoading(true);
      setError('');
      try {
        const typeParam = activeTab === 'all' ? 'songs' : activeTab;
        const res = await axios.get(`/api/music/search?q=${encodeURIComponent(debouncedSearchTerm.trim())}&type=${typeParam}`);
        
        if (isMounted) {
          setResults({
            songs: res.data.songs || [],
            artists: res.data.artists || [],
            albums: res.data.albums || []
          });
          saveRecentSearch(debouncedSearchTerm.trim());
        }
      } catch (err) {
        if (isMounted) {
          setError('Music service temporarily unavailable. Please try again.');
          setResults({ songs: [], artists: [], albums: [] });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearchTerm, activeTab]);

  const handlePlayAllSongs = () => {
    if (results.songs.length > 0) {
      playTrack(results.songs[0], results.songs, 0);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Search Bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-outfit mb-4">Search</h1>

        <div className="relative max-w-2xl">
          <SearchIcon className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for songs, artists, or albums..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#121216] border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-zinc-500 hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recent Searches Pills if no query entered */}
      {!searchTerm && recentSearches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Recent Searches</span>
            <button onClick={clearRecentSearches} className="hover:text-rose-400 font-medium">Clear All</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => setSearchTerm(term)}
                className="px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs hover:border-purple-500/50 hover:text-purple-300 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Filter */}
      {searchTerm && (
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
          {['all', 'songs', 'artists', 'albums'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrackSkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Search Results Display */}
      {!loading && !error && searchTerm && (
        <div className="space-y-8">
          {/* Songs Section */}
          {(activeTab === 'all' || activeTab === 'songs') && results.songs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-purple-400" /> Songs
                </h2>
                <button
                  onClick={handlePlayAllSongs}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Play All ({results.songs.length})
                </button>
              </div>

              <div className="space-y-2">
                {results.songs.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            </div>
          )}

          {/* Artists Section */}
          {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" /> Artists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="group bg-[#121216] border border-zinc-800/60 hover:border-zinc-700/60 p-4 rounded-2xl flex flex-col items-center text-center transition-all"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-800 mb-3 border-2 border-zinc-800 group-hover:border-purple-500/50 transition-colors">
                      {artist.image ? (
                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-zinc-100 truncate w-full">{artist.name}</p>
                    <p className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">{artist.role || 'Artist'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white font-outfit flex items-center gap-2">
                <Disc className="w-4 h-4 text-purple-400" /> Albums
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.albums.map((album) => (
                  <div
                    key={album.id}
                    className="group bg-[#121216] border border-zinc-800/60 hover:border-zinc-700/60 p-3.5 rounded-2xl transition-all"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3">
                      {album.artwork ? (
                        <img src={album.artwork} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Disc className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-zinc-100 truncate">{album.title}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{album.artist}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty Search Results */}
          {results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
            <div className="text-center py-16 text-zinc-500">
              <Music2 className="w-12 h-12 mx-auto mb-3 text-zinc-700 stroke-[1.5]" />
              <p className="text-sm font-medium">No results found for "{debouncedSearchTerm}"</p>
              <p className="text-xs text-zinc-600 mt-1">Check spelling or search for another song or artist.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
