from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.db.supabase import get_db

router = APIRouter()


@router.get("/tasks")
def get_tasks(db: Client = Depends(get_db)):  # noqa: B008
    """Returns the seeded photo tasks the frontend lists in a run."""
    try:
        response = db.table("tasks").select("*").execute()
        return response.data
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))
