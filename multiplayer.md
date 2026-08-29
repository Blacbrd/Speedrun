# Multiplayer — testing guide

Two players compete head-to-head: race to complete photo tasks within a time limit, live scoreboard, live opponent location, real-time "opponent completed a task" toasts.

## Data model (Supabase, already live)

- `matches` — `id`, `host_id`, `guest_id`, `status` (`pending` → `active` → `finished`), `time_limit_seconds`, `started_at`, `ends_at`.
- `match_players` — one row per player per match: `ready`, `score`, `latitude`/`longitude`/`location_updated_at`.
- `match_tasks` — the active/completed task pool for a match: `task_id`, `status` (`active`/`completed`), `completed_by`, `completed_at`. Exactly 5 `active` rows are kept per match at all times — completing one draws a replacement.

## Backend endpoints (`/api/matches`, FastAPI)

- `POST /invite` `{host_id, guest_id, time_limit_seconds}` → creates the match (`pending`) + both `match_players` rows.
- `POST /{match_id}/time-limit` `{seconds}` → host changes the round length before ready-up (only works while `status = pending`).
- `POST /{match_id}/ready` `{player_id}` → marks that player ready. When **both** are ready, seeds 5 active tasks and flips the match to `active`, stamping `started_at`/`ends_at` (`now + time_limit_seconds`) — **both clients must compute their countdown from `ends_at`**, not a local timer, so they can't drift apart.
- `GET /{match_id}` → full room state in one call: match + both players + active tasks. Use for the initial load and as a polling fallback if a Realtime event is ever missed.
- `POST /{match_id}/location` `{player_id, latitude, longitude}` → call every few seconds during an active match.
- `POST /{match_id}/verify` (multipart: `task_id`, `player_id`, `file`) → same Gemini judge as singleplayer. On `response: true`: marks that `match_tasks` row completed, adds the task's score to that player's `match_players.score`, and draws one replacement task. Returns `{response, message, photo_url, score, new_task}`.

None of this needs a websocket server of our own — Realtime does that part.

## Configuring Supabase Realtime

Already done by migration (`add_multiplayer_matches_schema`), for reference if you need to redo it:

```sql
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.match_players;
alter publication supabase_realtime add table public.match_tasks;
```

RLS: all three tables restrict `select` to match participants (`auth.uid() in (host_id, guest_id)`, or joined through `matches` for `match_players`/`match_tasks`). Writes go through the backend (service role) — see `AGENT_README.md`'s note on RLS.

**Frontend must hold a real Supabase session for Realtime + RLS to work.** `/api/auth/login` and `/api/auth/signup` already return real Supabase `access_token`/`refresh_token`. On the client, create a Supabase JS client with the **anon/publishable** key (never the secret key) and call:

```ts
supabase.auth.setSession({ access_token, refresh_token });
```

right after login/signup. That makes `auth.uid()` resolve correctly for Realtime's RLS checks, and lets you subscribe like this:

```ts
supabase
  .channel(`match-${matchId}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, handleMatchChange)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'match_players', filter: `match_id=eq.${matchId}` }, handlePlayerChange)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'match_tasks', filter: `match_id=eq.${matchId}` }, handleTaskChange)
  .subscribe();
```

For the **invite ping** specifically, the invitee doesn't know the `match_id` yet — subscribe on app-level state (e.g. home screen) to:

```ts
supabase
  .channel('invites')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches', filter: `guest_id=eq.${myPlayerId}` }, handleInvite)
  .subscribe();
```

`handleInvite` gets the new `matches` row (with its `id`) and routes to the Room screen.

## Testing locally with two devices/simulators

1. Both devices need the same backend tunnel URL in `frontend/.env` (`EXPO_PUBLIC_API_URL`) — one shared backend, not two.
2. Sign in as two **different** real accounts, one per device (see `AGENT_README.md` for the two test accounts already in the DB — swap in real emails for anything beyond a demo).
3. On device A (host): tap Multiplayer → pick device B's account from the friend list → this calls `POST /invite`.
4. Device B should receive the invite via its `invites` Realtime subscription (INSERT event, no polling) and route to the Room screen. If it doesn't fire within a couple seconds, fall back to `GET /api/matches/{id}` on a timer as a sanity check — if that shows the row but Realtime didn't fire, the client's Supabase session (`setSession`) or the publication/RLS setup is the thing to check, not the invite logic itself.
5. Host picks a time limit (`POST /time-limit`), both tap Ready (`POST /ready`) — confirm the match flips to `active` and both screens see 5 tasks appear at (roughly) the same moment.
6. On one device, complete a task (camera → `POST /{match_id}/verify` with `response: true`). Confirm: (a) that device's own task list drops to 4 then back to 5 with the replacement, (b) the *other* device sees the same task-list change and a toast, via its `match_tasks` subscription, (c) both scoreboards update via the `match_players` subscription.
7. Move one device's location (or fake it via the simulator's location menu) and confirm the other device's opponent-location marker updates within a few seconds.
8. Let the timer hit 0 (or shorten `time_limit_seconds` for testing) and confirm the game-over state — this hackathon pass doesn't include a dedicated `finished`-transition endpoint yet; the frontend can locally treat `now >= ends_at` as the end condition and show final scores from the last `match_players` state it has.

## Known gaps (by design, this pass)

- No dedicated "finish match" endpoint — end-of-game is detected client-side from `ends_at`. Add `POST /{match_id}/finish` if you need a server-authoritative final score/history record.
- Host's time-limit pick isn't enforced server-side beyond "only while pending" — nothing stops the guest from also calling `/time-limit`.
- No reconnect/resume handling if a player's app backgrounds mid-match — `GET /{match_id}` gives you a fresh snapshot to rehydrate from, but nothing automatic.
- No power-ups (explicitly out of scope for this pass, per the spec).
