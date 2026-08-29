from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from backend.db.supabase import get_db

router = APIRouter()


@router.get("/data")
def get_data(db: Client = Depends(get_db)):  # noqa: B008
    try:
        # Example: Fetch all records from a hypothetical 'users' table
        # You can ask the Supabase MCP to create this table for you!
        response = db.table("players").select("*").execute()
        return response.data
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))
