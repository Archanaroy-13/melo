# Melo Deployment Guide

This document provides step-by-step instructions for deploying the Melo application to production using **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Database).

---

## Architecture

```text
Browser Client (https://your-melo-app.vercel.app)
       │
       │  Same-Origin /api/* Requests
       ▼
Vercel Frontend Shell (Proxies /api/* via vercel.json rewrite)
       │
       │  Forwarded HTTPS Request
       ▼
Render Express Backend (https://your-melo-backend.onrender.com)
       │
       ├──► MongoDB Atlas Database (Cloud Mongoose Connection)
       ├──► SayaMusic API Provider (with iTunes API Fallback)
       └──► LRCLIB Lyrics API Service
```

---

## 1. MongoDB Atlas Database Setup

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Database Cluster (Shared FREE tier or Dedicated).
3. Create a **Database User**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Choose **Password Authentication**, set a strong username and password, and assign the `readWriteAnyDatabase` or `dbAdmin` role.
4. Configure **Network Access**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Add `0.0.0.0/0` (Allow Access from Anywhere) so Render backend cloud instances can connect.
5. Obtain Connection String:
   - Go to **Database > Connect > Drivers**.
   - Select **Node.js**.
   - Copy the SRV connection string:
     `mongodb+srv://<username>:<password>@<cluster-url>/melo?retryWrites=true&w=majority`
   - *Note: Replace `<username>` and `<password>` with your database user credentials.*

---

## 2. Render Backend Deployment

1. Log in to [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your Git repository.
4. Configure Web Service settings:
   - **Name**: `melo-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Configure **Environment Variables**:
   Add the following variables in the Render dashboard (**Environment** tab):

   | Variable Name | Value | Purpose |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production security checks & HTTPS cookies |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/melo...` | MongoDB Atlas database connection URI |
   | `SESSION_SECRET` | `<random-32-character-secret>` | Secret key for JWT session signing |
   | `CLIENT_URL` | `https://your-melo-app.vercel.app` | Allowed CORS origin (Your Vercel deployment URL) |

6. Click **Create Web Service**.
7. Note down your Render backend URL (e.g., `https://melo-backend.onrender.com`).

---

## 3. Vercel Frontend Deployment

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New > Project** and import your Git repository.
3. Update `vercel.json` in your repository:
   - Open [`vercel.json`](file:///c:/Users/ARCHNA%20ROY/OneDrive/Desktop/melo/vercel.json).
   - Set the destination URL to your actual Render backend URL:
     ```json
     {
       "rewrites": [
         {
           "source": "/api/:path*",
           "destination": "https://melo-backend.onrender.com/api/:path*"
         }
       ]
     }
     ```
4. Configure Vercel Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
5. Click **Deploy**.
6. Once deployment finishes, copy your production Vercel URL (e.g., `https://your-melo-app.vercel.app`).
7. Update `CLIENT_URL` in your Render Web Service settings if your Vercel domain differs from your initial setting.

---

## 4. Environment Variables Reference

### Backend Variables (Render / Cloud Host)
- `NODE_ENV` (**Required**): Set to `production`.
- `PORT` (**Optional**): Automatically assigned by Render.
- `MONGODB_URI` (**Required**): MongoDB Atlas connection URI.
- `SESSION_SECRET` (**Required**): Long random string used to sign JWT cookies. Server will halt startup if missing in production.
- `CLIENT_URL` (**Required**): Production Vercel domain URL.
- `SAYA_MUSIC_API_BASE_URL` (*Optional*): Custom Saavn API base URL override.
- `LRCLIB_API_BASE_URL` (*Optional*): Custom LRCLIB base URL override.

### Frontend Variables (Vercel)
- **None Required**: Frontend utilizes same-origin `/api/*` requests rewritten transparently by `vercel.json`. No client-side secret variables are exposed.

---

## 5. First-Run Master Account Setup

1. Open your production Vercel URL (`https://your-melo-app.vercel.app`) in a web browser.
2. The application will detect no master user exists and display the **First-Run Master Setup** screen.
3. Enter your desired master username and password.
4. Click **Create Master Account**.
5. Once created, the `/api/auth/setup` endpoint is permanently disabled.

---

## 6. Verification & Health Audit

After deployment, verify the following steps:
1. **Health Check**: Open `https://your-melo-app.vercel.app/api/health`. Should return `{"status":"ok","dbStatus":"connected"}`.
2. **Authentication**: Log out and log back in to verify HTTP-only JWT cookies over HTTPS.
3. **Search & Playback**: Search for a song, click play, and verify dynamic stream URL resolution.
4. **Lyrics View**: Open Now Playing modal / Lyrics view and verify synced LRC highlighting.
5. **Library & Favorites**: Save a track to Library and heart a track to Favorites.
6. **Playlists**: Create a playlist and add songs to verify MongoDB Atlas write operations.
7. **History**: Play a song past 30 seconds and check Recently Played.
8. **PWA**: Install the application shell on mobile or desktop via browser PWA prompt.

---

## 7. Troubleshooting

- **CORS Errors (`Access-Control-Allow-Origin`)**: Ensure `CLIENT_URL` on Render exactly matches your Vercel URL (including `https://` without a trailing slash).
- **Authentication Check Fails after Login**: Ensure `vercel.json` is transparently routing `/api/*` to Render so cookies are sent under same-origin policies.
- **MongoDB Connection Error**: Verify `0.0.0.0/0` is added to Atlas Network Access IP List, and username/password in `MONGODB_URI` are correct.
- **Render Cold Starts**: Render Free Web Services sleep after 15 minutes of inactivity. Initial request after sleep takes ~30-50 seconds to wake up up the container.
- **PWA Service Worker Not Registering**: Ensure your domain is served over HTTPS (Vercel automatically provides SSL).

---

## 8. Optional Future Security Hardening

- **Helmet HTTP Headers**: Installing and enabling `helmet` in `backend/index.js` can be added in future iterations to supply `X-Content-Type-Options`, `Strict-Transport-Security`, and `X-Frame-Options` headers.
