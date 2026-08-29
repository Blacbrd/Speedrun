from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.db.supabase import get_db
from backend.schemas.run import Run, RunFinish, RunStart

router = APIRouter()


@router.post("/start", response_model=Run)
def start_run(payload: RunStart, db: Client = Depends(get_db)):  # noqa: B008
    """Begin a timed run - call when the player presses 'Start run!'."""
    try:
        row = (
            db.table("runs")
            .insert({"player_id": str(payload.player_id), "mode": payload.mode})
            .execute()
            .data
        )
        return row[0]
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/{run_id}/finish", response_model=Run)
def finish_run(run_id: str, payload: RunFinish, db: Client = Depends(get_db)):  # noqa: B008
    """Stop the timer and roll up this run's completed tasks + score."""
    try:
        completed = (
            db.table("player_tasks")
            .select("task_id, tasks(score)")
            .eq("run_id", run_id)
            .eq("status", "verified")
            .execute()
            .data
        )
        score = sum(row["tasks"]["score"] for row in completed if row.get("tasks"))

        row = (
            db.table("runs")
            .update(
                {
                    "ended_at": datetime.now(UTC).isoformat(),
                    "duration_seconds": payload.duration_seconds,
                    "tasks_completed": len(completed),
                    "score": score,
                }
            )
            .eq("id", run_id)
            .execute()
            .data
        )
        if not row:
            raise HTTPException(status_code=404, detail="Run not found")
        return row[0]
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(e)) from e
