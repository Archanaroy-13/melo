# Melo — Version 1.0.0 Checkpoint & Architecture Specification

**Status**: Stable v1.0.0 Release Checkpoint  
**Date**: September 17, 2026  
**Application**: Melo (Private Single-User Music Streaming Application)

---

## 📌 Executive Summary

Melo v1.0.0 is a complete, private, single-user, ad-free music streaming and player web application built using React 18, Vite 6, Tailwind CSS 4, Express.js, and MongoDB. The system provides music discovery, dynamic audio URL resolution via legitimate provider adapters, timestamped LRC lyrics synchronization, user library management, and Progressive Web App (PWA) support.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18.3 (Vite 6.4 bundler)
- **Styling**: Tailwind CSS 4.0 (Obsidian dark aesthetic, custom glows, dynamic typography)
- **Routing**: React Router DOM 7.2
- **Icons**: Lucide React
- **PWA**: Web App Manifest (`manifest.json`) & Custom Service Worker (`sw.js`)

### Backend
- **Runtime**: Node.js (Express 4.21 API server)
- **Database ORM**: Mongoose 8.10
- **HTTP Client**: Axios 1.7 (for upstream music & lyrics API calls)
- **Security & Cookies**: `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `cors`, `express-rate-limit`

### Database & Storage
- **Database**: MongoDB (Local `mongodb://127.0.0.1:27017/melo` or MongoDB Atlas)
- **Persistence**: User accounts, credentials, library saves, favorites, custom playlists, listening history, user settings.

---

## 📐 Architecture & Core Subsystems

### 1. Authentication & Security
- **Single-User Master Setup Guard**: `POST /api/auth/setup` initializes the master account. Once a master user exists, setup endpoint is permanently disabled.
- **Session Management**: JWT issued upon authentication and stored in secure HTTP-only cookies (`token`).
- **Rate Limiting**: Express IP rate limiter configured across sensitive auth and API routes.

### 2. Music Provider Adapter Architecture
- **Decoupled Provider Pattern**: Backend standardizes provider interfaces ([`musicService.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/services/music/musicService.js) + [`sayaMusicProvider.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/services/music/providers/sayaMusicProvider.js)).
- **Dynamic Audio URL Resolution**: Song metadata is indexed without permanent stream links. Stream URLs are resolved on demand (`POST /api/music/resolve`).
- **Single-Refresh Stream Recovery**: If a stream link expires during playback, `AudioContext` attempts a single re-resolution before tagging `"Audio unavailable"` and advancing the queue.

### 3. Audio Player Engine & Global Queue
- **State Management**: [`AudioContext.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/context/AudioContext.jsx) wraps HTML5 Audio element to provide persistent playback across page navigation.
- **Queue Controls**: Drag-free queue reordering, track removal, upcoming song preview, shuffle, repeat (all/one/off).
- **Keyboard Shortcuts**: Global hotkeys ([`useKeyboardShortcuts.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/hooks/useKeyboardShortcuts.js)) for `Space`, `Left`, `Right`, `M`, `N`, `P` with typing bypass protection for form inputs.

### 4. Synced LRC Lyrics System
- **Provider**: LRCLIB integration via [`lyricsService.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/services/lyrics/lyricsService.js).
- **Lyrics View**: [`LyricsView.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/player/LyricsView.jsx) renders active line purple glow, smooth center auto-scrolling, and interactive click-to-seek timestamp navigation.

### 5. Library, Collections & History
- **Library**: Saved songs ([`UserLibrary.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/UserLibrary.js)).
- **Favorites**: Liked tracks ([`Favorite.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/Favorite.js)).
- **Playlists**: Custom playlist creation, cover art selection, and track ordering ([`Playlist.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/Playlist.js)).
- **Recently Played**: History recording ([`RecentlyPlayed.js`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/backend/models/RecentlyPlayed.js)) after 30 seconds or 25% duration playback.

### 6. Mobile & PWA Experience
- **Now Playing Modal**: Fullscreen mobile modal ([`NowPlayingModal.jsx`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/frontend/src/components/player/NowPlayingModal.jsx)) with album artwork, audio controls, queue drawer, and lyrics overlay.
- **Service Worker**: PWA caching static UI shell while excluding copyrighted audio streams for legal compliance.

---

## 🧪 Build & QA Verification Status

| Verification Step | Command / Target | Result | Status |
|---|---|---|---|
| **Production Build** | `npm run build` | 1678 modules transformed in 14.97s | PASS |
| **Backend Audit Test** | `node backend/audit_test.js` | Provider registered, Express routes mounted on port 5009, Healthcheck OK | PASS |
| **Secret Safety Check** | `.env` vs `.gitignore` | `.env` excluded in root `.gitignore`. `.env.example` verified safe. | PASS |
| **Git Repository Status** | `git status` | Clean state verified (Git not initialized yet). | PASS |

---

## 🔒 Checkpoint Declaration

Melo Version 1.0.0 is complete, audited, and frozen for initial stable release. Future development should build on top of this checkpoint without refactoring working core mechanics.
