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
    """Create database tables if they do not exist and apply lightweight schema migrations."""
    SQLModel.metadata.create_all(engine)
    with engine.connect() as conn:
        try:
            cursor = conn.exec_driver_sql("PRAGMA table_info(stage_configs)")
            cols = {row[1] for row in cursor.fetchall()}
            if cols and "description" not in cols:
                conn.exec_driver_sql("ALTER TABLE stage_configs ADD COLUMN description TEXT")
            if cols and "responsible_role" not in cols:
                conn.exec_driver_sql("ALTER TABLE stage_configs ADD COLUMN responsible_role TEXT DEFAULT 'officer'")
            if cols and "requires_decision" not in cols:
                conn.exec_driver_sql("ALTER TABLE stage_configs ADD COLUMN requires_decision BOOLEAN DEFAULT 0")
            if cols and "allow_clarifications" not in cols:
                conn.exec_driver_sql("ALTER TABLE stage_configs ADD COLUMN allow_clarifications BOOLEAN DEFAULT 1")
            conn.commit()
        except Exception:
            pass



def get_session() -> Generator[Session, None, None]:
    """Dependency that provides a transactional database session."""
    with Session(engine) as session:
        yield session
