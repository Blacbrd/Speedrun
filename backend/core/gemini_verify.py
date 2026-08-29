"""Shared Gemini photo-verification logic - used by both the singleplayer
/api/gemini/verify endpoint and the multiplayer /api/matches/{id}/verify
endpoint, so the model/prompt/upload path never drifts between the two.
"""

import random
import uuid

from fastapi import HTTPException
from google import genai
from google.genai import types
from supabase import Client

from backend.core.config import settings
from backend.core.network import is_supabase_network_error
from backend.schemas.verification import GeminiVerdict

# Small, fast, vision-capable model - free-tier friendly, cheap enough for a
# per-submission check. gemini-2.5-flash was retired; 3.5 is current.
VERIFY_MODEL = "gemini-3.5-flash"

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


def extension_for(mime_type: str | None) -> str:
    return MIME_TO_EXT.get(mime_type or "", "jpg")


def upload_task_photo(
    db: Client, folder: str, task_id: str, image_bytes: bytes, mime_type: str
) -> str:
    """Uploads a submission photo, returns its public URL. Falls back to a
    clearly-fake url if Storage itself is unreachable (Gemini doesn't depend
    on it, so verification can still proceed)."""
    path = f"{folder}/{task_id}-{uuid.uuid4().hex}.{extension_for(mime_type)}"
    try:
        db.storage.from_(BUCKET).upload(path, image_bytes, {"content-type": mime_type})
        return db.storage.from_(BUCKET).get_public_url(path)
    except Exception as e:  # noqa: BLE001
        if not is_supabase_network_error(e):
            raise HTTPException(status_code=502, detail=f"Photo upload failed: {e}") from e
        return f"mock://unavailable-storage/{path}"


def get_verdict(image_bytes: bytes, mime_type: str, title: str, description: str) -> GeminiVerdict:
    client = genai.Client(api_key=settings.gemini_key)
    task_prompt = f'Task: "{title}" - {description}'

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
    return verdict


def retry_message() -> str:
    return random.choice(RETRY_MESSAGES)
