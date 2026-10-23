"""Health check and system information endpoint."""

from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health() -> dict[str, str]:
    """Return health status and basic system metadata."""
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
    }
