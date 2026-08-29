from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve to backend/.env by file location, not by whatever the process's
# cwd happens to be - a relative ".env" here silently loaded the *repo
# root* .env instead of backend/.env whenever uvicorn was started from the
# repo root (needed for the `backend.main:app` import to resolve), so key
# changes to backend/.env had no effect.
_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    gemini_key: str

    model_config = SettingsConfigDict(env_file=_ENV_FILE, extra="ignore")


settings = Settings()
