import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { X, Trash2, Music2, Play } from 'lucide-react';
import { formatTime } from '../../utils/formatTime';

export default function QueueDrawer({ isOpen, onClose }) {
  const { queue, queueIndex, currentTrack, playTrack, removeFromQueue, clearQueue } = useAudio();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121216] border-l border-zinc-800/80 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white font-outfit">Play Queue</h2>
            <span className="text-xs text-zinc-400 font-normal">({queue.length} songs)</span>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded hover:bg-rose-950/40 transition-colors"
              >
                Clear Queue
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Close queue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Queue Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {queue.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              Your queue is empty.
            </div>
          ) : (
            queue.map((track, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`group flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-purple-600/15 border-purple-500/30 text-white'
                      : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  <div
                    onClick={() => playTrack(track, queue, idx)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                      {track.artwork ? (
                        <img src={track.artwork} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Music2 className="w-4 h-4" />
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute inset-0 bg-purple-900/60 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-purple-300' : 'text-zinc-200'}`}>
                        {track.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-500">{formatTime(track.duration)}</span>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
