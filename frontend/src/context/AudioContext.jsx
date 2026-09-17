import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const { showToast } = useToast();

  // Persistent HTML5 Audio instance
  const audioRef = useRef(new Audio());

  // Player State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);

  // Track session unplayable state (temporary runtime set)
  const unplayableTracksRef = useRef(new Set());
  // Prevent infinite retry loops on stream error
  const isRetryingRef = useRef(false);
  // Active play promise ref to prevent race conditions on rapid track switches
  const playPromiseRef = useRef(null);
  // Client-side history recording ref to prevent duplicate history POST requests
  const hasRecordedHistoryRef = useRef(false);

  // Reset history tracking state whenever a new track is loaded
  useEffect(() => {
    hasRecordedHistoryRef.current = false;
  }, [currentTrack?.id]);

  // Synchronize audio element volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Media Session API setup
  const updateMediaSession = useCallback((track) => {
    if ('mediaSession' in navigator && track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        album: track.album || 'Unknown Album',
        artwork: track.artwork
          ? [
              { src: track.artwork, sizes: '96x96', type: 'image/png' },
              { src: track.artwork, sizes: '512x512', type: 'image/png' }
            ]
          : []
      });
    }
  }, []);

  // Dynamic Audio Stream Resolution (POST /api/music/resolve)
  const resolveAndPlay = useCallback(async (track, isRetry = false) => {
    if (!track) return;

    if (unplayableTracksRef.current.has(track.id)) {
      showToast(`Audio unavailable for "${track.title}"`, 'error');
      return;
    }

    try {
      const res = await axios.post('/api/music/resolve', {
        trackId: track.id,
        source: track.source || 'sayamusic'
      });

      const { audioUrl, playable } = res.data;

      if (!playable || !audioUrl) {
        unplayableTracksRef.current.add(track.id);
        showToast(`Audio unavailable for "${track.title}"`, 'error');
        setCurrentTrack(prev => (prev?.id === track.id ? { ...prev, playable: false } : prev));
        return false;
      }

      // Load audio stream
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (playPromiseRef.current === playPromise) {
              setIsPlaying(true);
              isRetryingRef.current = false;
              updateMediaSession(track);
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
              }
            }
          })
          .catch((err) => {
            // Ignore AbortError caused by rapid track changes or new load requests
            if (err.name === 'AbortError') {
              return;
            }
            console.error('[Audio Playback Error]:', err);
            if (!isRetry) {
              // Attempt single-refresh URL retry
              isRetryingRef.current = true;
              resolveAndPlay(track, true);
            } else {
              unplayableTracksRef.current.add(track.id);
              setIsPlaying(false);
              showToast(`Audio unavailable for "${track.title}"`, 'error');
            }
          });
      }
      return true;
    } catch (err) {
      console.error('[Resolve Playback Error]:', err);
      showToast(`Audio unavailable for "${track.title}"`, 'error');
      return false;
    }
  }, [showToast, updateMediaSession]);

  // Audio Event Listeners setup (timeupdate, ended, error)
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      const time = audio.currentTime || 0;
      const dur = audio.duration || 0;
      setCurrentTime(time);
      setDuration(dur);

      // Record listening history once when threshold is reached (30s OR 25% duration)
      if (currentTrack && !hasRecordedHistoryRef.current && dur > 0) {
        const threshold = Math.min(30, dur * 0.25);
        if (time >= threshold && time > 0) {
          hasRecordedHistoryRef.current = true;
          axios.post('/api/history', {
            id: currentTrack.id,
            trackId: currentTrack.id,
            source: currentTrack.source || 'sayamusic',
            title: currentTrack.title,
            artist: currentTrack.artist,
            album: currentTrack.album,
            artwork: currentTrack.artwork,
            duration: currentTrack.duration
          }).catch(() => {});
        }
      }
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        // Play next track in queue
        handleNextTrack();
      }
    };

    const handleError = () => {
      console.warn('[HTML5 Audio Error Handler Triggered]');
      if (currentTrack && !isRetryingRef.current) {
        isRetryingRef.current = true;
        // Attempt single-refresh re-resolution
        resolveAndPlay(currentTrack, true);
      } else if (currentTrack) {
        unplayableTracksRef.current.add(currentTrack.id);
        showToast(`Audio unavailable for "${currentTrack.title}"`, 'error');
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, repeatMode, resolveAndPlay, showToast]);

  // Play a specific track (or queue list)
  const playTrack = useCallback((track, newQueueList = null, index = -1) => {
    if (!track) return;

    let targetQueue = newQueueList || queue;
    if (newQueueList) {
      setQueue(newQueueList);
      targetQueue = newQueueList;
    } else if (queue.length === 0) {
      setQueue([track]);
      targetQueue = [track];
    }

    const idx = index >= 0 ? index : targetQueue.findIndex(t => t.id === track.id);
    setQueueIndex(idx >= 0 ? idx : 0);
    setCurrentTrack(track);

    resolveAndPlay(track, false);
  }, [queue, resolveAndPlay]);

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (!currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    } else {
      if (audioRef.current.src) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
          })
          .catch(() => {
            resolveAndPlay(currentTrack, false);
          });
      } else {
        resolveAndPlay(currentTrack, false);
      }
    }
  }, [currentTrack, isPlaying, resolveAndPlay]);

  // Seek position
  const seek = useCallback((timeInSeconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeInSeconds;
      setCurrentTime(timeInSeconds);
    }
  }, []);

  // Volume slider
  const setVolume = useCallback((val) => {
    setVolumeState(val);
    if (val > 0 && isMuted) setIsMuted(false);
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Shuffle toggle
  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      const nextState = !prev;
      showToast(nextState ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
      return nextState;
    });
  }, [showToast]);

  // Repeat toggle ('off' -> 'all' -> 'one' -> 'off')
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') {
        showToast('Repeat all enabled', 'info');
        return 'all';
      }
      if (prev === 'all') {
        showToast('Repeat current track enabled', 'info');
        return 'one';
      }
      showToast('Repeat disabled', 'info');
      return 'off';
    });
  }, [showToast]);

  // Next Track logic
  const handleNextTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      const nextT = queue[randomIndex];
      setQueueIndex(randomIndex);
      setCurrentTrack(nextT);
      resolveAndPlay(nextT, false);
      return;
    }

    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextT = queue[nextIndex];
    setQueueIndex(nextIndex);
    setCurrentTrack(nextT);
    resolveAndPlay(nextT, false);
  }, [queue, queueIndex, isShuffle, repeatMode, resolveAndPlay]);

  // Previous Track logic
  const handlePrevTrack = useCallback(() => {
    if (queue.length === 0) return;

    // If played more than 3 seconds, restart current song
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevT = queue[prevIndex];
    setQueueIndex(prevIndex);
    setCurrentTrack(prevT);
    resolveAndPlay(prevT, false);
  }, [queue, queueIndex, resolveAndPlay]);

  // Queue manipulation functions
  const addToQueue = useCallback((track) => {
    setQueue(prev => [...prev, track]);
    showToast(`Added "${track.title}" to queue`, 'success');
  }, [showToast]);

  const playNextInQueue = useCallback((track) => {
    setQueue(prev => {
      const newQ = [...prev];
      newQ.splice(queueIndex + 1, 0, track);
      return newQ;
    });
    showToast(`Will play "${track.title}" next`, 'success');
  }, [queueIndex, showToast]);

  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index === queueIndex) {
      handleNextTrack();
    } else if (index < queueIndex) {
      setQueueIndex(prev => prev - 1);
    }
  }, [queueIndex, handleNextTrack]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
    setCurrentTrack(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    showToast('Queue cleared', 'info');
  }, [showToast]);

  const reorderQueue = useCallback((newQueueList) => {
    setQueue(newQueueList);
  }, []);

  // Register Media Session API Handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack());
      try {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) seek(details.seekTime);
        });
      } catch (e) {
        // Ignored if unsupported
      }
    }
  }, [togglePlay, handlePrevTrack, handleNextTrack, seek]);

  // Bind Global Keyboard Shortcuts
  useKeyboardShortcuts({
    togglePlay,
    seek,
    toggleMute,
    nextTrack: handleNextTrack,
    prevTrack: handlePrevTrack,
    currentTime,
    duration
  });

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        isNowPlayingOpen,
        setIsNowPlayingOpen,
        playTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        nextTrack: handleNextTrack,
        prevTrack: handlePrevTrack,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
