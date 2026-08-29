from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from google import genai
from google.genai import types
from supabase import Client

from backend.core.config import settings
from backend.db.supabase import get_db
from backend.schemas.verification import TaskVerification

router = APIRouter()

# Small, fast, vision-capable model - cheap enough for a per-submission check.
VERIFY_MODEL = "gemini-2.5-flash"

VERIFY_PROMPT = """You are judging a photo scavenger hunt submission.

Task: "{title}" - {description}

Look at the attached photo and decide if it genuinely satisfies the task.
Be strict: reject photos of the wrong subject (e.g. a dog, a gate, plain
concrete) when the task asks for something else, and reject blurry or
unrelated photos. Respond with your verdict."""


@router.post("/verify", response_model=TaskVerification)
async def verify_task_photo(
    task_id: str = Form(...),
    player_id: str | None = Form(None),
    file: UploadFile = File(...),
    db: Client = Depends(get_db),  # noqa: B008
):
    """Submit a photo for a task; Gemini decides accept/deny.

    If `player_id` is given, the matching player_tasks row is updated to
    'verified' or 'rejected'.
    """
    task_resp = db.table("tasks").select("*").eq("id", task_id).single().execute()
    task = task_resp.data
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    client = genai.Client(api_key=settings.gemini_key)
    prompt = VERIFY_PROMPT.format(
        title=task["title"], description=task["description"]
    )

    try:
        response = client.models.generate_content(
            model=VERIFY_MODEL,
            contents=[
                types.Part.from_bytes(
                    data=image_bytes, mime_type=file.content_type or "image/jpeg"
                ),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=TaskVerification,
            ),
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(e)) from e

    verdict: TaskVerification = response.parsed
    if verdict is None:
        raise HTTPException(status_code=502, detail="Gemini returned no verdict")

    if player_id:
        update = {"status": "verified" if verdict.match else "rejected"}
        if verdict.match:
            update["completed_at"] = datetime.now(UTC).isoformat()
        db.table("player_tasks").update(update).eq("player_id", player_id).eq(
            "task_id", task_id
        ).execute()

    return verdict
