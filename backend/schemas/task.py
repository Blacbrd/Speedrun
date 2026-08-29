from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class TaskDifficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class Task(BaseModel):
    """Row shape of public.tasks."""

    id: UUID
    title: str
    description: str
    difficulty: TaskDifficulty
    score: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PlayerTaskStatus(str, Enum):
    assigned = "assigned"
    submitted = "submitted"
    verified = "verified"
    rejected = "rejected"


class PlayerTask(BaseModel):
    """Row shape of public.player_tasks: a task a player has grabbed."""

    id: UUID
    player_id: UUID
    task_id: UUID
    status: PlayerTaskStatus
    photo_url: str | None = None
    assigned_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}
