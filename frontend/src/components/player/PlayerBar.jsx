import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { formatTime } from '../../utils/formatTime';
import QueueDrawer from './QueueDrawer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  Maximize2,
  Music2,
  AlertCircle
} from 'lucide-react';

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    nextTrack,
    prevTrack,
    setIsNowPlayingOpen
  } = useAudio();

  const [isQueueOpen, setIsQueueOpen] = useState(false);

  if (!currentTrack) return null;

  const isUnplayable = currentTrack.playable === false;

  return (
    <>
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-40 bg-[#121216]/95 backdrop-blur-xl border-t border-zinc-800/80 px-3 sm:px-6 py-2.5 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Left: Track Info */}
          <div className="flex items-center gap-3 min-w-0 w-1/4">
            <div
              onClick={() => setIsNowPlayingOpen(true)}
              className="relative w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 cursor-pointer group shadow-md"
            >
              {currentTrack.artwork ? (
                <img
                  src={currentTrack.artwork}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <Music2 className="w-5 h-5" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <p
                onClick={() => setIsNowPlayingOpen(true)}
                className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:underline"
              >
                {currentTrack.title}
              </p>
              <p className="text-[11px] text-zinc-400 truncate">{currentTrack.artist}</p>
              {isUnplayable && (
                <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold mt-0.5">
                  <AlertCircle className="w-3 h-3" /> Audio unavailable
                </span>
              )}
            </div>
          </div>

          {/* Center: Controls & Progress Bar */}
          <div className="flex flex-col items-center flex-1 max-w-xl">
            {/* Control Buttons */}
            <div className="flex items-center gap-3 sm:gap-5 mb-1">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-lg transition-colors ${
                  isShuffle ? 'text-purple-400 bg-purple-600/15' : 'text-zinc-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevTrack}
                className="p-1.5 text-zinc-300 hover:text-white transition-colors"
                title="Previous (P)"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={isUnplayable}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isUnplayable
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    : 'bg-white hover:bg-zinc-200 text-black scale-100 hover:scale-105'
                }`}
                title="Play/Pause (Space)"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={nextTrack}
                className="p-1.5 text-zinc-300 hover:text-white transition-colors"
                title="Next (N)"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-lg transition-colors ${
                  repeatMode !== 'off' ? 'text-purple-400 bg-purple-600/15' : 'text-zinc-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Seek Progress Bar */}
            <div className="w-full flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="w-8 text-right font-mono">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
              />
              <span className="w-8 font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Volume & Extra Controls */}
          <div className="hidden sm:flex items-center justify-end gap-3 w-1/4">
            <button
              onClick={() => setIsQueueOpen(true)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsNowPlayingOpen(true)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Full Screen Player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Mute (M)"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-16 sm:w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Queue Drawer */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
}
