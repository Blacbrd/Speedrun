from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.core.mock_data import mock_finish_run, mock_start_run
from backend.core.network import is_supabase_network_error
from backend.db.supabase import get_db
from backend.schemas.run import Run, RunFinish, RunStart

router = APIRouter()


@router.post("/start", response_model=Run)
def start_run(payload: RunStart, db: Client = Depends(get_db)):  # noqa: B008
    """Begin a timed run - call when the player presses 'Start run!'.

    Falls back to an in-memory mock run if Supabase is unreachable.
    """
    try:
        row = (
            db.table("runs")
            .insert({"player_id": str(payload.player_id), "mode": payload.mode})
            .execute()
            .data
        )
        return row[0]
    except Exception as e:  # noqa: BLE001
        if is_supabase_network_error(e):
            return mock_start_run(str(payload.player_id), payload.mode)
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/{run_id}/finish", response_model=Run)
def finish_run(run_id: str, payload: RunFinish, db: Client = Depends(get_db)):  # noqa: B008
    """Stop the timer and roll up this run's completed tasks + score.

    Falls back to the in-memory mock run store if Supabase is unreachable
    (only works if the run itself was also started while Supabase was down).
    """
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
        if is_supabase_network_error(e):
            mock_row = mock_finish_run(run_id, payload.duration_seconds)
            if mock_row is None:
                raise HTTPException(status_code=404, detail="Run not found") from e
            return mock_row
        raise HTTPException(status_code=400, detail=str(e)) from e
