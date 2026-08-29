from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.db.supabase import get_db

router = APIRouter()


@router.get("/")
def list_tasks(db: Client = Depends(get_db)):  # noqa: B008
    """All available tasks (easy/medium/hard photo challenges)."""
    try:
        response = db.table("tasks").select("*").execute()
        return response.data
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/{task_id}/grab")
def grab_task(task_id: str, player_id: str, db: Client = Depends(get_db)):  # noqa: B008
    """Assign a task to a player (creates a player_tasks row)."""
    try:
        response = (
            db.table("player_tasks")
            .insert({"player_id": player_id, "task_id": task_id})
            .execute()
        )
        return response.data
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(e)) from e
