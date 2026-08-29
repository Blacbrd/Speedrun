from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from supabase import Client

from backend.core.gemini_verify import get_verdict, retry_message, upload_task_photo
from backend.core.mock_data import mock_task_by_id, mock_upsert_player_task
from backend.core.network import is_supabase_network_error
from backend.db.supabase import get_db
from backend.schemas.verification import TaskVerification

router = APIRouter()


@router.post("/verify", response_model=TaskVerification)
async def verify_task_photo(
    task_id: str = Form(...),
    player_id: str | None = Form(None),
    run_id: str | None = Form(None),
    file: UploadFile = File(...),
    db: Client = Depends(get_db),  # noqa: B008
):
    """Submit a photo for a task; Gemini decides accept/deny.

    Uploads the photo to the `task-photos` storage bucket (one file per
    attempt, named by a fresh id), asks Gemini for a strict
    {response: true/false} verdict, and (if `player_id`+`run_id` are given)
    upserts the matching player_tasks row - keyed per run, so retrying a
    task across different runs keeps each attempt's own photo and result.
    """
    try:
        task_resp = db.table("tasks").select("*").eq("id", task_id).single().execute()
        task = task_resp.data
    except Exception as e:  # noqa: BLE001
        if not is_supabase_network_error(e):
            raise HTTPException(status_code=500, detail=str(e)) from e
        task = mock_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    mime_type = file.content_type or "image/jpeg"
    photo_url = upload_task_photo(db, player_id or "anon", task_id, image_bytes, mime_type)
    verdict = get_verdict(image_bytes, mime_type, task["title"], task["description"])

    if player_id and run_id:
        status = "verified" if verdict.response else "rejected"
        try:
            row = {
                "player_id": player_id,
                "task_id": task_id,
                "run_id": run_id,
                "status": status,
                "photo_url": photo_url,
            }
            if verdict.response:
                row["completed_at"] = datetime.now(UTC).isoformat()
            db.table("player_tasks").upsert(row, on_conflict="run_id,task_id").execute()
        except Exception as e:  # noqa: BLE001
            if not is_supabase_network_error(e):
                raise HTTPException(status_code=500, detail=str(e)) from e
            mock_upsert_player_task(player_id, task_id, run_id, status, photo_url)

    message = "Nice! Task complete." if verdict.response else retry_message()
    return TaskVerification(response=verdict.response, message=message, photo_url=photo_url)
