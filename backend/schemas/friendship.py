from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class FriendshipStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    blocked = "blocked"


class FriendshipCreate(BaseModel):
    addressee_id: UUID


class Friendship(BaseModel):
    """Row shape of public.friendships."""

    id: UUID
    requester_id: UUID
    addressee_id: UUID
    status: FriendshipStatus
    created_at: datetime

    model_config = {"from_attributes": True}
