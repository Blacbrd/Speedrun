# ngrok / Expo tunnel setup

How to expose the Expo dev server (Metro, port 8081) to the internet so Expo Go on iPhone can connect without being on the same network.

This uses Expo's built-in `--tunnel` flag, which wraps ngrok automatically (`@expo/ngrok` package) — you do not need a separate ngrok account or `ngrok.exe` on PATH for this to work, though having ngrok installed doesn't hurt.

## Install

From `frontend/`:

```
npm install
```

Expo installs `@expo/ngrok` on first `--tunnel` run automatically if missing. If it prompts, say yes.

(Optional, not required) standalone ngrok binary, if you ever want to tunnel something outside Expo:

```
winget install ngrok.ngrok
```

or download from https://ngrok.com/download and put `ngrok.exe` on PATH.

## Start

```
cd frontend
npx expo start --tunnel
```

Wait for:

```
Tunnel connected.
Tunnel ready.
```

Terminal prints a QR code and a URL like:

```
exp://xxxxxxx-anonymous-8081.exp.direct
```

Scan QR in Expo Go, or in Expo Go tap "Enter URL manually" and paste the `exp://...` URL.

## Stop

If running in the foreground (you see the terminal with logs): `Ctrl+C`.

If it's running in the background / you lost the terminal, kill by port:

```
netstat -ano | findstr :8081
taskkill /PID <pid> /F
```

## Restart

Same as Start — just re-run `npx expo start --tunnel` from `frontend/`. Note: the tunnel URL changes every time you restart (random subdomain), so re-scan the QR / re-paste the URL each time.

## Known issues

- ngrok's free tier is bandwidth-capped (~1MB/s) — first bundle load can be slow over a shaky connection.
- Occasionally gives `"Tunnel connection has been closed"` or times out connecting — usually a transient ngrok infra issue, just re-run.
- If it repeatedly fails, fallback is Cloudflare Tunnel (`cloudflared tunnel --url http://localhost:8081`, needs `winget install --id Cloudflare.cloudflared`), gave more reliable results in testing than ngrok for this same setup.

### `adb` error kills the tunnel before it starts

Symptom — `expo start --tunnel` crashes immediately with:

```
Error: could not connect to TCP port 5562: cannot connect to 127.0.0.1:5562: ...
Error: ...adb -s emulator-5562 emu avd name exited with non-zero code: 1
    at ... AsyncNgrok.startAsync ...
```

This is nothing to do with ngrok itself. This project is iOS-only, but Expo CLI's tunnel startup unconditionally checks for a connected Android device/emulator (`adb`) as part of bringing the tunnel up. If Android Studio / platform-tools is installed on the machine and `adb` has a stale/dead emulator entry cached (e.g. `emulator-5562` from some past session that no longer exists), that check throws and kills the whole `--tunnel` startup — even though you're not targeting Android at all.

**Fix** — reset adb's device list, then retry:

```
adb kill-server
npx expo start --tunnel
```

If `adb` isn't on PATH, use the full path (adjust if your SDK lives elsewhere):

```
"C:\Users\<you>\AppData\Local\Android\Sdk\platform-tools\adb.exe" kill-server
```

If `adb` isn't installed at all (no Android Studio/SDK on the machine), this error won't happen in the first place — the check is skipped.
