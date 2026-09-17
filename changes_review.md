# Melo — Changes & Code Review Log

This document records all code, configuration, and architectural modifications made in the Melo workspace. It outlines what was changed, the exact line/file modifications, and the resulting behavior.

---

## 📅 Log Entry: Phase 1 — Project Initialization & Structure
- **Files Created**: [`package.json`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/package.json), [`.env.example`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/.env.example), [`.env`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/.env), [`backend/package.json`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/package.json), [`frontend/package.json`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/package.json), [`frontend/vite.config.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/vite.config.js), [`frontend/index.html`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/index.html), [`manifest.json`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/public/manifest.json).

---

## 📅 Log Entry: Phase 2 — Database Schema & Authentication
- **Files Created**: [`backend/config/db.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/config/db.js), Mongoose models ([`User.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/User.js), [`Favorite.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/Favorite.js), [`UserLibrary.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/UserLibrary.js), [`Playlist.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/Playlist.js), [`RecentlyPlayed.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/RecentlyPlayed.js), [`Settings.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/Settings.js)), auth middleware, rate limiter, and auth routes.

---

## 📅 Log Entry: Phase 3 — Music Provider Abstraction & SayaMusicAPI
- **Files Created**: [`sayaMusicProvider.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/services/music/providers/sayaMusicProvider.js), [`musicService.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/services/music/musicService.js), [`musicController.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/controllers/musicController.js), [`musicRoutes.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/routes/musicRoutes.js).

---

## 📅 Log Entry: Phase 4 — Frontend Core, Contexts & Layouts
- **Files Created**: [`ToastContext.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/context/ToastContext.jsx), [`AuthContext.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/context/AuthContext.jsx), [`Sidebar.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/layout/Sidebar.jsx), [`MobileNav.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/layout/MobileNav.jsx), [`Header.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/layout/Header.jsx), [`MainLayout.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/layout/MainLayout.jsx), [`Login.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/pages/Login.jsx), [`Home.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/pages/Home.jsx).

---

## 📅 Log Entry: Phase 5 — Global Audio Player & Queue Engine
- **Files Created**: [`useKeyboardShortcuts.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/hooks/useKeyboardShortcuts.js), [`AudioContext.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/context/AudioContext.jsx), [`formatTime.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/utils/formatTime.js), [`QueueDrawer.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/player/QueueDrawer.jsx), [`PlayerBar.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/player/PlayerBar.jsx).

---

## 📅 Log Entry: Phase 6 — Global Search & Music Discovery
- **Files Created**: [`useDebounce.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/hooks/useDebounce.js), [`TrackCard.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/music/TrackCard.jsx), [`SkeletonLoader.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/music/SkeletonLoader.jsx), [`Search.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/pages/Search.jsx).

---

## 📅 Log Entry: Phase 7 — LRCLIB Lyrics Integration & Synced Auto-Scroll
- **Files Created**: [`lyricsService.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/services/lyrics/lyricsService.js), [`lyricsController.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/controllers/lyricsController.js), [`lyricsRoutes.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/routes/lyricsRoutes.js), [`LyricsView.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/player/LyricsView.jsx).

---

## 📅 Log Entry: Phase 8 — Library, Favorites, Playlists & History
- **Files Created**: [`userDataController.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/controllers/userDataController.js), [`userRoutes.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/routes/userRoutes.js), [`Library.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/pages/Library.jsx), [`Favorites.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/pages/Favorites.jsx), [`Playlists.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/pages/Playlists.jsx), [`PlaylistDetail.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/pages/PlaylistDetail.jsx), [`RecentlyPlayed.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/pages/RecentlyPlayed.jsx).

---

## 📅 Log Entry: Phase 9 — Now Playing & Mobile Experience
- **File Created**: [`NowPlayingModal.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/player/NowPlayingModal.jsx).

---

## 📅 Log Entry: Phase 10 — PWA Support & Service Worker
- **Files Created**: [`sw.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/public/sw.js), [`main.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/main.jsx).

---

## 📅 Log Entry: Phase 11 & 12 — Final QA Audit & Production Build Fix
- **File Modified**: [`PlaylistDetail.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/pages/PlaylistDetail.jsx)
  - **Fix**: Corrected syntax typo in `import { useParams, useNavigate } from 'react-router-dom';`.
- **Production Build Status**: PASS (Vite built 1678 modules in 4.66s with 0 errors).

---

## 🎯 Final Project Status
- All 12 Phases & Final QA Completed.
- Production Build: PASS.
