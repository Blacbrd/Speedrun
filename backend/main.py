from fastapi import FastAPI

from backend.routers.db.get import router as db_router
from backend.routers.gemini.get import router as gemini_router

app = FastAPI(title="Supabase API")

# Include the routes with a prefix
app.include_router(db_router, prefix="/api")
app.include_router(gemini_router, prefix="/api/gemini")


@app.get("/")
def health_check():
    return {"status": "healthy", "message": "FastAPI is connected to Supabase"}
