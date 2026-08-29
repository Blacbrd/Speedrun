# AGENT_README.md

Context file for any AI agent (Claude Code, Devin, or otherwise) working on this repo. Read this before making changes. Keep it current — if you change the architecture, folder layout, or stack, update this file in the same session.

This is a hackathon project built while mobile (phone-only testing, no laptop access during demo windows), so state drifts fast. Treat this file as the single source of truth for "what's actually true right now," not the commit history.

---

## 1. Current state (as of last update)

Speedrun is a Strava-style **photo scavenger hunt**: a player starts a timed "run," gets a list of photo tasks ("take a picture of a red car"), and Gemini judges each submitted photo accept/deny. Singleplayer is the current focus; multiplayer is a placeholder button, not built.

### Data model (Supabase - all live, see `backend/db/seed_tasks.sql` for the migration history)

- `players` — id (= `auth.users.id`), email, username, score. Auto-created by a DB trigger on Supabase Auth signup.
- `runs` — one timed play session: player_id, mode (`singleplayer`/`multiplayer`), started_at, ended_at, duration_seconds, tasks_completed, score.
- `tasks` — the photo challenges: title, description ("Take a photo of ..."), difficulty (easy/medium/hard), score. 50 seeded.
- `player_tasks` — one row per **attempt**, keyed by `(run_id, task_id)` (not `(player_id, task_id)` — the same task can be re-attempted in a different run and each attempt keeps its own photo/result). Columns: player_id, task_id, run_id, status (assigned/submitted/verified/rejected), photo_url, completed_at. The photo's id is this row's `id`.
- Storage bucket `task-photos` (public) — one file per attempt, path `{player_id}/{task_id}-{uuid}.{ext}`.

Pydantic mirrors: `backend/schemas/{player,run,task,friendship,verification}.py`.

`backend/.env`'s `SUPABASE_KEY` is now the real service-role key (was briefly the anon/publishable key by mistake — fixed). RLS policies are back to strict `auth.uid()`-scoped ones on `player_tasks`, `runs`, and the `task-photos` bucket; the service-role backend bypasses them as intended and does its own `player_id`/`run_id` scoping in code. If you ever hit an RLS error on a backend write that looks correct, don't loosen policies to fix it — that almost certainly means the wrong key is loaded again; check `backend/.env` and ask before changing any RLS policy.

**Signup**: confirm-email is off in the Supabase project. `/api/auth/signup` uses `auth.admin.create_user(email_confirm=True)` (not `auth.sign_up`, which still sends a confirmation email even when you don't need it and burns Supabase's built-in email rate limit — hit this the hard way) and returns a real session immediately, same shape as `/login`.

**`backend/core/config.py`**: reads `.env` by resolving `Path(__file__).parent.parent / ".env"`, not a bare relative `".env"` — a relative path there depends on the process's cwd, which silently loaded the *repo-root* `.env` instead of `backend/.env` whenever uvicorn is started from the repo root (needed for the `backend.main:app` import to resolve). If a `.env` change seems to have no effect, check this hasn't regressed.

**Never call `auth.sign_in_with_password` (or anything else that sets a session) on `db`/`get_db()`'s client.** That client is a single shared global instance (`backend/db/supabase.py`) used by every route for the life of the process. supabase-py stores whatever session you sign in with directly on the client instance and starts sending that user's JWT instead of the service-role key on every subsequent call *from that same client* — so signing in on the shared client means the next request from any other player silently runs as whichever user logged in last, and RLS rejects any write that isn't theirs. This was a real, already-shipped bug (intermittent "new row violates row-level security policy" on `runs`/`player_tasks`, looked like a policy problem, wasn't). Fix/pattern: use `new_auth_client()` (also in `backend/db/supabase.py`) — a fresh disposable client — for `sign_in_with_password`/`sign_up`; `auth.admin.*` calls (e.g. `create_user`) are fine on the shared client, they don't touch its session. Follow this pattern for any new auth-adjacent endpoint.

**Supabase-down fallback**: `backend/core/network.py` (`is_supabase_network_error`) + `backend/core/mock_data.py`. Auth, `GET /api/tasks/random`, `POST /api/runs/start`, `POST /api/runs/{id}/finish`, and `POST /api/gemini/verify` each catch a genuine Supabase *network* failure (connection/timeout) and transparently serve mock data instead (a fixed dummy player `00000000-0000-0000-0000-000000000001`, 5 mock tasks, in-memory mock runs/player_tasks) — a normal API error (RLS, validation, 404) still fails normally, only real unreachability falls back. This keeps Gemini/Mapbox testable during a Supabase outage without burning any real API limits. If you add a new Supabase-backed endpoint, follow the same pattern: catch the specific exception, check `is_supabase_network_error`, fall back to mock data only on that.

### Backend endpoints (FastAPI, all under `/api`)

- `POST /api/auth/signup`, `POST /api/auth/login` — Supabase Auth, email/password.
- `GET /api/tasks/` — all tasks. `GET /api/tasks/random?player_id=&count=5` — a fresh random draw excluding tasks that player has already verified (the "regenerate" button). `POST /api/tasks/{id}/grab` — assign a task (legacy, may not be needed once runs+random are used).
- `POST /api/runs/start` `{player_id, mode}` → creates a run, returns it (has `id`). Call when the player presses "Start run!".
- `POST /api/runs/{run_id}/finish` `{duration_seconds}` → stamps `ended_at`, rolls up `tasks_completed`/`score` from that run's verified `player_tasks`.
- `POST /api/gemini/verify` (multipart: `task_id`, `player_id`, `run_id`, `file`) → uploads the photo to `task-photos`, asks Gemini (`gemini-2.5-flash`) for a **strict** `{"response": true|false}` verdict (system prompt in `backend/routers/gemini/post.py`), upserts the `player_tasks` row for `(run_id, task_id)`, returns `{response: bool, message: str, photo_url: str}` — `message` is a friendly retry line on `false`, not part of Gemini's own strict output.
- `GET /api/gemini/status` — Gemini client construction check only, no API call.

### Frontend

The two parallel frontends have been reconciled on PR #2 (`devin/1788005848-frontend-auth-map`) into the single flow of section 1a; `main`'s placeholder set (`login`/`signup`/`home`/`run`/`singleplayer`, `AuthForm`/`Button`/`TextField`/`MapPanel`/`TaskList`, `theme.ts`) and PR #2's old `room.tsx` are both gone.

Current routes: `index` (session gate) → `sign-in`/`sign-up` → `home` (circular Run! pad) → `mode-select` → `singleplayer` (live map + `/api/tasks/random` + Regenerate + Start run!) → `run` (count-up timer, 80% Mapbox map, top-right task overlay, End run) → `camera` (photo → `/api/gemini/verify`, retry on `response: false`).

Supporting code: reusable UI in `components/` (kebab-case files: `auth-screen`, `auth-form`, `brand-header`, `stat-strip`, `track-backdrop`, `primary-button`, `secondary-button`, `text-field`, `run-button`, `task-list`, `task-overlay`, `live-map` + `mapbox-native-map{,.web}`/`mapbox-webview-map`); API clients per resource in `lib/` (`api.ts` transport, `auth.ts`, `tasks.ts`, `runs.ts`, `verification.ts`) with the session in `expo-secure-store` via `lib/session-store.ts`; hooks in `hooks/` (`use-session`, `use-current-location`, `use-random-tasks`, `use-photo-verification`, `use-elapsed-seconds`, and `use-active-run` — the context holding `run_id` + task list + completed ids shared between the run and camera screens).

**Mapbox**: `EXPO_PUBLIC_MAPBOX_TOKEN` is set in `frontend/.env` (gitignored, ask the human for the value, don't invent one) and the Mapbox MCP server (`mapbox-mcp`) is installed for tool access. **Stay within Mapbox's free tier** (50k free map loads/month on the pk. token used here) — this is a hackathon demo, not production traffic; don't loop map reloads, don't hit the API in a tight loop while testing, and flag it to the human before doing anything that could run up usage (e.g. automated screenshot loops hitting live tiles).

### Multiplayer (backend done, frontend not built yet - see `multiplayer.md`)

Two players compete head-to-head via `matches`/`match_players`/`match_tasks` tables + Supabase Realtime (Postgres Changes) - full endpoint reference, Realtime/RLS setup, and a two-device testing walkthrough are in `multiplayer.md`, don't duplicate that here. Two real test accounts already exist for this: `blacbrd123@gmail.com` and `aayanjatala@icloud.com`.

### 1a. Target UI flow (implemented on PR #2)

Keep PR #2's visual polish (cards/pills/palette), rebuild the page structure to this exact flow:

1. **Home** (after login): a big circle button at the bottom of the screen labeled "Run!".
2. **Mode select**: pressing the circle navigates here. Two buttons, each taking half the screen: "Singleplayer" and "Multiplayer" (multiplayer can be a disabled/placeholder for now).
3. **Singleplayer setup**: shows the player's live location on a map, and a generated task list (`GET /api/tasks/random`). A **Regenerate** button re-draws the list (calls `/api/tasks/random` again). A **Start run!** button calls `POST /api/runs/start` and navigates to the run screen with the returned `run_id` and the current task list.
4. **Run screen** (the core screen):
   - A timer counting up from 0 (like Strava), started on entry.
   - The player's live location on a map taking **80%** of the screen.
   - Top-right corner: a task overlay control. Tapping it opens an overlay listing the current run's tasks, showing which are done; tapping an unfinished task opens the camera.
   - Camera page: takes a photo, POSTs it to `/api/gemini/verify` with `task_id`, `player_id`, `run_id`. On `response: true` → mark that task done in the UI, navigate back to the run screen. On `response: false` → show the returned `message` string at the top (friendly "try again"-style copy) and let them retry.
   - Ending the run calls `POST /api/runs/{run_id}/finish` with the elapsed seconds.

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
    # existing: auth/, tasks/, runs/, gemini/, db/
  schemas/
    <feature>.py         # Pydantic request/response models, one file per feature/domain
    # existing: player.py, run.py, task.py, friendship.py, verification.py
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
    lib/ or services/      # API clients (calls to the backend), one file per backend resource/domain
  assets/
    images/                # Only assets actually referenced by app.json or code. Don't leave in unused starter images — check references before adding or keeping.
  app.json                 # Expo config — icon/splash/plugin references must stay in sync with assets/ actually present
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
