# Whispra

**AI-Powered Text-to-Speech for Virtual Meetings**

Whispra lets you type text and speak it in Google Meet (and other meeting platforms) using natural AI voices. Open Whispra in one browser tab and your meeting in another; route speech through a virtual audio cable so participants hear your AI-generated voice in real time.

---

## Features

- **Real-time TTS** — Type a message and generate natural speech with one click (OpenAI TTS API).
- **Voice selection** — Six voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer) with adjustable speed and pitch.
- **Virtual meeting integration** — Route audio into Google Meet, Zoom, or Microsoft Teams via a virtual audio cable (VB-Cable, BlackHole, etc.).
- **Meeting management** — Create and manage meetings, link TTS messages to meetings, and view history.
- **User accounts** — Sign in with email/password or Google (Supabase Auth). Save voice and language preferences.
- **Analytics** — View usage stats, meeting duration, and TTS usage over time.
- **Demo Mode** — Use the app when Supabase is unreachable (e.g. paused project or offline); TTS still works.
- **48 kHz mono WAV output** — Backend converts OpenAI MP3 to 48 kHz mono 16-bit WAV (via ffmpeg) for clean audio in meetings.

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Purpose |
|-------------|---------|
| **Node.js 18+** | Run frontend and backend |
| **PostgreSQL** | Store meetings, settings, analytics (or use [Supabase](https://supabase.com) for hosted Postgres) |
| **ffmpeg** | Convert TTS audio to 48 kHz mono WAV (required for `/api/tts/stream`) |
| **Virtual audio cable** | Route Whispra audio into your meeting app (e.g. [VB-Cable](https://vb-audio.com/Cable/), [BlackHole](https://existential.audio/blackhole/)) |

### Installing ffmpeg

ffmpeg must be on your system **PATH**. Verify with: `ffmpeg -version`

**macOS (Homebrew):**
```bash
brew install ffmpeg
```

**Windows:**
```powershell
# Option A: winget
winget install ffmpeg

# Option B: Manual — download from https://www.gyan.dev/ffmpeg/builds/ or
# https://github.com/BtbN/FFmpeg-Builds/releases, extract, then add the bin folder to PATH
# (System Properties → Environment Variables → Path → New)
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update && sudo apt install ffmpeg
```

**Linux (Fedora):**
```bash
sudo dnf install ffmpeg
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/whispra.git
cd whispra
```

### 2. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 3. Environment setup

Copy the example env files and fill in your values (see [Configuration](#configuration) below):

```bash
cp .env.example .env
cp server/.env.example server/.env
# Edit .env and server/.env with your API keys and URLs
```

### 4. Run database migrations

```bash
cd server
npm run migrate
cd ..
```

---

## Configuration

### Frontend (project root `.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL (must match server port) | `http://localhost:4000` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJ...` |

Get Supabase values from: **Supabase Dashboard → your project → Settings → API**.

### Backend (`server/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `OPENAI_API_KEY` | OpenAI API key (required for TTS) | `sk-...` |
| `VITE_SUPABASE_URL` | Same as frontend (for JWT verification) | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Same as frontend (optional on server) | `eyJ...` |
| `VITE_FRONTEND_URL` | Frontend origin (for CORS) | `http://localhost:5173` |
| `PORT` | Backend port | `4000` |

**Important:** `VITE_FRONTEND_URL` must match the URL where the frontend runs. Vite’s default is `http://localhost:5173`. If they differ, you will get CORS errors.

---

## Running the Application

You need **two terminals**: one for the frontend, one for the backend.

**Terminal 1 — Frontend:**
```bash
npm run dev
```
Frontend runs at **http://localhost:5173**.

**Terminal 2 — Backend:**
```bash
cd server
npm run dev
```
Backend runs at **http://localhost:4000** (or the `PORT` in `server/.env`).

Ensure `VITE_API_BASE_URL` in your root `.env` matches the backend URL (e.g. `http://localhost:4000`).

---

## Using with Google Meet

Whispra does not inject into Google Meet. You use a **two-tab workflow** and a **virtual audio cable** so that Whispra’s output becomes your meeting microphone.

### Step-by-step

1. **Install a virtual audio cable**
   - Windows: [VB-Cable](https://vb-audio.com/Cable/)
   - macOS: [BlackHole](https://existential.audio/blackhole/)

2. **Open Google Meet** in one tab and join your meeting.

3. **Open Whispra** in another tab (e.g. `http://localhost:5173`). Go to **Dashboard** → add or select a meeting → **Live Meeting** (or open the TTS composer).

4. **In Whispra:** Expand **Advanced** → **Output device** → select your **virtual cable** (e.g. “CABLE Input” or “BlackHole”).

5. **In Google Meet:** Open the microphone menu and set the **microphone** to the same virtual cable (e.g. “CABLE Output” or “BlackHole”).

6. In Whispra, type your message and click **Generate & Speak**. Your TTS will play through the cable and into the meeting as your mic.

### Tips for clearer audio

- Disable **noise cancellation** in Google Meet settings.
- Set the virtual cable to **48 000 Hz** and buffer size **≥ 512 samples** (in system sound device properties).
- Disable **“Allow applications to take exclusive control”** for the cable in Windows/Mac sound settings.

---

## Demo Mode

When Supabase is unreachable (e.g. project paused, no network, or wrong URL), Whispra can run in **Demo Mode**:

- A **yellow banner** appears at the top: *“Demo Mode: Running without authentication. All features available for demonstration.”*
- You can access all protected routes (dashboard, meetings, TTS) **without signing in**.
- **TTS works** — the backend allows unauthenticated requests to `/api/tts/stream`. Other APIs (meetings list, profile, analytics) may return 401; the UI still lets you try TTS and the flow.

To exit Demo Mode, fix Supabase (e.g. unpause the project, correct env vars) and refresh the page.

---

## Technology Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 18, TypeScript, Vite 6, React Router, Radix UI, Tailwind CSS, Lucide icons, Sonner (toasts) |
| **Backend** | Node.js, Express 5, TypeScript, PostgreSQL (pg), jose (JWT), Helmet, CORS, express-rate-limit |
| **Auth** | Supabase Auth (email/password, Google OAuth); JWT verification via Supabase JWKS |
| **TTS** | OpenAI TTS API (gpt-4o-mini-tts); ffmpeg for MP3 → 48 kHz mono WAV conversion |
| **Database** | PostgreSQL (Supabase or self-hosted); raw SQL migrations, no ORM |

---

## Project Structure

```
whispra/
├── src/                    # Frontend (React + Vite)
│   ├── auth/               # AuthProvider, authClient, RequireAuth, RequireGuest
│   ├── components/         # UI components (tts, dashboard, ui, marketing, etc.)
│   ├── lib/                # API client, TTS fetch, Supabase client, storage
│   ├── pages/              # Routes: landing, auth, dashboard, settings, marketing
│   ├── App.tsx, main.tsx, routes.ts
│   └── index.css
├── server/                 # Backend (Express)
│   ├── src/
│   │   ├── audio/          # ffmpeg MP3 → WAV conversion
│   │   ├── middleware/     # auth (JWT), rateLimit
│   │   ├── routes/         # meetings, tts, settings, analytics, user
│   │   ├── db/             # pool, migrations runner
│   │   └── index.ts        # App entry, /api/tts/stream, /api/health
│   └── migrations/         # SQL schema (meetings, tts_messages, user_settings, etc.)
├── public/
├── .env.example            # Frontend env template
├── server/.env.example     # Backend env template
├── package.json            # Frontend deps and scripts
└── server/package.json     # Backend deps and scripts
```

---

## Troubleshooting

### ffmpeg not found

- **Symptom:** TTS fails with 503 or “ffmpeg not available.”
- **Fix:** Install ffmpeg and add it to your system PATH. Run `ffmpeg -version` in a terminal; if it fails, install using the [Prerequisites](#installing-ffmpeg) section.

### CORS errors in the browser

- **Symptom:** Console shows “blocked by CORS policy” when the frontend calls the backend.
- **Fix:** Set `VITE_FRONTEND_URL` in `server/.env` to the **exact** URL of the frontend (e.g. `http://localhost:5173`). No trailing slash. Restart the backend after changing.

### Supabase unreachable / 401 on protected routes

- **Symptom:** “Failed to fetch” or “ENOTFOUND” for Supabase; protected routes return 401.
- **Fix:** Check that your Supabase project is **not paused** (Dashboard → project status). Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in both root `.env` and `server/.env`. If you only need to try TTS, the app will enter **Demo Mode** and TTS will still work.

### Database connection errors

- **Symptom:** 503 on `/api/user/profile` or “Connection terminated” in server logs.
- **Fix:** Ensure `DATABASE_URL` in `server/.env` is correct and the database is reachable. Run `npm run migrate` in the `server` folder. For Supabase, use the connection string from **Settings → Database** (e.g. pooler on port 6543).

### TTS returns 503 (audio conversion unavailable)

- **Symptom:** Frontend shows “Audio conversion unavailable” or similar.
- **Fix:** Backend requires ffmpeg to convert OpenAI MP3 to WAV. Install ffmpeg and ensure it is on the PATH of the process running the server.

---

## License and Contributors

- **License:** ISC (see repository or `package.json` for full text).
- **Contributors:** See the repository’s Contributors section or commit history.

---

*Original design: [Figma – Whispra](https://www.figma.com/design/6abQfiX1RtXyqMcHYj8wOI/whispra).*
