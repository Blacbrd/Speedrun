import random

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.db.supabase import get_db

router = APIRouter()

DEFAULT_RUN_TASK_COUNT = 5


@router.get("/")
def list_tasks(db: Client = Depends(get_db)):  # noqa: B008
    """All available tasks (easy/medium/hard photo challenges)."""
    try:
        response = db.table("tasks").select("*").execute()
        return response.data
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/random")
def random_tasks(
    player_id: str | None = None,
    count: int = DEFAULT_RUN_TASK_COUNT,
    db: Client = Depends(get_db),  # noqa: B008
):
    """A fresh random draw of tasks for a run - the 'regenerate' button.

    Excludes tasks the player has already verified, so regenerating doesn't
    keep handing back completed ones.
    """
    try:
        all_tasks = db.table("tasks").select("*").execute().data

        if player_id:
            done = (
                db.table("player_tasks")
                .select("task_id")
                .eq("player_id", player_id)
                .eq("status", "verified")
                .execute()
                .data
            )
            done_ids = {row["task_id"] for row in done}
            all_tasks = [t for t in all_tasks if t["id"] not in done_ids]

        return random.sample(all_tasks, k=min(count, len(all_tasks)))
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
