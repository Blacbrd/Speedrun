from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class MatchStatus(str, Enum):
    pending = "pending"
    ready_check = "ready_check"
    active = "active"
    finished = "finished"
    cancelled = "cancelled"


class MatchInvite(BaseModel):
    host_id: UUID
    guest_id: UUID
    time_limit_seconds: int = 300


class SetTimeLimit(BaseModel):
    seconds: int


class ReadyUp(BaseModel):
    player_id: UUID


class LocationUpdate(BaseModel):
    player_id: UUID
    latitude: float
    longitude: float


class Match(BaseModel):
    """Row shape of public.matches."""

    id: UUID
    host_id: UUID
    guest_id: UUID | None
    status: MatchStatus
    time_limit_seconds: int
    started_at: datetime | None
    ends_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MatchPlayer(BaseModel):
    """Row shape of public.match_players."""

    match_id: UUID
    player_id: UUID
    ready: bool
    score: int
    latitude: float | None = None
    longitude: float | None = None
    location_updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class MatchTask(BaseModel):
    """A match_tasks row joined with the underlying task's details."""

    id: UUID
    match_id: UUID
    task_id: UUID
    status: str
    completed_by: UUID | None = None
    completed_at: datetime | None = None
    title: str
    description: str
    difficulty: str
    score: int

    model_config = {"from_attributes": True}


class MatchState(BaseModel):
    """Full room state - one call gives the frontend everything to render."""

    match: Match
    players: list[MatchPlayer]
    tasks: list[MatchTask]


class MatchVerification(BaseModel):
    response: bool
    message: str
    photo_url: str | None
    score: int
    new_task: MatchTask | None = None
