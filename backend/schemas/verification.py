from pydantic import BaseModel


class GeminiVerdict(BaseModel):
    """The exact, strict shape Gemini itself must return - nothing else."""

    response: bool


class TaskVerification(BaseModel):
    """API response: Gemini's verdict plus a user-facing message."""

    response: bool
    message: str
    photo_url: str | None = None
