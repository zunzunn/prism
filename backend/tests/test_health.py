"""Tests for backend health check endpoint."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check() -> None:
    """Verify /api/health returns ok status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "PRISM" in data["app"]


def test_root_endpoint() -> None:
    """Verify root endpoint returns basic info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "PRISM" in data["message"]
