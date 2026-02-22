# Whispra: Production Readiness Roadmap

**Goal:** Move from "build complete" to **confident, production-ready launch** with clear priorities and no scope creep.

---

## Current State

- **Technical:** Core features work, security in place, migrations defined, errors handled.
- **Gap:** A few launch blockers, no tests, and some UX polish needed so the first production users have a smooth experience.

**Use this doc as your single focus list.** Do Phase 1, then launch. Do Phase 2 in the first 1–2 weeks post-launch. Phase 3 is backlog.

---

## Phase 1: Launch Blockers (Do Before Going Live)

**Goal:** Safe, reliable launch. No new features.

| # | Task | Why | Effort |
|---|------|-----|--------|
| 1 | **Run migration 003** | Analytics and duration tracking need `audio_duration_seconds`. | 5 min |
| 2 | **Guard or remove production console logs** | Avoid leaking debug info and cluttering logs. | ~30 min |
| 3 | **Document and verify env vars** | Ensure every required variable is in README + .env.example so deploy works. | ~30 min |
| 4 | **Smoke-test critical path** | Sign up → create meeting → open Live Meeting → generate TTS → view meeting detail/analytics. Fix any breakage. | 1–2 hrs |
| 5 | **Decide and document “production” URLs** | e.g. `VITE_API_BASE_URL` and `VITE_FRONTEND_URL` for prod. Update README. | 15 min |

**Exit criteria for Phase 1:** A new user can sign up, create a meeting, generate TTS in Live Meeting, and see analytics on Meeting Detail. No unguarded console logs in production build. Migrations and env are documented.

---

## Phase 2: First 1–2 Weeks Post-Launch (Reliability + One Big UX Win)

**Goal:** Fewer support issues and one clear “this feels pro” improvement.

### 2a – Reliability (pick 2–3)

| # | Task | Why | Effort |
|---|------|-----|--------|
| 1 | **Retry for TTS/API** | On network or 5xx, show “Retry” instead of only an error message. | ~1 hr |
| 2 | **Basic health/readiness check** | Frontend calls e.g. `GET /api/health` and shows “Service temporarily unavailable” if backend or DB is down. | ~1 hr |
| 3 | **Replace critical `any` types** | Use `Meeting` and `TTSMessage[]` (and similar) where we flagged in the system review. Fewer runtime surprises. | ~1–2 hrs |
| 4 | **One critical-path test** | Single E2E or integration test: e.g. “create meeting → open Live Meeting → generate TTS” (or login → dashboard loads). | 2–4 hrs |

### 2b – One Big UX Win (pick one)

| Option | Task | Impact |
|--------|------|--------|
| **A** | **Simplify Dashboard** | Reduce to 3–4 stats, single primary “Start meeting” CTA, better empty state. Biggest impact from the UX audit. |
| **B** | **Live Meeting layout** | Collapsible TTS history sidebar, less clutter, clearer focus on composer. |
| **C** | **Accessibility basics** | ARIA labels on icon buttons, visible focus states, one pass with keyboard-only navigation. |

Recommendation: **Option A (Simplify Dashboard)** — it’s the first thing users see and sets the tone.

---

## Phase 3: Backlog (After Phase 2)

Do in order of user feedback and business need:

1. **More tests** – Additional E2E or API tests for meetings, analytics, auth.
2. **UX polish** – Remaining audit items: breadcrumbs, toasts for “TTS sent” / “Settings saved”, empty states.
3. **Monitoring** – Error tracking (e.g. Sentry), uptime check, or simple logging for 5xx and TTS failures.
4. **Docs** – Short “Production deployment” section (env, migrations, optional reverse proxy, ffmpeg).
5. **CI** – Run lint + build (and later tests) on every PR.

---

## What Not to Do Before Production

- **No new features** (no bot, no new integrations). Ship what you have.
- **No big refactors.** Only small, targeted fixes (types, logs, one layout).
- **No “nice to have” UX** until Phase 1 and Phase 2 are done.

---

## Checklist Summary

**Before launch (Phase 1):**

- [ ] Migration 003 run on production DB
- [ ] Console logs guarded or removed for production
- [ ] Env vars documented and production values set
- [ ] Critical path smoke-tested (sign up → meeting → TTS → analytics)
- [ ] Production URLs documented

**First 1–2 weeks (Phase 2):**

- [ ] Retry and/or health check (reliability)
- [ ] One focused UX improvement (dashboard **or** Live Meeting **or** a11y)
- [ ] (Optional) One critical-path test

**Later (Phase 3):**

- [ ] More tests
- [ ] More UX polish
- [ ] Monitoring
- [ ] CI

---

## Focus Statement

**Right now:**  
Get Phase 1 done (migrations, logs, env, smoke-test, docs). Then launch.

**Next:**  
In the first 1–2 weeks, add 2–3 reliability tweaks and **one** big UX win (preferably dashboard simplification). Leave the rest for the backlog.

This keeps the system production-ready without overreaching, and brings it to a “confident, polished” state quickly after launch.
