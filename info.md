# Speedrun — current state

Strava-style photo scavenger hunt. Player signs in, starts a timed run, gets a list of photo tasks ("take a picture of a red car"), Gemini judges each submitted photo accept/deny.

## What works right now

- **Auth**: email/password via Supabase Auth. Signup auto-confirms (no email step) and logs in immediately.
- **Data**: `players`, `runs`, `tasks` (50 seeded, easy/medium/hard), `player_tasks` (one row per photo attempt, kept per-run so retries don't overwrite history).
- **Photos**: uploaded to a Supabase Storage bucket (`task-photos`), one file per attempt.
- **Gemini verify**: strict accept/deny judge (`gemini-2.5-flash`) on the submitted photo vs. the task description, with a friendly retry message on reject.
- **Supabase-down fallback**: if Supabase itself is unreachable (not a normal error — real network failure), the backend transparently serves mock player/tasks/runs data instead, so Gemini/Mapbox testing isn't blocked by a Supabase outage.
- **Frontend flow** (Expo, one merged build from both agents' work): sign-in/sign-up → home (circular "Run!" button) → mode select (singleplayer/multiplayer, multiplayer disabled) → singleplayer setup (live map + task list + Regenerate + Start run!) → run screen (count-up timer, live map, task overlay) → camera (take photo → Gemini verdict → back to run screen).
- **Map**: Mapbox via a WebView (works in plain Expo Go). A native Mapbox path exists in the code but isn't wired up yet — it needs a custom dev client/EAS build to work, which isn't set up.

## Known gaps / not built yet

- Multiplayer is a disabled placeholder button, no logic behind it.
- Friendship table exists in the schema but has no endpoints/UI yet.
- No leaderboard or run-history screen (the data — `runs`, `player_tasks` with photos — is all there, just not surfaced in the app).
- Native Mapbox map not wired up (see above) — WebView map is what's actually running.

## Running it

- Backend: FastAPI (`backend/`), Supabase for DB/auth/storage, Gemini for verification. See `SETUP.md`.
- Frontend: Expo Router app (`frontend/`), tested via Expo Go over a tunnel (ngrok for the backend, Cloudflare Tunnel for Metro — see `ngrok_setup.md`).
- Full architecture, schema, and endpoint reference: `AGENT_README.md` (kept current, read this for anything more detailed than this file).
