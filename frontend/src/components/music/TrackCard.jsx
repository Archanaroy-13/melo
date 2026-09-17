import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { formatTime } from '../../utils/formatTime';
import { Play, Pause, Plus, Heart, Library, Music2, MoreVertical, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

export default function TrackCard({ track, onPlay, layout = 'row' }) {
  const { currentTrack, isPlaying, togglePlay, playTrack, addToQueue, playNextInQueue } = useAudio();
  const { showToast } = useToast();

  const [isFavorite, setIsFavorite] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isUnplayable = track.playable === false;

  const handlePlayClick = () => {
    if (isUnplayable) {
      showToast(`Audio unavailable for "${track.title}"`, 'error');
      return;
    }
    if (isCurrent) {
      togglePlay();
    } else if (onPlay) {
      onPlay(track);
    } else {
      playTrack(track);
    }
  };

  const toggleFav = async (e) => {
    e.stopPropagation();
    try {
      if (isFavorite) {
        await axios.delete(`/api/favorites/${track.id}?source=${track.source}`);
        setIsFavorite(false);
        showToast(`Removed "${track.title}" from Favorites`, 'info');
      } else {
        await axios.post('/api/favorites', track);
        setIsFavorite(true);
        showToast(`Added "${track.title}" to Favorites`, 'success');
      }
    } catch (err) {
      showToast('Database operation failed.', 'error');
    }
  };

  const toggleLib = async (e) => {
    e.stopPropagation();
    try {
      if (inLibrary) {
        await axios.delete(`/api/library/${track.id}?source=${track.source}`);
        setInLibrary(false);
        showToast(`Removed "${track.title}" from Library`, 'info');
      } else {
        await axios.post('/api/library', track);
        setInLibrary(true);
        showToast(`Saved "${track.title}" to Library`, 'success');
      }
    } catch (err) {
      showToast('Database operation failed.', 'error');
    }
  };

  if (layout === 'card') {
    return (
      <div className="group relative bg-[#121216] hover:bg-[#18181b] border border-zinc-800/60 hover:border-zinc-700/60 rounded-2xl p-3.5 transition-all duration-200 shadow-md">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-800 mb-3">
          {track.artwork ? (
            <img src={track.artwork} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <Music2 className="w-8 h-8" />
            </div>
          )}

          <button
            onClick={handlePlayClick}
            disabled={isUnplayable}
            className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
              isUnplayable
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white scale-90 group-hover:scale-100'
            }`}
          >
            {isCurrent && isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
        </div>

        <p className="text-xs font-bold text-zinc-100 truncate mb-0.5">{track.title}</p>
        <p className="text-[11px] text-zinc-400 truncate mb-2">{track.artist}</p>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-500">
          <span>{formatTime(track.duration)}</span>
          <div className="flex items-center gap-1">
            <button onClick={toggleFav} className={`p-1 rounded hover:bg-zinc-800 ${isFavorite ? 'text-purple-400' : 'text-zinc-400'}`}>
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-purple-400' : ''}`} />
            </button>
            <button onClick={toggleLib} className={`p-1 rounded hover:bg-zinc-800 ${inLibrary ? 'text-purple-400' : 'text-zinc-400'}`}>
              <Library className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
        isCurrent
          ? 'bg-purple-600/15 border-purple-500/30'
          : 'bg-[#121216]/80 hover:bg-[#18181b] border-zinc-800/60 hover:border-zinc-700/60'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
          {track.artwork ? (
            <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <Music2 className="w-4 h-4" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            {isCurrent && isPlaying ? <Pause className="w-4 h-4 text-white fill-white" /> : <Play className="w-4 h-4 text-white fill-white ml-0.5" />}
          </div>
        </div>

        <div className="min-w-0">
          <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-purple-300 font-bold' : 'text-zinc-100'}`}>
            {track.title}
          </p>
          <p className="text-[11px] text-zinc-400 truncate">{track.artist} {track.album ? `• ${track.album}` : ''}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0">
        {isUnplayable ? (
          <span className="text-[10px] text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-950/40 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Audio unavailable
          </span>
        ) : (
          <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline">{formatTime(track.duration)}</span>
        )}

        <button
          onClick={toggleFav}
          className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ${isFavorite ? 'text-purple-400' : 'text-zinc-400 hover:text-white'}`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-purple-400' : ''}`} />
        </button>

        <button
          onClick={toggleLib}
          className={`p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ${inLibrary ? 'text-purple-400' : 'text-zinc-400 hover:text-white'}`}
          title={inLibrary ? 'Remove from library' : 'Save to library'}
        >
          <Library className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(track);
          }}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors hidden sm:inline-block"
          title="Add to queue"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
