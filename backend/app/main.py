import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database import engine, Base
from backend.app.routers import (
    auth_router,
    students_router,
    subjects_router,
    assessments_router,
    quizzes_router,
    materials_router,
    ai_router,
    admin_router
)
from backend.seed_data import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed default demo curriculum
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    yield
    # Shutdown

app = FastAPI(
    title="LEARNOVA AI - Adaptive Educational Platform",
    description="Your Learning Path. Powered by AI. Industrial grade final-year project API.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration to allow Vite dev server and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(subjects_router)
app.include_router(assessments_router)
app.include_router(quizzes_router)
app.include_router(materials_router)
app.include_router(ai_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "project": "LEARNOVA AI",
        "tagline": "Your Learning Path. Powered by AI.",
        "status": "Operational",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "ok", "platform": "Learnova AI"}
