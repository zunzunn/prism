"""Database engine configuration and session dependency."""

from typing import Generator
from sqlmodel import Session, SQLModel, create_engine
from app.config import settings

engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)


def init_db() -> None:
    """Create database tables if they do not exist."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency that provides a transactional database session."""
    with Session(engine) as session:
        yield session
