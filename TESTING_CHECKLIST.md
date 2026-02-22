# Whispra Demo Testing Checklist

Use this checklist before the demo to verify critical flows. Check off each item as you verify it.

---

## 1. Fresh User Flow

### 1.1 Open in incognito browser
- [ ] **Test:** Open the app in an incognito/private window (Chrome: Ctrl+Shift+N / Cmd+Shift+N).
- **Expected result:** App loads without cached auth; you appear as a new user.
- **How to verify:** No existing session; landing or login page is shown.
- **If it fails:** Clear site data for the origin or use a different incognito window.

### 1.2 Landing page loads
- [ ] **Test:** Navigate to the app root URL.
- **Expected result:** Landing page renders with branding, value proposition, and Sign up / Log in options.
- **How to verify:** No console errors; layout and copy are correct; links work.
- **If it fails:** Check dev server is running, env vars are set, and network tab for failed requests.

### 1.3 Sign up works
- [ ] **Test:** Click Sign up, enter email and password, submit.
- **Expected result:** Account is created; success message or redirect; no crash.
- **How to verify:** Supabase Auth shows new user (if applicable); no error toast/alert.
- **If it fails:** Check Supabase project URL/key, auth settings, and browser console for API errors.

### 1.4 Email verification (if enabled)
- [ ] **Test:** If email confirmation is on, open verification email and click link (or enter code).
- **Expected result:** Email is marked verified; user can log in.
- **How to verify:** Auth state shows email confirmed; app allows access after verification.
- **If it fails:** Check Supabase Auth > Email templates and redirect URLs; spam folder.

### 1.5 Redirects to dashboard
- [ ] **Test:** After sign up (and verification if required), complete login.
- **Expected result:** User is redirected to the dashboard (e.g. `/meetings` or `/dashboard`).
- **How to verify:** URL changes to dashboard route; dashboard content is visible.
- **If it fails:** Check auth redirect logic and protected-route configuration.

### 1.6 Dashboard shows correctly
- [ ] **Test:** On dashboard, confirm layout and key elements.
- **Expected result:** Nav, meeting list or empty state, Create meeting / Join meeting actions, and any stats or cards render correctly.
- **How to verify:** No layout shift or missing sections; responsive on narrow width.
- **If it fails:** Check for JS errors and that dashboard route/components load.

---

## 2. Demo Mode Flow

### 2.1 Simulate Supabase being down
- [ ] **Test:** Block Supabase (e.g. wrong `VITE_SUPABASE_URL` in `.env`, or use devtools Network tab to block `supabase.co` requests), then reload.
- **Expected result:** App detects unreachable Supabase and switches to demo mode.
- **How to verify:** No infinite loading; app still renders (possibly with limited data).
- **If it fails:** Confirm AuthProvider/API logic that detects Supabase failure and sets `isDemoMode`.

### 2.2 App enters demo mode
- [ ] **Test:** With Supabase blocked, open app and (if needed) bypass auth or use demo login.
- **Expected result:** `isDemoMode` is true; protected routes remain accessible for demo.
- **How to verify:** Dashboard and Live Meeting are reachable without real Supabase auth.
- **If it fails:** Check RequireAuth and AuthProvider for demo-mode branching.

### 2.3 Yellow banner appears
- [ ] **Test:** While in demo mode, view any protected page.
- **Expected result:** Yellow (or configured) demo-mode banner is visible (e.g. “Demo mode – Supabase unavailable”).
- **How to verify:** Banner text and styling match design; it’s dismissible or persistent as designed.
- **If it fails:** Confirm DemoModeBanner is rendered in layout when `isDemoMode` is true.

### 2.4 TTS still works
- [ ] **Test:** In demo mode, open Live Meeting (or TTS composer), enter text, select voice, click Speak.
- **Expected result:** TTS request is sent to your backend; audio generates and plays (backend not dependent on Supabase for TTS).
- **How to verify:** Audio plays; no “auth required” or Supabase errors in console for TTS path.
- **If it fails:** Ensure TTS API uses its own auth/env and doesn’t rely on Supabase for the request.

### 2.5 Dashboard accessible
- [ ] **Test:** In demo mode, navigate to Dashboard and Meetings.
- **Expected result:** Pages load; list may be empty or show mock data; no hard crash.
- **How to verify:** No redirect to login; nav works; no uncaught errors.
- **If it fails:** Ensure RequireAuth allows access when `isDemoMode` is true.

---

## 3. TTS Flow

### 3.1 Type message in TTSComposer
- [ ] **Test:** On Live Meeting page, focus the TTS message textarea and type a short sentence.
- **Expected result:** Text appears; character count updates; no lag or crash.
- **How to verify:** Type “Hello, this is a test.” and see it in the textarea.
- **If it fails:** Check TTSComposer state and textarea binding.

### 3.2 Select voice
- [ ] **Test:** Open the Voice dropdown and choose a different voice (e.g. Nova, Onyx).
- **Expected result:** Selection updates and is reflected in the UI.
- **How to verify:** Label shows selected voice; selection persists until changed.
- **If it fails:** Check Select component and voice state in TTSComposer.

### 3.3 Click “Speak” (Generate & Speak)
- [ ] **Test:** With text entered and voice selected, click the primary Speak / Generate & Speak button.
- **Expected result:** Button shows loading state; request is sent to TTS API.
- **How to verify:** Button text/icon changes to “Generating…” or similar; network tab shows TTS request.
- **If it fails:** Check handler, API URL, and CORS; ensure button isn’t disabled (e.g. empty text).

### 3.4 Audio generates (<2 seconds)
- [ ] **Test:** After clicking Speak, wait for audio to be ready.
- **Expected result:** Audio is generated and begins playing (or is ready to play) within about 2 seconds for a short sentence.
- **How to verify:** Time from click to first sound (or “playing” state); check Network tab for audio response time.
- **If it fails:** Check backend TTS latency, network, and streaming/buffer logic.

### 3.5 Audio plays correctly
- [ ] **Test:** Let the generated audio play; optionally change system or in-app output device.
- **Expected result:** Audio is clear, at expected volume, and uses the selected output device if applicable.
- **How to verify:** Listen on default device; then select another output in Advanced settings and replay.
- **If it fails:** Check Audio element, setSinkId if used, and backend format (e.g. WAV/format support).

### 3.6 Error handling – empty text
- [ ] **Test:** Clear the textarea (or leave it empty) and try to click Speak (if button becomes enabled).
- **Expected result:** Button is disabled when text is empty, or a friendly error appears (e.g. “✏️ Please enter some text to speak.”).
- **How to verify:** No raw API error; user sees clear message.
- **If it fails:** Ensure TTSComposer disables submit when empty and/or backend returns a clear error that is mapped to the friendly message.

### 3.7 Error handling – network error
- [ ] **Test:** Disconnect network (or block the TTS API in devtools), then try to generate speech.
- **Expected result:** Friendly error message (e.g. “🌐 Network issue. Check your connection.”) and no crash.
- **How to verify:** No uncaught errors; error state/message is visible in UI.
- **If it fails:** Ensure fetch/API errors are caught and passed through `getUserFriendlyError` (or equivalent).

---

## 4. Quick Phrases

### 4.1 Click a quick phrase
- [ ] **Test:** On Live Meeting, in the Quick Phrases section, click one phrase (e.g. “Thank you everyone”).
- **Expected result:** The phrase is inserted into the TTS message textarea (replacing current content).
- **How to verify:** Textarea content becomes exactly that phrase.
- **If it fails:** Check QuickPhrases `onSelect` and TTSComposer’s handler that sets message state.

### 4.2 Message fills in textarea
- [ ] **Test:** Click several different quick phrases in sequence.
- **Expected result:** Each click updates the textarea to the clicked phrase.
- **How to verify:** Content matches the last clicked phrase; no duplication or append bugs.
- **If it fails:** Ensure `onSelect` sets the message state to the phrase (replace, not append, unless designed otherwise).

### 4.3 Speaks immediately or ready to speak
- [ ] **Test:** Click a quick phrase then immediately click “Generate & Speak” (or use any “Speak” shortcut if present).
- **Expected result:** TTS is generated and plays for the phrase in the textarea.
- **How to verify:** Audio corresponds to the selected phrase; no stale or empty request.
- **If it fails:** Confirm state is updated before the Speak handler runs (no race).

---

## 5. Voice Settings

### 5.1 Change default voice in Settings
- [ ] **Test:** Open Settings (or profile/settings page), find “Default voice” or “Preferred voice”, change to another option (e.g. Echo), save.
- **Expected result:** Setting is saved (API or local storage as designed); success feedback if applicable.
- **How to verify:** UI shows the new selection after save; no error toast.
- **If it fails:** Check settings API and form submit handler.

### 5.2 Save preferences
- [ ] **Test:** Change default voice (and speed/pitch if available), click Save.
- **Expected result:** Preferences are persisted (backend or localStorage).
- **How to verify:** Network tab shows successful PATCH/POST to settings endpoint, or localStorage updated.
- **If it fails:** Check API route, auth, and request payload.

### 5.3 Preference persists on reload
- [ ] **Test:** After saving, reload the page (F5 or full refresh).
- **Expected result:** Settings page still shows the saved voice (and other saved options).
- **How to verify:** Voice dropdown shows the same selection after reload.
- **If it fails:** Ensure settings are loaded on mount (e.g. from API or localStorage).

### 5.4 New TTS uses saved voice
- [ ] **Test:** Without changing voice in TTSComposer, go to Live Meeting and generate speech.
- **Expected result:** TTS uses the saved default voice (e.g. Echo), not a hard-coded default.
- **How to verify:** Listen to output; or check network request payload for `voice` field.
- **If it fails:** Ensure TTSComposer (or parent) loads settings and initializes voice state from them.

---

## 6. First-Time Guide

### 6.1 Clear localStorage
- [ ] **Test:** Open Application (or Storage) tab in devtools, clear localStorage for the app origin; or run `localStorage.removeItem('whispra_guide_shown')` in console.
- **Expected result:** Key `whispra_guide_shown` is removed so the app treats the user as first-time for the guide.
- **How to verify:** Reload; guide can appear again on Live Meeting.
- **If it fails:** Confirm the key name matches `FIRST_TIME_GUIDE_STORAGE_KEY` in code.

### 6.2 Visit Live Meeting page
- [ ] **Test:** With guide key cleared, navigate to the Live Meeting page (with a valid meeting ID or flow that lands on Live Meeting).
- **Expected result:** First-time guide modal opens automatically.
- **How to verify:** Modal appears without clicking anything; content is step 1 (Welcome).
- **If it fails:** Check LiveMeeting effect that checks `localStorage` and sets `showGuide`; ensure meeting is loaded so the effect runs.

### 6.3 Guide modal appears
- [ ] **Test:** Confirm modal UI: title, description, step content, progress, buttons.
- **Expected result:** Modal shows “Welcome” (or step 1) with “X of 4”, progress dots, Skip Guide, and Next.
- **How to verify:** All four steps have correct titles and content (Welcome, Install Cable, Configure Whispra, Configure Meet).
- **If it fails:** Check FirstTimeGuide steps array and Dialog layout.

### 6.4 Can navigate through steps
- [ ] **Test:** Click “Next” through steps 1 → 2 → 3 → 4; also click a progress dot to jump to a step.
- **Expected result:** Step content and “X of 4” update; on step 4, primary button is “Get Started”.
- **How to verify:** Each step shows the right copy and links (e.g. VB-Cable, BlackHole).
- **If it fails:** Check step state and dot click handlers in FirstTimeGuide.

### 6.5 Can skip or close
- [ ] **Test:** Click “Skip Guide”; in another run, click the X or “Get Started” on last step.
- **Expected result:** Modal closes; no errors.
- **How to verify:** Modal unmounts; dashboard/Live Meeting content is visible.
- **If it fails:** Check `onComplete` and Dialog `onOpenChange`/close handling.

### 6.6 Doesn’t show again after completion
- [ ] **Test:** After closing/skipping/finishing the guide, navigate away and back to Live Meeting, or reload the page.
- **Expected result:** Guide does not appear again; `whispra_guide_shown` is set in localStorage.
- **How to verify:** localStorage contains `whispra_guide_shown`; guide modal does not open.
- **If it fails:** Ensure `handleClose` in FirstTimeGuide sets localStorage before calling `onComplete`.

---

## 7. Error Scenarios (Friendly Messages)

### 7.1 Empty text → friendly error
- [ ] **Test:** Ensure message is empty (or only whitespace if that’s invalid), then trigger TTS (if UI allows).
- **Expected result:** User sees a friendly message (e.g. “✏️ Please enter some text to speak.”) and not a raw API or technical error.
- **How to verify:** Error banner/toast shows the friendly string; no stack or “400”/“invalid input” in UI.
- **If it fails:** Use `getUserFriendlyError` (or equivalent) for empty-text responses; map API message to the same string.

### 7.2 Network disconnect → friendly error
- [ ] **Test:** Turn off network or block the TTS (or auth) API, then perform an action that triggers a request.
- **Expected result:** Friendly message (e.g. “🌐 Network issue. Check your connection.”).
- **How to verify:** No uncaught error; user-facing message is clear and non-technical.
- **If it fails:** Ensure network/fetch errors are caught and run through the friendly-error mapper.

### 7.3 Rate limit → friendly error
- [ ] **Test:** If possible, trigger a 429 (e.g. many TTS requests in a short time) or simulate 429 in devtools/backend.
- **Expected result:** Friendly message (e.g. “⏱️ Slow down! Wait a moment before speaking again.”).
- **How to verify:** UI shows the friendly message; no raw “429” or “rate limit exceeded” in the copy.
- **If it fails:** In TTS (and other) error handlers, map 429/rate-limit responses to the friendly string via `getUserFriendlyError` or similar.

---

## Pre-Demo Quick Pass

- [ ] Incognito: landing → sign up → dashboard (or login → dashboard).
- [ ] Demo mode: Supabase blocked → banner → TTS works → dashboard accessible.
- [ ] TTS: type → select voice → Speak → audio in <2s → plays correctly.
- [ ] Quick phrase: click phrase → textarea fills → Speak works.
- [ ] Settings: change voice → save → reload → voice persists → TTS uses it.
- [ ] First-time guide: clear `whispra_guide_shown` → open Live Meeting → guide appears → complete/skip → doesn’t show again.
- [ ] Errors: empty text, offline, and (if possible) rate limit show friendly messages.

---

*Last updated for Whispra demo. Adjust URLs, env names, and key names to match your codebase.*
