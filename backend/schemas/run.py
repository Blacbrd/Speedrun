from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class RunStart(BaseModel):
    player_id: UUID
    mode: str = "singleplayer"


class RunFinish(BaseModel):
    duration_seconds: int


class Run(BaseModel):
    """Row shape of public.runs - one timed play session."""

    id: UUID
    player_id: UUID
    mode: str
    started_at: datetime
    ended_at: datetime | None = None
    duration_seconds: int | None = None
    tasks_completed: int
    score: int
    created_at: datetime

    model_config = {"from_attributes": True}
