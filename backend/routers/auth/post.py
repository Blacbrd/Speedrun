from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.core.mock_data import MOCK_PLAYER_ID
from backend.core.network import is_supabase_network_error
from backend.db.supabase import get_db
from backend.schemas.player import PlayerCreate, PlayerLogin

router = APIRouter()

MOCK_AUTH_RESPONSE = {
    "user_id": MOCK_PLAYER_ID,
    "access_token": "mock-access-token",
    "refresh_token": "mock-refresh-token",
}


@router.post("/signup")
def signup(payload: PlayerCreate, db: Client = Depends(get_db)):  # noqa: B008
    """Create a Supabase Auth user. The `on_auth_user_created` trigger inserts
    the matching public.players row (id, email) automatically.

    The project has email confirmation on, which would otherwise leave a new
    signup unable to log in until they click a confirmation email - not
    something we want for a hackathon demo. The backend now holds the
    service-role key, so it creates the user via the admin API with
    email_confirm=True directly (unlike auth.sign_up, this never sends a
    confirmation email at all, so it doesn't burn Supabase's per-project
    email rate limit either) and signs the player in immediately.

    Falls back to a fixed mock player if Supabase is unreachable - our
    endpoints only ever take player_id as a plain value, never verify the
    token server-side, so this is enough to keep testing tasks/runs/gemini
    flows during an outage.
    """
    try:
        created = db.auth.admin.create_user(
            {
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
            }
        )
    except Exception as e:  # noqa: BLE001
        if is_supabase_network_error(e):
            return MOCK_AUTH_RESPONSE
        raise HTTPException(status_code=400, detail=str(e)) from e

    if not created.user:
        raise HTTPException(status_code=400, detail="Signup did not return a user")

    if payload.username:
        db.table("players").update({"username": payload.username}).eq(
            "id", created.user.id
        ).execute()

    session = db.auth.sign_in_with_password(
        {"email": payload.email, "password": payload.password}
    )

    return {
        "user_id": created.user.id,
        "access_token": session.session.access_token if session.session else None,
        "refresh_token": session.session.refresh_token if session.session else None,
    }


@router.post("/login")
def login(payload: PlayerLogin, db: Client = Depends(get_db)):  # noqa: B008
    """Falls back to the same fixed mock player as /signup if Supabase is
    unreachable."""
    try:
        result = db.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as e:  # noqa: BLE001
        if is_supabase_network_error(e):
            return MOCK_AUTH_RESPONSE
        raise HTTPException(status_code=401, detail=str(e)) from e

    return {
        "user_id": result.user.id if result.user else None,
        "access_token": result.session.access_token if result.session else None,
        "refresh_token": result.session.refresh_token if result.session else None,
    }
