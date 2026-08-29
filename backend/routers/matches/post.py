from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from supabase import Client

from backend.core.gemini_verify import get_verdict, retry_message, upload_task_photo
from backend.core.match_helpers import ACTIVE_TASK_COUNT, fetch_match_tasks, seed_active_tasks
from backend.db.supabase import get_db
from backend.schemas.match import LocationUpdate, Match, MatchInvite, MatchVerification, ReadyUp, SetTimeLimit

router = APIRouter()


@router.post("/invite", response_model=Match)
def invite(payload: MatchInvite, db: Client = Depends(get_db)):  # noqa: B008
    """Host pings a friend: creates the match (status 'pending') and a
    match_players row for each of them. The invited player's client picks
    this up via a Realtime INSERT subscription on `matches` filtered to
    guest_id = their player id - see multiplayer.md.
    """
    host_id, guest_id = str(payload.host_id), str(payload.guest_id)
    try:
        match = (
            db.table("matches")
            .insert(
                {
                    "host_id": host_id,
                    "guest_id": guest_id,
                    "time_limit_seconds": payload.time_limit_seconds,
                }
            )
            .execute()
            .data[0]
        )
        db.table("match_players").insert(
            [
                {"match_id": match["id"], "player_id": host_id},
                {"match_id": match["id"], "player_id": guest_id},
            ]
        ).execute()
        return match
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/{match_id}/time-limit", response_model=Match)
def set_time_limit(match_id: str, payload: SetTimeLimit, db: Client = Depends(get_db)):  # noqa: B008
    """Host picks the round length before both players ready up. Not yet
    host-enforced server-side (hackathon scope) - the frontend should only
    show this control to the host."""
    try:
        row = (
            db.table("matches")
            .update({"time_limit_seconds": payload.seconds})
            .eq("id", match_id)
            .eq("status", "pending")
            .execute()
            .data
        )
        if not row:
            raise HTTPException(
                status_code=409, detail="Match not found or already past the lobby"
            )
        return row[0]
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/{match_id}/ready", response_model=Match)
def ready_up(match_id: str, payload: ReadyUp, db: Client = Depends(get_db)):  # noqa: B008
    """Mark a player ready. Once both players in the match are ready, seeds
    the 5 active tasks and flips the match to 'active' with a synchronized
    ends_at - both clients compute their countdown from that timestamp, not
    a local timer, so they can't drift apart.
    """
    player_id = str(payload.player_id)
    try:
        db.table("match_players").update({"ready": True}).eq("match_id", match_id).eq(
            "player_id", player_id
        ).execute()

        players = db.table("match_players").select("ready").eq("match_id", match_id).execute().data
        match = db.table("matches").select("*").eq("id", match_id).single().execute().data
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")

        if match["status"] == "pending" and len(players) == 2 and all(p["ready"] for p in players):
            seed_active_tasks(db, match_id, ACTIVE_TASK_COUNT)
            now = datetime.now(UTC)
            ends_at = now + timedelta(seconds=match["time_limit_seconds"])
            match = (
                db.table("matches")
                .update(
                    {
                        "status": "active",
                        "started_at": now.isoformat(),
                        "ends_at": ends_at.isoformat(),
                    }
                )
                .eq("id", match_id)
                .execute()
                .data[0]
            )
        return match
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/{match_id}/location")
def update_location(match_id: str, payload: LocationUpdate, db: Client = Depends(get_db)):  # noqa: B008
    """Live location sync: the frontend calls this every few seconds during
    an active match; opponents pick it up via a Realtime subscription on
    match_players for this match_id (see multiplayer.md)."""
    try:
        db.table("match_players").update(
            {
                "latitude": payload.latitude,
                "longitude": payload.longitude,
                "location_updated_at": datetime.now(UTC).isoformat(),
            }
        ).eq("match_id", match_id).eq("player_id", str(payload.player_id)).execute()
        return {"ok": True}
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/{match_id}/verify", response_model=MatchVerification)
async def verify_match_task(
    match_id: str,
    task_id: str = Form(...),
    player_id: str = Form(...),
    file: UploadFile = File(...),
    db: Client = Depends(get_db),  # noqa: B008
):
    """Multiplayer equivalent of /api/gemini/verify: same Gemini judge, but
    on success it scores the point, marks this match_tasks row completed,
    and draws one replacement task so exactly 5 stay active. Realtime
    subscriptions on match_players (score) and match_tasks (task list) push
    both of those to the opponent automatically - this endpoint just writes.
    """
    match_task = (
        db.table("match_tasks")
        .select("*, tasks(title,description,difficulty,score)")
        .eq("match_id", match_id)
        .eq("task_id", task_id)
        .single()
        .execute()
        .data
    )
    if not match_task:
        raise HTTPException(status_code=404, detail="Task not active in this match")
    task = match_task["tasks"]

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    mime_type = file.content_type or "image/jpeg"
    photo_url = upload_task_photo(db, f"match-{match_id}", task_id, image_bytes, mime_type)
    verdict = get_verdict(image_bytes, mime_type, task["title"], task["description"])

    new_score = None
    new_task_row = None

    if verdict.response:
        db.table("match_tasks").update(
            {
                "status": "completed",
                "completed_by": player_id,
                "completed_at": datetime.now(UTC).isoformat(),
            }
        ).eq("id", match_task["id"]).execute()

        player = (
            db.table("match_players")
            .select("score")
            .eq("match_id", match_id)
            .eq("player_id", player_id)
            .single()
            .execute()
            .data
        )
        new_score = (player["score"] if player else 0) + task["score"]
        db.table("match_players").update({"score": new_score}).eq("match_id", match_id).eq(
            "player_id", player_id
        ).execute()

        seed_active_tasks(db, match_id, ACTIVE_TASK_COUNT)
        active = fetch_match_tasks(db, match_id, status="active")
        new_task_row = next((t for t in active if t["task_id"] not in (task_id,)), None)
    else:
        player = (
            db.table("match_players")
            .select("score")
            .eq("match_id", match_id)
            .eq("player_id", player_id)
            .single()
            .execute()
            .data
        )
        new_score = player["score"] if player else 0

    message = "Nice! Task complete." if verdict.response else retry_message()
    return MatchVerification(
        response=verdict.response,
        message=message,
        photo_url=photo_url,
        score=new_score,
        new_task=new_task_row,
    )
