"""PRISM FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from app.config import settings
from app.db import engine, init_db
from app.routers import applications, auth, demo, documents, health
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle hooks: initialize database and verify storage."""
    # Ensure storage directory exists
    settings.storage_dir.mkdir(parents=True, exist_ok=True)
    # Initialize tables and seed deterministic demo data idempotently
    init_db()
    with Session(engine) as session:
        seed_database(session, force=False)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Proactive Regulatory Intelligence & Status Monitoring API",
    lifespan=lifespan,
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include core routers
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(demo.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(documents.router, prefix="/api")


@app.get("/")
def root() -> dict[str, str]:
    """Root redirect / information."""
    return {
        "message": "PRISM API is running. Visit /docs for interactive documentation.",
        "health": "/api/health",
    }
