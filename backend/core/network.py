import httpx


def is_supabase_network_error(exc: Exception) -> bool:
    """True only for genuine network unreachability (Supabase is down/unreachable),
    never for a normal API-level error (bad request, RLS, validation, 404, etc).
    Those should keep failing normally - only a real network failure should
    fall back to mock data.
    """
    return isinstance(exc, httpx.TransportError | httpx.NetworkError)
