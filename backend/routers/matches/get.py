from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.core.match_helpers import fetch_match_tasks
from backend.db.supabase import get_db
from backend.schemas.match import MatchState

router = APIRouter()


@router.get("/{match_id}", response_model=MatchState)
def get_match_state(match_id: str, db: Client = Depends(get_db)):  # noqa: B008
    """Full room state in one call: the match row, both players (score/ready/
    location), and the current active tasks. Used for the initial room load
    and as a polling fallback alongside Realtime.
    """
    match = db.table("matches").select("*").eq("id", match_id).single().execute().data
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    players = db.table("match_players").select("*").eq("match_id", match_id).execute().data
    tasks = fetch_match_tasks(db, match_id, status="active")

    return {"match": match, "players": players, "tasks": tasks}
