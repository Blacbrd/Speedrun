# Project setup — copy/paste guide

Get the repo running exactly like the original dev's machine (Windows, iOS via Expo Go, no Xcode). Follow top to bottom.

## 1. Prerequisites

Install these first if you don't have them:

- **Git**
- **Node.js** (tested on v24.8.0, npm 11.6.0) — https://nodejs.org
- **Python 3.13+** — https://www.python.org/downloads/
- **uv** (Python package manager) — https://docs.astral.sh/uv/getting-started/installation/
  ```
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
- **Expo Go** app on your iPhone (App Store)

## 2. Clone the repo

```
git clone <repo-url>
cd Speedrun
```

## 3. Environment variables

Copy the example and fill in real values (get the actual keys from the project owner — do NOT commit `.env`, it's gitignored on purpose):

```
copy .env.example .env
copy .env backend\.env
```

`.env` needs at minimum:

```
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your-service-role-key-here"
GEMINI_KEY="your-gemini-key"
```

## 4. Backend setup (FastAPI + Supabase)

```
cd backend
uv sync
```

Run it:

```
uv run uvicorn backend.main:app --app-dir .. --reload --port 8000
```

Should print `Uvicorn running on http://127.0.0.1:8000` and `Application startup complete`. Test with `curl http://localhost:8000/` — expect `{"status":"healthy",...}`.

Stop: `Ctrl+C`.

## 5. Frontend setup (Expo / React Native)

```
cd frontend
npm install
```

**Windows-only fix** (if you see `Cannot find module '../lightningcss.win32-x64-msvc.node'` when bundling):

```
npm install lightningcss-win32-x64-msvc@1.33.0 --no-save
```

Then pin correct dependency versions for this Expo SDK:

```
npx expo install --fix
```

## 6. Run the app on your iPhone

Since you likely won't be on the same Wi-Fi as your dev machine, use tunnel mode:

```
npx expo start --tunnel
```

Wait for `Tunnel connected.` / `Tunnel ready.`, then either:
- scan the QR code shown in the terminal with your iPhone camera (opens in Expo Go), or
- open Expo Go, tap "Enter URL manually", paste the `exp://xxxxx.exp.direct` URL shown in the terminal.

**Stop**: `Ctrl+C` in that terminal.

**Restart**: re-run `npx expo start --tunnel` from `frontend/`. The tunnel URL is random each run — re-scan/re-paste it.

If port 8081 is stuck from a previous run:
```
netstat -ano | findstr :8081
taskkill /PID <pid> /F
```

If `expo start --tunnel` crashes immediately with an `adb` / `emulator-XXXX` error (only happens if Android Studio/SDK is installed on your machine — this project doesn't use Android at all, Expo just checks for it during tunnel startup):
```
adb kill-server
npx expo start --tunnel
```

Full tunnel/ngrok details and troubleshooting: see `ngrok_setup.md`.

## Summary — commands only, in order

```
git clone <repo-url>
cd Speedrun
copy .env.example .env
copy .env backend\.env
REM (edit .env with real keys)

cd backend
uv sync
uv run uvicorn backend.main:app --app-dir .. --reload --port 8000
REM (leave running in its own terminal)

cd ..\frontend
npm install
npx expo install --fix
npx expo start --tunnel
REM scan QR / paste exp:// URL into Expo Go
```
