from fastapi import APIRouter, HTTPException
from google import genai

from backend.core.config import settings

router = APIRouter()


@router.get("/status")
def gemini_status():
    """Confirms the Gemini client is configured, without calling the API.

    Only constructs the client (validates the key is present and well-formed
    enough to build a client) - does NOT call generate_content or any other
    API method, so checking this endpoint never burns a Gemini request.
    """
    if not settings.gemini_key:
        raise HTTPException(status_code=500, detail="GEMINI_KEY not configured")

    try:
        genai.Client(api_key=settings.gemini_key)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "configured"}
