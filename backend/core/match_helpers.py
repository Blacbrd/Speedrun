"""Shared helpers for the matches routers - keeps get.py/post.py thin."""

import random

from supabase import Client

ACTIVE_TASK_COUNT = 5


def flatten_match_task(row: dict) -> dict:
    """A match_tasks row selected with the embedded `tasks(...)` relationship
    -> the flat shape MatchTask expects.
    """
    task = row.pop("tasks", None) or {}
    return {**row, **task}


def fetch_match_tasks(db: Client, match_id: str, status: str | None = "active") -> list[dict]:
    query = (
        db.table("match_tasks")
        .select("*, tasks(title,description,difficulty,score)")
        .eq("match_id", match_id)
    )
    if status:
        query = query.eq("status", status)
    rows = query.execute().data
    return [flatten_match_task(row) for row in rows]


def seed_active_tasks(db: Client, match_id: str, count: int = ACTIVE_TASK_COUNT) -> None:
    """Fill match_tasks up to `count` active rows, drawing tasks not already
    used in this match."""
    existing = db.table("match_tasks").select("task_id").eq("match_id", match_id).execute().data
    used_ids = {row["task_id"] for row in existing}

    all_tasks = db.table("tasks").select("id").execute().data
    available = [t["id"] for t in all_tasks if t["id"] not in used_ids]

    active_count = (
        db.table("match_tasks")
        .select("id", count="exact")
        .eq("match_id", match_id)
        .eq("status", "active")
        .execute()
        .count
        or 0
    )
    needed = max(0, count - active_count)
    if needed == 0 or not available:
        return

    draw = random.sample(available, k=min(needed, len(available)))
    db.table("match_tasks").insert(
        [{"match_id": match_id, "task_id": task_id} for task_id in draw]
    ).execute()
