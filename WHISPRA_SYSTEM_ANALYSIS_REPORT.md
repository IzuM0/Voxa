# WHISPRA SYSTEM ANALYSIS REPORT

**Important clarification:** Whispra/Voxa is a **web application** (React + Vite + Express), not a browser extension. There is no `manifest.json`, no content script, and no popup. Users open the app in a browser tab alongside Google Meet and route TTS into the meeting via a **virtual audio cable** (e.g. VB-Cable): they select the cable as the audio output in the app and as the microphone in Meet.

---

## 1. PROJECT STRUCTURE

### Folder tree (key paths; excludes node_modules)

```
whispra/
├── index.html
├── package.json
├── vite.config.ts
├── README.md
├── .env.example (optional; root .env used by Vite)
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx
│   ├── Root.tsx
│   ├── routes.ts                # React Router config
│   ├── index.css
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── authClient.ts
│   │   ├── RequireAuth.tsx
│   │   └── RequireGuest.tsx
│   ├── lib/
│   │   ├── api.ts               # Backend API client
│   │   ├── tts.ts               # TTS fetch (buffer)
│   │   ├── activeMeetingStorage.ts
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── storage.ts
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── NotFound.tsx
│   │   ├── auth/ (SignIn, SignUp, ForgotPassword)
│   │   ├── dashboard/ (Dashboard, Meetings, MeetingDetail, LiveMeeting, Settings, Analytics, Help)
│   │   ├── dashboard/settings/ (Profile, Voice, Billing)
│   │   ├── marketing/ (Features, Pricing, HowItWorks)
│   │   └── demo/ (TTSDemo)
│   └── components/
│       ├── tts/ (TTSComposer.tsx, AudioVisualizer if any)
│       ├── dashboard/ (DashboardNav, MeetingCard, StatsCard)
│       ├── ui/ (shadcn-style: button, card, select, slider, etc.)
│       ├── marketing/, profile/, confirmation-modals/, empty-states/, loading-states/, error-states/
│       └── ErrorBoundary.tsx
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── src/
    │   ├── index.ts              # Express app, /api/tts/stream, /api/health
    │   ├── audio/
    │   │   └── convertToWav.ts   # ffmpeg MP3 → 48kHz mono WAV
    │   ├── middleware/ (auth.ts, rateLimit.ts)
    │   ├── routes/ (meetings, tts, settings, analytics, user)
    │   ├── db/ (index.ts, migrate.ts)
    │   └── types/ (database.ts)
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_user_profiles.sql
        └── README.md
```

### Main components

| Component | Description |
|-----------|-------------|
| **Frontend** | React SPA (Vite). Entry: `index.html` → `main.tsx` → `App.tsx` → `RouterProvider`. No popup/content script; single web app. |
| **Backend** | Express server in `server/`. TTS, meetings, settings, analytics, user profile, health. |
| **Config** | `vite.config.ts`, `server/tsconfig.json`, root `package.json`, `server/package.json`. No ESLint/Prettier config in repo. |
| **Build** | Frontend: `npm run dev` / `npm run build` (Vite). Backend: `cd server && npm run dev` / `npm run build` (tsc). |
| **Documentation** | `README.md` (setup, env, ffmpeg, auth). No API docs or architecture doc. |

---

## 2. CODEBASE INVENTORY

### A. Frontend (extension-style UI = web app)

- **Entry:** `index.html` → `src/main.tsx` → `App.tsx` → `RouterProvider` with `routes.ts`. No separate popup or background worker.
- **React/TS files:** ~94 under `src/` (pages, components, auth, lib). Key: `TTSComposer.tsx`, `LiveMeeting.tsx`, `Dashboard.tsx`, `authClient.ts`, `api.ts`, `tts.ts`.
- **Manifest:** None. This is not a Chrome/Firefox extension.
- **Dependencies (frontend):** React 18.3, react-router, @supabase/supabase-js, Radix UI (accordion, dialog, select, slider, etc.), lucide-react, sonner, recharts, tailwind-merge, class-variance-authority, cmdk, framer-motion, etc. Express/cors/dotenv/pg are in root package.json but used by the backend pattern (monorepo-style); frontend build only uses Vite + React deps.
- **UI components:** TTSComposer (message input, voice/language, advanced: speed/pitch/audio output), DashboardNav, MeetingCard, StatsCard, Settings (Profile, Voice, Billing), empty/loading/error states, full set of shadcn-style UI primitives.

### B. Backend

- **API endpoints:**
  - `POST /api/tts/stream` — TTS: body (text, voice, language, speed, pitch, meeting_id) → OpenAI → ffmpeg → 48kHz mono WAV → response.
  - `GET /api/health` — Health + DB status.
  - `GET|POST|PUT|DELETE /api/meetings` — CRUD; `GET /api/meetings/:id/tts-logs`.
  - `GET|POST /api/tts/messages`, `PUT /api/tts/messages/:id/status`.
  - `GET|PUT /api/settings`.
  - `GET /api/analytics/stats|platforms|voices|monthly|daily-activity`.
  - `GET|PUT /api/user/profile`, `DELETE /api/user`.
- **Database:** PostgreSQL (Supabase). No Prisma. Raw SQL in `server/migrations/`: `meetings`, `tts_messages`, `user_settings`, `user_profiles` (002). Pool in `server/src/db/index.ts`, migrations via `server/src/db/migrate.ts`.
- **Backend deps:** express, cors, helmet, dotenv, pg, jose (JWT), express-rate-limit, openai (optional; TTS uses fetch to OpenAI in index.ts).
- **Auth:** Supabase JWT in `Authorization: Bearer <token>`. Backend uses `optionalAuth` (attach user if token valid) and `requireAuth` (401 if invalid). JWKS from Supabase; on network failure (e.g. ENOTFOUND) verification returns null but request continues (TTS still works).
- **Env:** `server/.env.example`: DATABASE_URL, OPENAI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, PORT, VITE_FRONTEND_URL, DB_CONNECTION_TIMEOUT_MS. Root `.env` for Vite: VITE_API_BASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.

### C. Configuration & build

- **Vite:** `vite.config.ts` — React (SWC), path alias, loadEnv, optional dev proxy for `/api/tts` (OpenAI).
- **TypeScript:** `server/tsconfig.json` for server; Vite uses its own TS handling for frontend.
- **ESLint/Prettier:** No config files found in repo.
- **Scripts:** Root: `dev`, `build`. Server: `dev` (ts-node-dev), `build` (tsc), `start`, `migrate`.

---

## 3. FEATURE ANALYSIS (WHAT IS IMPLEMENTED)

| Feature | Status | Implementation | Location | Limitations |
|---------|--------|----------------|----------|-------------|
| **User authentication** | Yes | Supabase: email/password, Google OAuth, session. Backend: JWT via JWKS. | `src/auth/`, `server/src/middleware/auth.ts` | When Supabase is unreachable (e.g. paused), JWKS fetch fails; backend logs warning and continues without user ID (optionalAuth). |
| **Text input** | Yes | Textarea in TTSComposer, 500 char limit, character count. | `src/components/tts/TTSComposer.tsx` | Single field; no templates or quick phrases. |
| **TTS integration** | Yes | OpenAI TTS API (gpt-4o-mini-tts). Backend buffers MP3, converts to 48kHz mono WAV (ffmpeg), sends full WAV. | `server/src/index.ts`, `server/src/audio/convertToWav.ts`, `src/lib/tts.ts` | Requires ffmpeg on server PATH. No streaming to client; full buffer then play. |
| **Voice selection** | Yes | 6 voices: alloy, echo, fable, onyx, nova, shimmer. | TTSComposer, backend forwards to OpenAI | OpenAI-only; no custom/cloned voices. |
| **Speed/pitch control** | Yes | Sliders 0.5–2.0 in “Advanced” section; stored in user_settings. | TTSComposer, Settings Voice, `server` (speed in API) | Pitch via instructions; speed via API. |
| **Google Meet “integration”** | Partial | No Meet DOM injection. User opens Meet in one tab, Whispra in another; selects virtual audio cable as output in app and as mic in Meet. | LiveMeeting page, TTSComposer (output device selector) | Manual two-tab + virtual cable setup. No content script or Meet automation. |
| **Audio playback** | Yes | Single `<audio>` element; blob from WAV buffer; preload=auto; canplaythrough before play; setSinkId for device; volume 0.8. | TTSComposer | No Web Audio API; no MediaStream injection. |
| **Virtual audio routing** | Yes | User picks output device (e.g. VB-Cable) via setSinkId; same device selected as mic in Meet. | TTSComposer (audio output dropdown) | Relies on user installing and configuring cable + Meet. |
| **User preferences** | Yes | Voice, speed, pitch, language in DB (`user_settings`). Profile/avatar in DB + Supabase Storage. | `server/routes/settings.ts`, `src/lib/api.ts`, Settings pages | Billing is placeholder only. |
| **Meeting history** | Yes | Meetings CRUD, TTS messages per meeting, analytics (stats, platforms, voices, monthly, daily). | `server/routes/meetings.ts`, `analytics.ts`, `tts.ts` (messages) | Stored in PostgreSQL; no in-Meet transcript. |
| **Dashboard** | Yes | Dashboard, Meetings, Meeting detail, Live meeting, Settings (Profile, Voice, Billing), Analytics, Help. | `src/pages/dashboard/*`, `src/routes.ts` | Billing UI is placeholder. |
| **Error handling** | Partial | Try/catch in TTS flow; rate limit and quota messages in UI; auth network errors reduced in logs. | TTSComposer, authClient, server middleware | Some routes may not return consistent JSON errors; no global error boundary for API. |
| **Loading states** | Yes | Generating/playing/success/error in TTSComposer; loaders on dashboard/meetings; skeleton components. | TTSComposer, Dashboard, LiveMeeting, loading-states/ | — |

---

## 4. TECHNOLOGY STACK (ACTUAL)

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18.3, TypeScript (Vite), React Router, Radix UI + custom UI, Tailwind (index.css), Vite 6, no formal state library (React state + context). |
| **Backend** | Express 5, Node, TypeScript, pg (PostgreSQL), jose (JWT), Helmet, CORS, express-rate-limit. |
| **Auth** | Supabase Auth (session + JWT); backend verifies via Supabase JWKS. |
| **TTS** | OpenAI TTS API; ffmpeg (external binary) for MP3 → 48kHz mono WAV. |
| **Database** | PostgreSQL (Supabase); raw SQL migrations, no ORM. |
| **Hosting** | Not specified (local dev only in README). |

---

## 5. CRITICAL ISSUES

### Critical (breaks or blocks core use)

1. **Supabase unreachable (ENOTFOUND)**  
   - **Impact:** JWT verification fails; protected routes (meetings, settings, profile, analytics) return 401 when token is sent; TTS still works (optionalAuth).  
   - **Location:** `server/src/middleware/auth.ts` (JWKS fetch).  
   - **Fix:** Restore/unpause Supabase project; ensure network/DNS from server to Supabase; keep current “continue without user” behavior for optionalAuth so TTS is not blocked.

2. **ffmpeg required for TTS**  
   - **Impact:** If ffmpeg is not on server PATH, `/api/tts/stream` returns 503 and TTS does not work.  
   - **Location:** `server/src/audio/convertToWav.ts`, `server/src/index.ts`.  
   - **Fix:** Document and ensure ffmpeg is installed and on PATH in every environment; optionally add a health check that verifies ffmpeg.

3. **No root .env.example**  
   - **Impact:** New devs may miss frontend env vars (VITE_API_BASE_URL, VITE_SUPABASE_*).  
   - **Fix:** Add `.env.example` at repo root listing all VITE_* and any other frontend vars.

### Important (degraded experience)

4. **Billing is placeholder** — Settings → Billing has no real payment or limits; may confuse users. Either hide it or implement minimal usage/limits.

5. **Google Meet is manual** — No in-Meet injection; user must use two tabs and virtual cable. Improves only with a browser extension (content script) or different product shape.

6. **No tests** — No unit or E2E tests; regressions and refactors are risky.

7. **CORS / frontend URL** — Backend defaults `VITE_FRONTEND_URL` to `http://localhost:3000`; Vite default is 5173. Can cause CORS issues if not set correctly.

### Nice to have

8. **Log noise** — Already reduced for Supabase network errors; could add request IDs or structured logging.  
9. **TypeScript** — Some `any` and `@ts-ignore` in TTSComposer (e.g. `audioEl as any` for setSinkId).  
10. **Duplicate tooltip systems** — Mix of Tooltip (shadcn) and TooltipPrimitive (Radix) in one app.

---

## 5B. DEPENDENCIES AUDIT

- **Frontend (root package.json):** React 18.3, react-router, @supabase/supabase-js, Radix UI (many), lucide-react, sonner, recharts, tailwind-merge, class-variance-authority, clsx, cmdk, framer-motion, etc. **Note:** cors, express, dotenv, pg are listed at root but are server concerns—likely for a single-workspace setup; frontend build only needs Vite + React deps.
- **Backend (server/package.json):** express, cors, helmet, dotenv, jose, pg, express-rate-limit; dev: ts-node-dev, typescript, @types/*. **openai** is listed but TTS in index.ts uses `fetch` to OpenAI; openai pkg may be unused.
- **Unused / to verify:** Root: cors, express, dotenv, pg (if backend is always run from `server/`). Server: openai (if not used anywhere).
- **Outdated / security:** Run `npm outdated` and `npm audit` in both root and server; no automated audit was run for this report.
- **Missing for planned features:** No extension-related deps (e.g. webextension-polyfill); no extra TTS providers.

---

## 5C. COMPETITIVE COMPARISON (HIGH LEVEL)

| Feature | Whispra (current) | Fireflies.ai | Otter.ai | Google Meet built-in |
|--------|--------------------|--------------|----------|------------------------|
| Real-time TTS (type → speak) | Yes (web app + cable) | No (recording/transcription) | No | Limited (read captions) |
| Natural voices (OpenAI-level) | Yes | N/A | N/A | Basic |
| Google Meet | Manual (cable as mic) | Integrations | Integrations | Native |
| Voice/speed customization | Yes | N/A | N/A | Limited |
| Meeting history / analytics | Yes (meetings + TTS logs) | Yes | Yes | No |
| Pricing | Self-host / DIY | ~$10/mo | ~$8/mo | Free |

**Whispra’s niche:** Real-time, type-to-speak in meetings with strong voice control and 48kHz WAV for clean audio, without requiring a browser extension. Limitation: user must run app + Meet in two tabs and configure virtual cable.

---

## 6. FEATURE RECOMMENDATIONS

### Tier 1: Essential (do next)

- **Stabilize auth and env**  
  - Restore Supabase or document “no auth” mode; add root `.env.example`; fix CORS port (5173) in docs and default.  
  - **Complexity:** Low. **Time:** 1–2 hours.

- **Billing or usage clarity**  
  - Either implement a simple usage cap (e.g. characters/month) and show it on dashboard, or remove/hide Billing and show “Usage” only.  
  - **Complexity:** Medium if DB + API; low if UI-only. **Time:** 0.5–2 days.

- **Basic tests**  
  - Unit tests for `api.ts` (request shape, error handling) and for TTSComposer (playback state, error messages). Optional E2E: sign-in → one TTS flow.  
  - **Complexity:** Medium. **Time:** 1–3 days.

### Tier 2: Competitive edge

- **Quick phrases / templates** — Save and reuse short phrases (e.g. “Thanks everyone”, “One moment”). Stored per user; UI in TTSComposer or sidebar.  
- **Meeting templates** — Pre-fill meeting title/URL/platform from templates.  
- **Better “How to use with Meet”** — Short video or step-by-step (open Meet → open Whispra → set cable as output → set cable as mic).  
- **Zoom/Teams** — Same mental model (virtual cable as mic); no code change to core TTS, only docs and maybe platform selector in meetings.

### Tier 3: Future vision

- **Browser extension** — Real “in-Meet” experience: content script or sidebar that injects UI or captures meeting tab; would require separate codebase (manifest, background, content script).  
- **Voice cloning / custom voices** — Depends on provider (e.g. OpenAI or third-party); high effort.  
- **Real-time translation** — Type in one language, speak in another (TTS in target language).  
- **Analytics dashboard** — Deeper usage and “time saved” metrics; you already have the tables and APIs to build on.

---

## 7. TECHNICAL IMPROVEMENTS

- **Architecture:** Keep “web app + virtual cable” as is. If you add an extension later, share API and auth with the current backend.  
- **Performance:** TTS is already full-buffer then play (good for stability). Optional: cache recent TTS by hash of (text, voice, speed) to avoid re-calling OpenAI for repeats.  
- **Code quality:** Replace remaining `any`/`@ts-ignore` with proper types (e.g. extend `HTMLAudioElement` for setSinkId); standardize on one tooltip API; add a small logger (request ID, level) instead of raw console.  
- **Testing:** Jest or Vitest for unit tests; Playwright or Cypress for one critical E2E path (login → TTS).  
- **Security:** Input validation and length limits already present on TTS; keep rate limiting; ensure no secrets in frontend env.  
- **UX:** You’ve already improved TTSComposer (volume, canplaythrough, device selector, tooltips). Next: clear “first-time” steps for Meet + cable, and optional keyboard shortcut to focus the composer.

---

## 8. ACTION PLAN

### Week 1 (immediate)

- Fix or document Supabase (restore project or document “TTS without auth”).  
- Add root `.env.example` and align README/CORS with port 5173.  
- Decide: hide Billing or add a minimal “Usage” view (e.g. characters used this month from existing analytics).

### Weeks 2–3

- Add unit tests for `api.ts` and one or two TTSComposer behaviors.  
- Optional: one E2E test (sign-in → generate TTS).  
- Improve “How to use with Google Meet” (docs or in-app steps).

### Month 1

- Optional: simple “quick phrases” (save/load a few strings).  
- Optional: health check that verifies ffmpeg.  
- Plan deployment (e.g. frontend on Vercel/Netlify, backend on Railway/Render; env and CORS).

---

## 9. FINAL VERDICT

- **What it is:** A **web app** (not an extension) that does TTS via OpenAI, converts to 48kHz mono WAV with ffmpeg, and plays through the browser with optional routing to a virtual audio cable so the user can use that cable as the mic in Google Meet. Auth, meetings, and analytics are implemented and stored in PostgreSQL.

- **What works:** TTS flow (with ffmpeg and Supabase reachable), voice/language/speed/pitch, output device selection, meeting CRUD, TTS message history, user settings, dashboard, and basic analytics. When Supabase is down, TTS still works; protected routes fail with 401.

- **What to do next:**  
  - **Don’t pivot.** The core (TTS → WAV → virtual cable → Meet) is sound for a web-based tool.  
  - **Stabilize:** Supabase, env, and CORS; then add tests and clarify billing/usage.  
  - **Differentiate:** Quick phrases, clear “Meet + cable” onboarding, and later Zoom/Teams (same model) or an optional browser extension for a more “inside Meet” experience.

- **Honest take:** The app is ~75–80% there for a “TTS into meetings via virtual cable” product. The main gaps are operational (Supabase/ffmpeg/env), clarity (Billing/usage, Meet setup steps), and quality (tests, logging). No need to rewrite; focus on stability, docs, and one or two high-value features (e.g. quick phrases, usage cap or clear “Usage” page).
