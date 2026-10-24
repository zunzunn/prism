from typing import Any
from fastapi import APIRouter, Depends, Response, status
from sqlmodel import Session, text
from app.config import settings
from app.db import get_session

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health(
    response: Response,
    db: Session = Depends(get_session),
) -> dict[str, Any]:
    """Return health status and basic system metadata, verifying database connectivity."""
    db_connected = False
    try:
        # Perform lightweight connectivity probe without exposing DB metadata or filesystem paths
        db.exec(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    if not db_connected:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "degraded",
            "app": settings.app_name,
            "version": settings.app_version,
            "database": "disconnected",
        }

    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "database": "connected",
    }
