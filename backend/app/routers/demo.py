"""Demo control router for data seeding and state reset."""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db import get_session
from app.seed import seed_database

router = APIRouter(prefix="/demo", tags=["Demo Management"])


@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_session)) -> dict[str, str]:
    """Reset the database to initial deterministic demo state."""
    seed_database(db, force=True)
    return {"message": "Demo database reset successfully"}
