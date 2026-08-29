from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.db.supabase import get_db
from backend.schemas.player import PlayerCreate, PlayerLogin

router = APIRouter()


@router.post("/signup")
def signup(payload: PlayerCreate, db: Client = Depends(get_db)):  # noqa: B008
    """Create a Supabase Auth user. The `on_auth_user_created` trigger inserts
    the matching public.players row (id, email) automatically.
    """
    try:
        result = db.auth.sign_up(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(e)) from e

    if payload.username and result.user:
        db.table("players").update({"username": payload.username}).eq(
            "id", result.user.id
        ).execute()

    return {
        "user_id": result.user.id if result.user else None,
        "session": result.session,
    }


@router.post("/login")
def login(payload: PlayerLogin, db: Client = Depends(get_db)):  # noqa: B008
    try:
        result = db.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=401, detail=str(e)) from e

    return {
        "user_id": result.user.id if result.user else None,
        "access_token": result.session.access_token if result.session else None,
        "refresh_token": result.session.refresh_token if result.session else None,
    }
