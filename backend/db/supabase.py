from supabase import Client, create_client

from backend.core.config import settings

# Initialize the client once globally
supabase_client: Client = create_client(settings.supabase_url, settings.supabase_key)


def get_db() -> Client:
    """Dependency to inject the Supabase client into routes."""
    return supabase_client
