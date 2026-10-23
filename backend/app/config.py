"""Application configuration settings."""

import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseModel):
    app_name: str = "PRISM API"
    app_version: str = "0.2.0"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/prism.db")
    storage_dir: Path = Path(os.getenv("STORAGE_DIR", str(BASE_DIR / "storage" / "uploads")))
    secret_key: str = os.getenv("SECRET_KEY", "prism-hackathon-demo-secret-key-change-in-production")
    session_expiry_hours: int = int(os.getenv("SESSION_EXPIRY_HOURS", "24"))
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
