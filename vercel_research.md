# Can Speedrun use Vercel for free, to avoid tunnels?

Short answer: **partially**. Vercel's free (Hobby) tier can permanently host the FastAPI backend and can host an Expo **web** export — both remove the need for the backend ngrok tunnel. It does **not** remove the need for a tunnel/LAN when testing the actual native app in Expo Go on a phone; that's a different distribution mechanism entirely.

## 1. FastAPI backend on Vercel Hobby

Works, with limits to check against `/api/gemini/verify`:

- **Runtime**: Vercel has an official Python/FastAPI runtime preset (ASGI) — each route becomes a serverless function.
- **Execution time**: 10s default on Hobby, configurable up to 60s; up to 300s with Fluid Compute (free, opt-in). Plenty for a Gemini call.
- **Body size limit — the real gotcha**: Vercel Functions cap request/response bodies at **4.5 MB**. A full-res iPhone photo upload to `/api/gemini/verify` will often exceed this → `413`. Fix: compress/resize client-side (`expo-image-manipulator`) before upload, or upload straight to Supabase Storage and pass Gemini a URL instead of raw bytes through the function.
- **WebSockets**: not something this app needs (plain REST), so not a blocker.
- **State**: none needed locally — Supabase already holds it.

**Verdict**: good fit once photo uploads are compressed/resized client-side.

## 2. Expo/React Native frontend on Vercel

Important distinction: **a Vercel-hosted Expo web export is a website, not the iOS app running in Expo Go.**

- `npx expo export --platform web` produces a static/SSR build deployable to Vercel free, via Expo's own Vercel adapter preset.
- Breaks on web without fallbacks:
  - `react-native-maps` — no web implementation.
  - `expo-secure-store` — no web implementation at all (needs `localStorage` fallback via `Platform.OS === 'web'`).
  - `expo-location` — foreground-only on web, no background tracking.
  - Camera capture — falls back to `<input type="file" capture>`, different UX than native camera.
- Useful as a secondary surface (e.g. leaderboard/results page), not a substitute for the native scavenger-hunt app.

## 3. Does this kill the tunnel need?

| Piece | Vercel helps? |
|---|---|
| Backend (FastAPI) | **Yes** — deploy once, get a permanent `https://…vercel.app` URL, no more backend ngrok tunnel. |
| Native app in Expo Go | **No** — Expo Go loads a real RN JS bundle over the Metro dev-server protocol, not a webpage. Hosting a website on Vercel doesn't feed Expo Go a bundle. |

For the native app, the real options are:
- Same LAN/Wi-Fi (`npx expo start --lan`) — free, fragile on hackathon/venue Wi-Fi.
- **EAS Build** (free tier: 15 iOS + 15 Android builds/month) → install via TestFlight/ad-hoc → zero tunnel needed at all, but needs lead time before a demo.
- A persistent tunnel that isn't ngrok's flaky free tier: **Cloudflare Tunnel** (what we switched Speedrun to) or **Tailscale Funnel** — free, more stable hostname behavior than ngrok's 2026 free tier (2-hour sessions, 1GB/month, random URLs, one simultaneous tunnel per account).

## 4. Concrete free-tier plan for Speedrun

1. **Backend → Vercel Hobby.** Compress photos client-side before `/api/gemini/verify`, or upload to Supabase Storage and pass Gemini a URL. Set `maxDuration`/enable Fluid Compute for the Gemini round-trip.
2. **Phone demo → EAS Build (best) or Cloudflare Tunnel (fastest today).** We're currently on Cloudflare Tunnel for Metro since it's a same-day fix; EAS Build is the better long-term answer once there's lead time before a demo.
3. **Optional**: `expo export --platform web` + a second Vercel project for a browser-facing leaderboard page. Nice-to-have, not required.

## 5. Free-tier limits worth knowing

- **Vercel Hobby**: 100GB bandwidth/mo, 100K invocations, 10s default / 60s max function timeout (300s w/ Fluid Compute), 4.5MB body cap, **no commercial use** in the ToS (fine for a hackathon demo).
- **EAS free tier**: 15 iOS + 15 Android builds/month, EAS Update to 1,000 MAU. JS-only changes can ship via EAS Update without burning a build.
- **Supabase free tier**: unaffected by this decision — it's the same hosted Postgres/auth/storage either way. Watch its own caps (500MB DB, project pause after 1 week idle).
- **ngrok free tier**: 2-hour sessions, 1GB/month, random URLs, **one simultaneous tunnel per account** — this is exactly why the multi-tunnel setup (backend + Metro at once) failed and we split Metro off onto Cloudflare Tunnel instead.

## Recommendation

- Move the FastAPI backend to Vercel Hobby now — clear win, free, permanent URL. Add client-side photo compression first to respect the 4.5MB body cap.
- Don't expect Vercel to solve the phone-demo problem — use EAS Build (best UX, no live tunnel) when there's lead time, Cloudflare Tunnel + Expo Go when there isn't.
- Treat a Vercel-hosted Expo web export as a bonus artifact, not a replacement for the real app.

### Sources
- https://vercel.com/docs/frameworks/backend/fastapi
- https://vercel.com/docs/functions/runtimes/python
- https://vercel.com/docs/functions/limitations
- https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions
- https://vercel.com/docs/functions/configuring-functions/duration
- https://vercel.com/changelog/vercel-functions-for-hobby-can-now-run-up-to-60-seconds
- https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections
- https://docs.expo.dev/router/web/static-rendering/
- https://docs.expo.dev/guides/publishing-websites/
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://docs.expo.dev/build-reference/limitations/
- https://docs.expo.dev/billing/plans/
- https://insights.nomadlab.cc/blog/2026/04/tailscale-vs-cloudflare-tunnel-vs-ngrok-2026
- https://deploywise.dev/blog/vercel-free-tier-limits-2026

### Open questions
- Actual photo size out of the camera flow (determines if client-side compression alone is enough, or a direct-to-storage upload path is needed).
- Whether the hackathon demo has lead time for an EAS Build/TestFlight install, or needs to stay same-day Expo Go + tunnel.
