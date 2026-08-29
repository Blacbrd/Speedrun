# AGENT_README.md

Context file for any AI agent (Claude Code, Devin, or otherwise) working on this repo. Read this before making changes. Keep it current — if you change the architecture, folder layout, or stack, update this file in the same session.

This is a hackathon project built while mobile (phone-only testing, no laptop access during demo windows), so state drifts fast. Treat this file as the single source of truth for "what's actually true right now," not the commit history.

---

## 1. Current state (as of last update)

- **Frontend**: Expo Router app with the first real flow: `index.tsx` reads the stored session and redirects to `sign-in` or `room`; `sign-in.tsx`/`sign-up.tsx` call the backend auth endpoints and persist the session in `expo-secure-store`; `room.tsx` shows a Mapbox map centered on the device location plus the task list, and submits a task photo for Gemini verification.
  - Map rendering is split: `@rnmapbox/maps` (native builds) and Mapbox GL JS in a WebView (Expo Go, which has no native module). `src/components/room-map.tsx` picks between them.
  - Frontend env vars live in `frontend/.env` (`frontend/.env.example`), read only in `src/constants/config.ts`.
- **Backend**: FastAPI app with these working routers:
  - `GET /api/data` — reads from a Supabase `players` table (placeholder/example, not real product logic yet)
  - `GET /api/gemini/status` — confirms the Gemini client constructs from `GEMINI_KEY`; does **not** call the model (construction only, costs zero API requests)
  - `GET /api/tasks` — returns the seeded photo tasks from the Supabase `tasks` table
- **Auth / DB**: Supabase, client wired in `backend/db/supabase.py`, credentials from `.env`.

Setup instructions (installing, running frontend + backend, phone testing over tunnel): see `SETUP.md`. Tunnel/ngrok specifics and troubleshooting: see `ngrok_setup.md`.

---

## 2. Ground rules for any agent working here

These apply regardless of which agent/model is doing the work.

1. **Diagnose before you edit.** Read the actual code path involved — don't assume behavior from a filename or a memory of "how this usually works." This codebase has already had two real bugs (a wrong import source, a pydantic-settings config mismatch) that only surfaced by actually running the code, not by reading it. Reproduce the problem, find the real cause, then fix it. Never guess-and-check on a hackathon clock.
2. **DRY.** If you're about to write logic that already exists elsewhere (a Supabase query, a Gemini call, a themed component), extract/reuse instead of duplicating. Check `db/`, `core/`, and `components/` (once it exists) before writing something new.
3. **Single responsibility, one thing per file.** No god files. A router file handles routing and delegates; it does not contain business logic, DB queries inline, and model calls all in one function. A React component file exports one component (plus its tightly-coupled subcomponents if truly private to it). See the file structure rules below.
4. **Match effort to task.** Use a fast/cheap model or a narrow, surgical agent for small mechanical work (renames, one-file fixes, typo-level changes). Reach for a heavier/more capable model or a broader investigation pass for anything that touches multiple files, changes architecture, or where the failure mode is unclear. Don't burn a big model on a one-line fix; don't rush a broad refactor with a shallow pass.
5. **Verify, don't declare done.** "It should work" is not done. Run it — start the server, hit the endpoint, load the screen, check the log — before saying a task is complete. If you can't verify without spending a real resource (an API call that costs quota/money, a destructive DB write, a push), say so explicitly and ask, rather than silently skipping verification or silently doing the costly thing.
6. **Don't touch `.env` secrets or commit them.** Real keys stay local per person. If you need a new secret, add the placeholder key to `.env.example` and tell the human, don't invent a stand-in value.
7. **Small, reviewable changes.** Especially under hackathon time pressure, prefer a working narrow change over a sweeping one you haven't fully verified.

---

## 3. File structure and where things go

### Backend (`backend/`, FastAPI + Supabase + Gemini, Python 3.13, managed with `uv`)

```
backend/
  main.py              # App entrypoint only: creates FastAPI(), includes routers. No business logic here.
  core/
    config.py           # Settings (pydantic-settings), reads .env. All env vars declared here, nowhere else.
  db/
    supabase.py          # Supabase client construction + get_db() dependency. The ONLY place a Supabase client is created.
  routers/
    <feature>/
      get.py             # GET routes for that feature
      post.py             # POST routes (create as needed, same pattern)
      __init__.py
  schemas/
    <feature>.py         # Pydantic request/response models, one file per feature/domain
```

Rules:
- **Routers are thin.** A route function validates input (via schema), calls a service/db function, returns a response. It does not contain multi-step business logic inline — if a handler grows past ~15-20 lines of real logic, extract it into a `services/<feature>.py` module (create `backend/services/` when the first real one is needed).
- **One external client, one file.** Supabase client lives only in `db/supabase.py`. When a Gemini call is actually added (not just the status check), its client construction goes in a new `backend/ai/gemini.py` (or similar), not inline in the router.
- **New feature = new router folder**, named after the feature/domain (`routers/players/`, `routers/matches/`, etc.), not dumped into `routers/db/`.
- **Config**: every environment variable the app reads must be declared as a field on `Settings` in `core/config.py`. Never read `os.environ` directly elsewhere in the codebase.

### Frontend (`frontend/`, Expo Router, React Native + Expo Go, iOS-only target)

```
frontend/
  src/
    app/                 # Expo Router file-based routes ONLY. A route file wires screens together, it is not where UI logic/markup lives if that logic is reusable.
      _layout.tsx          # Root layout (navigation shell)
      index.tsx            # Home route
      <route>.tsx           # One file per route/screen
    components/           # Reusable UI components. One component per file, named after the component (kebab-case filename, PascalCase export).
    hooks/                # Custom hooks, one hook per file (`use-thing.ts`)
    constants/             # Shared constants (colors, spacing, config values) — no magic numbers/strings duplicated across components
    lib/                  # API clients (calls to the backend) + secure session storage, one file per backend resource/domain
  assets/
    images/                # Only assets actually referenced by app.json or code. Don't leave in unused starter images — check references before adding or keeping.
  app.json                 # Static Expo config — icon/splash/plugin references must stay in sync with assets/ actually present
  app.config.js             # Dynamic Expo config: spreads app.json and adds plugins needing env values (Mapbox download token)
  .env / .env.example        # Expo env vars; only EXPO_PUBLIC_* reach the app bundle
```

Rules:
- **Screens vs. components**: a file under `app/` composes screens from components; the actual UI building blocks (buttons, cards, lists) live under `components/` and get imported in. Don't write a 300-line screen file — break it up.
- **No inline API calls scattered across components.** Backend calls go through a thin client layer (`lib/api.ts` or per-resource files), not `fetch()` calls pasted directly into component bodies.
- **Platform-specific files** use the existing `.web.tsx` convention (Expo/Metro resolves `Component.web.tsx` vs `Component.tsx` automatically) — don't branch on `Platform.OS` inside a single file if a clean platform-split file is possible.
- **Styling**: `StyleSheet.create` per-component at the bottom of the file (matches current codebase pattern), not global stylesheets, not inline style objects for anything beyond a one-off.

### Root

```
/
  frontend/               # Expo app (above)
  backend/                # FastAPI app (above)
  .env                    # Real secrets, gitignored, never committed
  .env.example             # Placeholder keys, committed, kept in sync with actual required vars
  SETUP.md                 # Full environment setup, copy-paste commands
  ngrok_setup.md             # Tunnel setup + troubleshooting
  AGENT_README.md            # This file
```

---

## 4. When you change something structural

If you add a new top-level folder (e.g. `backend/services/`, `frontend/src/lib/`), add a new external dependency, change how the app is run, or change the file-structure rules above — update section 3 of this file in the same change. If you finish a real feature (not scaffolding), update section 1's "current state" summary so the next agent (human or AI) doesn't have to re-derive it from git log.
