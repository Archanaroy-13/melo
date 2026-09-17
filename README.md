# Melo — Your Music 🎵

**Melo** is a private, single-user, ad-free full-stack music streaming and player web application built with React, Vite, Tailwind CSS, Express, and MongoDB.

Designed with an obsidian dark aesthetic, Melo provides a modern music streaming experience powered by legitimate public music provider adapters (SayaMusicAPI wrapper) and synchronized lyrics via LRCLIB.

---

## 🌟 Key Features

- **Ad-Free & Private**: Built specifically for one master user. No ads, pop-ups, tracking, or subscription paywalls.
- **Music Provider Abstraction**: Powered by a decoupled provider architecture (`musicService` + `sayaMusicProvider`). Frontend never contacts external music APIs directly.
- **Dynamic Stream URL Resolution**: Metadata is stored without permanent stream URLs (`POST /api/music/resolve`). Links are resolved on demand when playback starts.
- **Single-Refresh Stream Recovery**: If a stream link expires, Melo automatically performs a single URL re-resolution. If unavailable, it cleanly tags `"Audio unavailable"` and advances the queue without crashing.
- **Synchronized LRC Lyrics**: Integrates LRCLIB to render timestamped synchronized lyrics with active line purple glow highlighting, smooth center auto-scrolling, and click-to-seek timestamp controls.
- **Dedicated Library & Collections**: Distinct separation between:
  - 📚 **Library**: Saved tracks
  - ❤️ **Favorites**: Liked tracks
  - 🎵 **Playlists**: Custom user collections with track reordering
  - 🕘 **Recently Played**: Listening history recorded via 30s/25% duration rule
- **PWA Support**: Web App Manifest & Service Worker for installability on mobile and desktop devices. Static app shell cached; copyrighted audio streams are strictly excluded from offline caching.
- **Single-User Security**: First-run setup guard (`POST /api/auth/setup` disabled once master user exists), bcrypt password hashing, HTTP-only JWT cookies, and rate limiting.
- **Media Session API & Keyboard Shortcuts**: Hardware key controls and global hotkeys (`Space`, `Left`, `Right`, `M`, `N`, `P`) with input typing bypass protection.

---

## 🛠 Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 4, Lucide Icons, React Router DOM 7.
- **Backend**: Node.js, Express.js, Mongoose, Axios, bcryptjs, cookie-parser, CORS, jsonwebtoken.
- **Database**: MongoDB (Local or MongoDB Atlas).
- **Music Service**: SayaMusicAPI / Saavn public wrapper provider adapter.
- **Lyrics Service**: LRCLIB (`https://lrclib.net/api`).

---

## 📁 Project Structure

```
melo/
├── backend/
│   ├── config/             # Database connection & error logging
│   ├── controllers/        # Auth, Music, Lyrics, UserData controllers
│   ├── middleware/         # Auth JWT cookie middleware & Rate limiter
│   ├── models/             # User, Favorite, UserLibrary, Playlist, RecentlyPlayed, Settings
│   ├── routes/             # Auth, Music, Lyrics, User Express routers
│   ├── services/
│   │   ├── music/          # MusicService & SayaMusicProvider adapter
│   │   └── lyrics/         # LyricsService & LRC parser
│   ├── index.js            # Express server entrypoint
│   └── package.json
│
├── frontend/
│   ├── public/             # PWA manifest.json, sw.js, favicon.svg
│   ├── src/
│   │   ├── components/     # Layout (Sidebar, Header, MobileNav), Music, Player (PlayerBar, QueueDrawer, LyricsView, NowPlayingModal)
│   │   ├── context/        # AudioContext, AuthContext, ToastContext
│   │   ├── hooks/          # useAudio, useAuth, useDebounce, useKeyboardShortcuts
│   │   ├── pages/          # Home, Search, Library, Favorites, Playlists, PlaylistDetail, RecentlyPlayed, Settings, Login
│   │   ├── utils/          # formatTime
│   │   ├── App.jsx         # Router & Protected routes
│   │   ├── main.jsx        # App mounting & PWA registration
│   │   └── index.css       # Tailwind CSS & design tokens
│   ├── vite.config.js
│   └── package.json
│
├── .env.example
├── changes_review.md       # Live architecture review log
└── package.json            # Root launcher scripts
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local service or MongoDB Atlas connection string)

### 1. Clone repository & Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in root:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/melo
SESSION_SECRET=melo_private_secret_key_change_in_production_2026
SAYA_MUSIC_API_BASE_URL=https://saavn.dev/api
LRCLIB_API_BASE_URL=https://lrclib.net/api
```

### 3. Run Development Server
From the root directory, start both Express backend and Vite frontend simultaneously:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🔑 First-Run Master Account Setup

1. Open `http://localhost:5173` in your browser.
2. The application will detect no master user exists and display the **First-Run Setup** screen.
3. Enter your desired master username and password.
4. Click **Create Master Account**. Once created, `/api/auth/setup` is permanently disabled.

---

## ⌨️ Global Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause toggle |
| `Left Arrow` | Seek backward 5s |
| `Right Arrow` | Seek forward 5s |
| `M` | Mute / Unmute toggle |
| `N` | Next track in queue |
| `P` | Previous track |

*Shortcuts automatically bypass when typing inside input fields, textareas, selects, or editable elements.*

---

## 📜 Legal & Licensing Considerations

- Melo is built for private single-user streaming without advertisements or commercial monetization.
- Stream audio URLs are resolved dynamically through public music provider adapters. Melo does not bypass DRM, paywalls, or protected playback systems.
- If a track metadata exists without a playable audio URL, Melo cleanly displays `"Audio unavailable"`.
- PWA Service Worker caches static UI assets only. Copyrighted external audio streams are strictly excluded from offline caching.
