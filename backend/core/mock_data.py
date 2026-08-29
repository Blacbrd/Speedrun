"""In-memory fallback data, used only when Supabase is unreachable (see
core/network.py). Lets Gemini verification and Mapbox testing keep working
during a Supabase outage without hitting any real limits - none of this
touches an external service. Resets whenever the process restarts; it's a
dev-time fallback, not real persistence.
"""

import random
import uuid
from datetime import UTC, datetime

MOCK_PLAYER_ID = "00000000-0000-0000-0000-000000000001"

MOCK_PLAYER = {
    "id": MOCK_PLAYER_ID,
    "email": "dummy@speedrun.local",
    "username": "dummy_player",
    "score": 0,
    "created_at": "2026-01-01T00:00:00+00:00",
}

MOCK_TASKS = [
    {
        "id": "10000000-0000-0000-0000-000000000001",
        "title": "A tree",
        "description": "Take a photo of a tree.",
        "difficulty": "easy",
        "score": 10,
        "created_at": "2026-01-01T00:00:00+00:00",
    },
    {
        "id": "10000000-0000-0000-0000-000000000002",
        "title": "A red object",
        "description": "Take a photo of anything red.",
        "difficulty": "easy",
        "score": 10,
        "created_at": "2026-01-01T00:00:00+00:00",
    },
    {
        "id": "10000000-0000-0000-0000-000000000003",
        "title": "A cup",
        "description": "Take a photo of a mug or cup.",
        "difficulty": "easy",
        "score": 10,
        "created_at": "2026-01-01T00:00:00+00:00",
    },
    {
        "id": "10000000-0000-0000-0000-000000000004",
        "title": "A bridge",
        "description": "Take a photo of a bridge, big or small.",
        "difficulty": "medium",
        "score": 20,
        "created_at": "2026-01-01T00:00:00+00:00",
    },
    {
        "id": "10000000-0000-0000-0000-000000000005",
        "title": "City skyline",
        "description": "Take a photo of a full city skyline.",
        "difficulty": "hard",
        "score": 35,
        "created_at": "2026-01-01T00:00:00+00:00",
    },
]

# Keyed by run_id / (run_id, task_id) - mirrors the real schema's shape
# closely enough that callers don't need to know which source they hit.
_mock_runs: dict[str, dict] = {}
_mock_player_tasks: dict[tuple[str, str], dict] = {}


def mock_random_tasks(count: int) -> list[dict]:
    return random.sample(MOCK_TASKS, k=min(count, len(MOCK_TASKS)))


def mock_task_by_id(task_id: str) -> dict:
    for task in MOCK_TASKS:
        if task["id"] == task_id:
            return task
    # Frontend may be mid-run with a real task id it drew before the outage
    # started - fall back to a generic prompt rather than a hard 404.
    return {
        "id": task_id,
        "title": "Mystery task",
        "description": "Take a photo of the requested subject.",
        "difficulty": "easy",
        "score": 10,
        "created_at": "2026-01-01T00:00:00+00:00",
    }


def mock_start_run(player_id: str, mode: str) -> dict:
    run_id = str(uuid.uuid4())
    now = datetime.now(UTC).isoformat()
    run = {
        "id": run_id,
        "player_id": player_id,
        "mode": mode,
        "started_at": now,
        "ended_at": None,
        "duration_seconds": None,
        "tasks_completed": 0,
        "score": 0,
        "created_at": now,
    }
    _mock_runs[run_id] = run
    return run


def mock_finish_run(run_id: str, duration_seconds: int) -> dict | None:
    run = _mock_runs.get(run_id)
    if not run:
        return None
    completed = [
        pt
        for (r_id, _task_id), pt in _mock_player_tasks.items()
        if r_id == run_id and pt["status"] == "verified"
    ]
    score = sum(mock_task_by_id(pt["task_id"])["score"] for pt in completed)
    run.update(
        {
            "ended_at": datetime.now(UTC).isoformat(),
            "duration_seconds": duration_seconds,
            "tasks_completed": len(completed),
            "score": score,
        }
    )
    return run


def mock_upsert_player_task(
    player_id: str, task_id: str, run_id: str, status: str, photo_url: str | None
) -> dict:
    row = {
        "id": str(uuid.uuid4()),
        "player_id": player_id,
        "task_id": task_id,
        "run_id": run_id,
        "status": status,
        "photo_url": photo_url,
        "completed_at": datetime.now(UTC).isoformat() if status == "verified" else None,
    }
    _mock_player_tasks[(run_id, task_id)] = row
    return row
