# Melo Production Readiness

## Current Architecture

Melo is a private, single-user, ad-free music streaming web application.
- **Frontend**: SPA built with React 18.3, Vite 6.4, Tailwind CSS 4.0, React Router DOM 7.2. Communicates with backend endpoints exclusively via JSON REST APIs (`/api/*`).
- **Backend**: Express 4.21 Node.js server. Handles authentication, Mongoose database interactions, music provider abstraction, and timestamped LRC lyrics.
- **Database**: MongoDB (Mongoose ORM). Stores user credentials, library items, favorites, playlists, listening history, and user settings.
- **External Providers**: Server-side SayaMusic API wrapper (with fallback to iTunes Search & Lookup APIs) and LRCLIB timestamped lyrics service.
- **PWA**: Custom Service Worker (`sw.js`) caching static UI assets while excluding copyrighted audio streams and API calls.

---

## Environment Variables

| Variable | Used By | Required in Dev | Required in Production | Sensitive | Notes |
|---|---|---|---|---|---|
| `PORT` | Backend | Optional (default `5000`) | Optional (Assigned by host e.g. Render/Railway) | No | Express listening port |
| `NODE_ENV` | Backend | Optional (default `development`) | **Required** (`production`) | No | Enables production security checks & HTTPS cookies |
| `MONGODB_URI` | Backend | Optional (default local) | **Required** | **Yes** | Connection string for MongoDB Atlas or cloud MongoDB |
| `SESSION_SECRET` | Backend | Optional (default dev key) | **Required** | **Yes** | JWT signing secret. Server halts if missing in production. |
| `CLIENT_URL` | Backend | Optional (default `http://localhost:5173`) | **Required** | No | Allowed CORS origin (Frontend production URL) |
| `SAYA_MUSIC_API_BASE_URL` | Backend | Optional (default `https://saavn.dev/api`) | Optional | No | Upstream Saavn API mirror base URL |
| `LRCLIB_API_BASE_URL` | Backend | Optional (default `https://lrclib.net/api`) | Optional | No | Upstream lyrics API base URL |
| `VITE_API_BASE_URL` | Frontend | Optional (default proxy `/api`) | Optional | No | Base API URL if cross-origin API calls used without proxy rewrites |

---

## Frontend Configuration

- **Current API Communication**: Frontend components use relative path calls (`/api/...`) via Axios (`AuthContext`, `AudioContext`, pages).
- **Development Behavior**: `vite.config.js` configures a local proxy mapping `/api` -> `http://localhost:5000`.
- **Production Assessment**:
  - If frontend static files are hosted on Vercel or Netlify and backend API is hosted on Render or Railway, relative `/api` calls will hit the frontend host directly unless a reverse proxy (e.g. `vercel.json` or `_redirects`) is configured.
  - Alternatively, configuring an Axios `baseURL` helper via `import.meta.env.VITE_API_BASE_URL` allows direct cross-origin API calls.

---

## Backend Configuration

- **Express Listening**: Listens on `process.env.PORT || 5000`.
- **Host Binding**: Listens on default network interfaces (`0.0.0.0` compatible for cloud hosts like Render/Railway/Heroku/Fly.io).
- **Healthcheck Endpoint**: `GET /api/health` returns status, DB connection state, app name, and version.
- **Production Safety Guards**: `authController.js` and `authMiddleware.js` enforce that `SESSION_SECRET` must be set when `NODE_ENV === 'production'`.

---

## CORS

- **Current Setup**:
  ```js
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }));
  ```
- **Audit Findings**:
  - No wildcards (`*`) used.
  - Correctly restricted to `process.env.CLIENT_URL`.
  - `credentials: true` enables HTTP-only authentication cookies.

---

## Authentication & Cookies

- **Session Token**: Signed JWT (`7d` expiration) stored in HTTP-only cookie named `token`.
- **Cookie Security Settings**:
  ```js
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  ```
- **Cross-Domain Production Audit**:
  - If frontend (`melo.vercel.app`) and backend (`melo-api.onrender.com`) are on **different domains** without reverse proxy rewrites:
    - Modern browsers block `sameSite: 'lax'` cookies on cross-origin fetch/XHR requests.
    - Cross-domain cookie authentication requires `sameSite: 'none'` and `secure: true`.
  - If frontend host uses reverse proxy rewrites (`vercel.json` routing `/api/*` -> `melo-api.onrender.com/api/*`), requests remain single-origin from the browser's perspective, so `sameSite: 'lax'` continues to work securely.

---

## MongoDB

- **Connection Setup**: `connectDB()` in `backend/config/db.js` loads `process.env.MONGODB_URI`.
- **Cloud Compatibility**: Compatible with MongoDB Atlas SRV URIs (`mongodb+srv://user:pass@cluster.mongodb.net/melo?retryWrites=true&w=majority`).
- **Database Collections**:
  - `users` (Master user account)
  - `userlibraries` (Saved tracks)
  - `favorites` (Liked tracks)
  - `playlists` (Custom playlists)
  - `recentlyplayeds` (Listening history)
  - `settings` (User settings)

---

## External Providers

| Service | Purpose | Server-side / Client-side | Environment Variable | Failure Handling |
|---|---|---|---|---|
| **SayaMusic** | Music search, track details, audio stream resolution | Server-side | `SAYA_MUSIC_API_BASE_URL` | Loops through Saavn mirrors; falls back to iTunes Search & Lookup API |
| **iTunes API** | Legal fallback search & audio preview lookup | Server-side | N/A (Standard HTTPS) | Catches errors gracefully; returns empty or unplayable track objects |
| **LRCLIB** | Timestamped LRC lyrics fetch | Server-side | `LRCLIB_API_BASE_URL` | Tries exact `/get` endpoint; falls back to `/search`; returns unavailable gracefully |

---

## PWA

- **Manifest**: `frontend/public/manifest.json` configured with obsidian theme colors, portrait orientation, and icons.
- **Service Worker**: `frontend/public/sw.js` pre-caches static application shell assets (`/`, `/index.html`, `/manifest.json`, `/favicon.svg`).
- **Stream Caching Exclusion**: External audio streams (`saavn`, `jiosaavn`, `destination === 'audio'`, range requests) and `/api` requests are strictly excluded from SW cache for legal and storage compliance.
- **Production Requirement**: Service Workers require HTTPS on non-localhost domains.

---

## Security

- **Secrets Isolation**: `.env` file excluded from version control in `.gitignore`.
- **Password Security**: Passwords hashed with `bcryptjs` (10 rounds).
- **Master Setup Locking**: First-run setup disabled permanently once master user exists in database.
- **No Production Fallback Secrets**: Production startup fails if `SESSION_SECRET` is unset.
- **Rate Limiting**: IP rate limiting active on `/api/auth/setup` and `/api/auth/login`.

---

## Deployment Compatibility

### Vercel + Render
- **Frontend (Vercel)**: Hosts static production build (`dist`). Add `vercel.json` rewrites mapping `/api/(.*)` -> `https://<render-app-name>.onrender.com/api/$1`.
- **Backend (Render)**: Web Service running `npm start` (`node index.js`). Set `NODE_ENV=production`, `MONGODB_URI`, `SESSION_SECRET`, and `CLIENT_URL=https://<vercel-app-name>.vercel.app`.

### Netlify + Render
- **Frontend (Netlify)**: Hosts static production build (`dist`). Add `public/_redirects` file: `/api/* https://<render-app-name>.onrender.com/api/:splat 200`.
- **Backend (Render)**: Web Service running `npm start`. Set environment variables accordingly.

### Vercel + Railway
- **Frontend (Vercel)**: Hosts static build. Uses `vercel.json` rewrites to route `/api/*` to Railway backend URL.
- **Backend (Railway)**: Docker or Node service running `npm start`. Set environment variables accordingly.

---

## Required Changes Before Deployment

### 1. Frontend API Route Dispatch in Production
- **Status**: **DONE**
- **Problem**: Production frontend static build calls `/api/...` as relative paths. Hosted on Vercel, this requires routing to the Render backend.
- **Current Behavior**: [`vercel.json`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/vercel.json) created in repository root mapping `/api/:path*` -> `https://YOUR-MELO-BACKEND.onrender.com/api/:path*`. Local Vite proxy (`http://localhost:5000`) remains active for dev.
- **Files Involved**: [`vercel.json`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/vercel.json)
- **Code Change Required**: Completed.
- **Environment Config Required**: Replace `YOUR-MELO-BACKEND.onrender.com` in `vercel.json` with actual Render URL upon host service creation.

### 2. Cookie `sameSite` Policy for Production Architecture
- **Status**: **DONE / ARCHITECTURE ALIGNED**
- **Problem**: If frontend & backend communicate cross-domain without proxy rewrites, `sameSite: 'lax'` prevents browsers from sending cookies.
- **Current Behavior**: Vercel `/api/*` rewrite proxies requests under single-origin context from the browser's perspective. `sameSite: 'lax'` with `httpOnly: true` and `secure: true` in production functions cleanly.
- **Files Involved**: `backend/controllers/authController.js`, `backend/middleware/authMiddleware.js`.
- **Code Change Required**: None required for Vercel rewrite architecture.

---

## Optional Improvements

1. **Security Headers**: Add `helmet` middleware in `backend/index.js` for extra HTTP security headers (optional future task).
2. **Deployment Documentation**: Complete step-by-step instructions recorded in [`DEPLOYMENT.md`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/DEPLOYMENT.md).

---

## Deployment Checklist

- [x] Create Vercel API rewrite configuration ([`vercel.json`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/vercel.json)).
- [x] Create step-by-step deployment guide ([`DEPLOYMENT.md`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/DEPLOYMENT.md)).
- [ ] **REQUIRES DEPLOYMENT CONFIGURATION**: Create MongoDB Atlas database cluster and copy connection URI.
- [ ] **REQUIRES DEPLOYMENT CONFIGURATION**: Set up Render Web Service with environment variables: `NODE_ENV=production`, `MONGODB_URI`, `SESSION_SECRET`, `CLIENT_URL`.
- [ ] **REQUIRES DEPLOYMENT CONFIGURATION**: Update Render URL placeholder in `vercel.json` and deploy frontend to Vercel.
- [ ] **REQUIRES DEPLOYMENT CONFIGURATION**: Open production URL, complete First-Run Master Setup, and test protected routes.

