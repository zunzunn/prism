from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.config import parse_cors_origins
from app.db import get_session
from main import app

client = TestClient(app)


def test_health_check() -> None:
    """Verify /api/health returns ok status and database connected."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert "PRISM" in data["app"]


def test_health_check_database_degraded() -> None:
    """Verify /api/health returns 503 degraded status if database connectivity fails."""
    def broken_session():
        mock = MagicMock()
        mock.exec.side_effect = RuntimeError("Database unreachable")
        yield mock

    app.dependency_overrides[get_session] = broken_session
    try:
        response = client.get("/api/health")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "degraded"
        assert data["database"] == "disconnected"
        assert "password" not in response.text
        assert "sqlite" not in response.text
    finally:
        app.dependency_overrides.pop(get_session, None)


def test_cors_origins_parsing() -> None:
    """Verify CORS origins parsing strips slashes, deduplicates, and retains local origins."""
    raw = "https://prism-demo.vercel.app/, https://prism-preview.vercel.app, *, https://prism-demo.vercel.app"
    parsed = parse_cors_origins(raw)
    
    assert "https://prism-demo.vercel.app" in parsed
    assert "https://prism-demo.vercel.app/" not in parsed
    assert "https://prism-preview.vercel.app" in parsed
    assert "*" not in parsed
    # Retains local dev origins
    assert "http://localhost:5173" in parsed
    assert "http://127.0.0.1:5173" in parsed


def test_root_endpoint() -> None:
    """Verify root endpoint returns basic info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "PRISM" in data["message"]
