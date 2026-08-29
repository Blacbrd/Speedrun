from pydantic import BaseModel


class TaskVerification(BaseModel):
    """Gemini's judgement on whether a submitted photo satisfies a task."""

    match: bool
    reason: str
