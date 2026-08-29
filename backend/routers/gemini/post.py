import random
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from google import genai
from google.genai import types
from supabase import Client

from backend.core.config import settings
from backend.core.mock_data import mock_task_by_id, mock_upsert_player_task
from backend.core.network import is_supabase_network_error
from backend.db.supabase import get_db
from backend.schemas.verification import GeminiVerdict, TaskVerification

router = APIRouter()

# Small, fast, vision-capable model - free-tier friendly, cheap enough for a
# per-submission check.
VERIFY_MODEL = "gemini-2.5-flash"

BUCKET = "task-photos"

MIME_TO_EXT = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/webp": "webp",
}

SYSTEM_PROMPT = """You are the photo referee for Speedrun, a photo scavenger \
hunt game. Each round a player is given a short task describing something to \
photograph (e.g. "take a picture of a red car"). You will be shown the task \
text and the photo the player just submitted as proof.

Decide whether the photo genuinely and unambiguously shows the subject the \
task asks for. Be strict:
- Reject photos of the wrong subject, even if related or similar.
- Reject photos where the subject is not clearly visible (too blurry, too \
dark, too far away, cropped out).
- Reject attempts to cheat: photos of a screen/monitor showing the subject, \
drawings, printed pictures, or stock-photo-looking images.
- Accept only real, clear, in-person photographic evidence of the task's \
actual subject.

Respond with ONLY valid JSON of exactly this shape, no other text, keys, or \
explanation: {"response": true} or {"response": false}."""

# Shown to the player on a rejected submission - kept separate from Gemini's
# own strict {response: bool} output so the model's contract stays minimal.
RETRY_MESSAGES = [
    "Not quite - give it another shot!",
    "Close, but no match yet. Try again!",
    "Hmm, that doesn't look like it. One more try!",
    "Almost! Take another photo and try again.",
]


def _extension_for(mime_type: str | None) -> str:
    return MIME_TO_EXT.get(mime_type or "", "jpg")


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
    path = f"{player_id or 'anon'}/{task_id}-{uuid.uuid4().hex}.{_extension_for(mime_type)}"

    try:
        db.storage.from_(BUCKET).upload(
            path, image_bytes, {"content-type": mime_type}
        )
        photo_url = db.storage.from_(BUCKET).get_public_url(path)
    except Exception as e:  # noqa: BLE001
        if not is_supabase_network_error(e):
            raise HTTPException(status_code=502, detail=f"Photo upload failed: {e}") from e
        # Supabase Storage is unreachable - Gemini itself doesn't depend on
        # it, so keep going with a clearly-fake url instead of failing the
        # whole verification.
        photo_url = f"mock://unavailable-storage/{path}"

    client = genai.Client(api_key=settings.gemini_key)
    task_prompt = f'Task: "{task["title"]}" - {task["description"]}'

    try:
        response = client.models.generate_content(
            model=VERIFY_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                task_prompt,
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=GeminiVerdict,
            ),
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e

    verdict: GeminiVerdict = response.parsed
    if verdict is None:
        raise HTTPException(status_code=502, detail="Gemini returned no verdict")

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

    message = "Nice! Task complete." if verdict.response else random.choice(RETRY_MESSAGES)
    return TaskVerification(response=verdict.response, message=message, photo_url=photo_url)
