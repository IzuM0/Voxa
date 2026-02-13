
  # Voxa

  This is a code bundle for Voxa. The original project is available at https://www.figma.com/design/6abQfiX1RtXyqMcHYj8wOI/whispra.

  ## Running the code

  Run `npm i` to install the dependencies.

## Environment setup

1. **Frontend:** Copy `.env.example` to `.env` in the project root. Set `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.
2. **Backend (TTS):** Copy `server/.env.example` to `server/.env`. Set `OPENAI_API_KEY` for text-to-speech. Optionally set `DATABASE_URL` for meetings and analytics.

  Run `npm run dev` to start the development server.

## Authentication setup

This project supports:
- **Supabase auth (recommended)**: set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env`
- **Demo auth fallback**: if those aren't set, sign-in/sign-up will use a local demo session (no backend)
