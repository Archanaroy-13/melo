import { useEffect } from 'react';

export function useKeyboardShortcuts({
  togglePlay,
  seek,
  toggleMute,
  nextTrack,
  prevTrack,
  currentTime,
  duration
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bypass keyboard shortcuts when user is typing in editable input elements
      const target = e.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInput) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;

        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(duration || 0, currentTime + 5));
          break;

        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;

        case 'KeyN':
          e.preventDefault();
          nextTrack();
          break;

        case 'KeyP':
          e.preventDefault();
          prevTrack();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, toggleMute, nextTrack, prevTrack, currentTime, duration]);
}
