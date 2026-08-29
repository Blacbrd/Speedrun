from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class PlayerBase(BaseModel):
    email: EmailStr
    username: str | None = None


class PlayerCreate(BaseModel):
    """Sign-up payload: Supabase Auth owns the password, this is what we store alongside it."""

    email: EmailStr
    password: str
    username: str | None = None


class PlayerLogin(BaseModel):
    email: EmailStr
    password: str


class Player(PlayerBase):
    """Row shape of public.players."""

    id: UUID
    score: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}
