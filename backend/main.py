from fastapi import FastAPI

from backend.routers.auth.post import router as auth_router
from backend.routers.db.get import router as db_router
from backend.routers.gemini.get import router as gemini_get_router
from backend.routers.gemini.post import router as gemini_post_router
from backend.routers.matches.get import router as matches_get_router
from backend.routers.matches.post import router as matches_post_router
from backend.routers.runs.post import router as runs_router
from backend.routers.tasks.get import router as tasks_router

app = FastAPI(title="Supabase API")

# Include the routes with a prefix
app.include_router(db_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(tasks_router, prefix="/api/tasks")
app.include_router(runs_router, prefix="/api/runs")
app.include_router(matches_get_router, prefix="/api/matches")
app.include_router(matches_post_router, prefix="/api/matches")
app.include_router(gemini_get_router, prefix="/api/gemini")
app.include_router(gemini_post_router, prefix="/api/gemini")


@app.get("/")
def health_check():
    return {"status": "healthy", "message": "FastAPI is connected to Supabase"}
