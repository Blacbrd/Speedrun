from supabase import Client, create_client

from backend.core.config import settings

# Initialize the client once globally - this is the ONLY client any route
# should use for table/storage operations, and it must stay pristine
# (service-role, no active auth session) for the whole life of the process.
supabase_client: Client = create_client(settings.supabase_url, settings.supabase_key)


def get_db() -> Client:
    """Dependency to inject the trusted, service-role Supabase client into routes."""
    return supabase_client


def new_auth_client() -> Client:
    """A throwaway client for auth calls that mutate the client's own session
    (sign_in_with_password, sign_up).

    Never call those on `supabase_client` / `get_db()`'s client: supabase-py
    stores the resulting user session on the client instance and starts
    sending it as the postgrest Authorization header for every subsequent
    call - on a shared global client that means the *next* request from
    *any* player would silently run as whichever user last logged in,
    instead of as the trusted service role, and RLS would reject writes
    for anyone else. A fresh client per call keeps that session isolated
    and throws it away when the request ends.
    """
    return create_client(settings.supabase_url, settings.supabase_key)
