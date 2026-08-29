from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str

    # Tells Pydantic to read from the local .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
