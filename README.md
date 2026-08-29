# Speedrun

Hackathon project: FastAPI backend + Expo Router (React Native) frontend, Supabase for auth/DB, Gemini for AI.

## For your friend: quick connect

Full step-by-step build/run instructions: **[SETUP.md](SETUP.md)**. This section is just the links + accounts needed.

### Repo access
- GitHub repo: ask the owner to add you as a collaborator, or fork it.

### Supabase (DB / auth)
- Dashboard: https://supabase.com/dashboard/project/xyzvcolgictatcygwzhx
- Project URL: `https://xyzvcolgictatcygwzhx.supabase.co`
- Anon/public key (safe to share, read-only-ish client key):
  `sb_publishable_wq_5cBCjAGJq2ThENekGyg_0_nkT7dw`
- To get **write/admin** access (service role key, table editor, etc.) ask the project owner to invite you as a member on the Supabase dashboard (Project Settings → Team) — that key is NOT in this doc, it's secret.

### Other keys needed (ask owner, don't commit)
- `GEMINI_KEY` — Google Gemini API key
- `TAVILY_KEY` — Tavily API key
- Owner sends these privately; put them in your local `.env` (see SETUP.md step 3). Never commit `.env`.

### Tools to install
- Git
- Node.js — https://nodejs.org
- Python 3.13+ — https://www.python.org/downloads/
- uv (Python package manager) — https://docs.astral.sh/uv/getting-started/installation/
- Expo Go (iPhone) — App Store: https://apps.apple.com/app/expo-go/id982107779

### Docs in this repo
- [SETUP.md](SETUP.md) — full environment setup, copy-paste commands
- [ngrok_setup.md](ngrok_setup.md) — phone tunnel setup + troubleshooting
- [AGENT_README.md](AGENT_README.md) — architecture/conventions (for AI agents, but useful context for humans too)
