# Voxa

This is a code bundle for Voxa. The original project is available at https://www.figma.com/design/6abQfiX1RtXyqMcHYj8wOI/whispra.

## Running the code

1. Run `npm i` to install frontend dependencies.
2. Run `npm i` in the `server` folder to install backend dependencies.

## Environment setup

1. **Frontend:** Copy `.env.example` to `.env` in the project root. Set `VITE_API_BASE_URL` (e.g. `http://localhost:4000`), `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.
2. **Backend:** Copy `server/.env.example` to `server/.env`. Set `OPENAI_API_KEY` for text-to-speech. Optionally set `DATABASE_URL` for meetings and analytics. For JWT verification, set `VITE_SUPABASE_URL` (or `SUPABASE_URL`) to match your Supabase project URL.

## Development

- **Frontend:** From the project root, run `npm run dev`. The app runs at **http://localhost:5173** (Vite default).
- **Backend:** From the `server` folder, run `npm run dev`. The API runs at **http://localhost:4000** (or the port in `server/.env`).

You need both running: frontend for the UI, backend for TTS and API.

## TTS and meeting audio (Phase 1)

For clean TTS into Google Meet via a virtual audio cable, the backend converts OpenAI MP3 to **48 kHz mono 16‑bit WAV**. This requires **ffmpeg** on the server:

- Install ffmpeg and ensure it is on the system **PATH** (e.g. [ffmpeg.org](https://ffmpeg.org/download.html) or `winget install ffmpeg` on Windows).
- If ffmpeg is missing, `/api/tts/stream` returns 503 with a message to install it.

## Authentication setup

This project supports:

- **Supabase auth (recommended):** set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the root `.env`.
- **Google OAuth:** In the Supabase Dashboard → Authentication → URL Configuration, add your app redirect URL (e.g. `http://localhost:5173/dashboard` for local dev).
- **Demo auth fallback:** if Supabase env vars aren’t set, sign-in/sign-up uses a local demo session (no backend).
