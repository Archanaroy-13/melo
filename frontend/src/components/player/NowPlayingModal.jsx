import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { formatTime } from '../../utils/formatTime';
import LyricsView from './LyricsView';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Music2,
  Mic2,
  ListMusic
} from 'lucide-react';
import QueueDrawer from './QueueDrawer';

export default function NowPlayingModal() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    nextTrack,
    prevTrack
  } = useAudio();

  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'lyrics'
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  if (!isNowPlayingOpen || !currentTrack) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-300 overflow-hidden select-none">
      {/* Background ambient artwork glow */}
      {currentTrack.artwork && (
        <div
          className="absolute inset-0 opacity-15 blur-3xl pointer-events-none scale-125 bg-center bg-cover transition-all duration-700"
          style={{ backgroundImage: `url(${currentTrack.artwork})` }}
        />
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/60">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'player' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Player
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'lyrics' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" /> Lyrics
          </button>
        </div>

        <button
          onClick={() => setIsNowPlayingOpen(false)}
          className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 border border-zinc-800/60 hover:bg-zinc-800 transition-colors"
          aria-label="Close Now Playing"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main View Area */}
      <div className="relative z-10 flex-1 my-auto max-w-4xl w-full mx-auto flex flex-col justify-center items-center py-6 overflow-hidden">
        {activeTab === 'player' ? (
          /* Large Artwork Player View */
          <div className="flex flex-col items-center text-center space-y-6 max-w-sm w-full">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl border border-zinc-800/80 group">
              {currentTrack.artwork ? (
                <img
                  src={currentTrack.artwork}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-gradient-to-tr from-zinc-900 to-zinc-800">
                  <Music2 className="w-16 h-16" />
                </div>
              )}
            </div>

            <div className="w-full">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-outfit truncate">{currentTrack.title}</h2>
              <p className="text-sm text-purple-400 font-medium truncate mt-1">{currentTrack.artist}</p>
              {currentTrack.album && (
                <p className="text-xs text-zinc-500 truncate mt-0.5">{currentTrack.album}</p>
              )}
            </div>
          </div>
        ) : (
          /* Lyrics View */
          <div className="w-full h-full max-h-[60vh]">
            <LyricsView />
          </div>
        )}
      </div>

      {/* Control Deck */}
      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-4 pt-2">
        {/* Seek Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
          />
          <div className="flex justify-between text-xs text-zinc-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Buttons Deck */}
        <div className="flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-xl transition-colors ${
              isShuffle ? 'text-purple-400 bg-purple-600/20 border border-purple-500/30' : 'text-zinc-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={prevTrack} className="p-2 text-zinc-300 hover:text-white transition-colors" title="Previous">
              <SkipBack className="w-7 h-7" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center shadow-xl transition-transform active:scale-95"
              title="Play/Pause"
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>

            <button onClick={nextTrack} className="p-2 text-zinc-300 hover:text-white transition-colors" title="Next">
              <SkipForward className="w-7 h-7" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleRepeat}
              className={`p-2.5 rounded-xl transition-colors ${
                repeatMode !== 'off' ? 'text-purple-400 bg-purple-600/20 border border-purple-500/30' : 'text-zinc-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsQueueOpen(true)}
              className="p-2.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors"
              title="Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Queue Drawer */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </div>
  );
}
