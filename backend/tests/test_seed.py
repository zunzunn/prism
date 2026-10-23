"""Tests for database persistence and seed data idempotency."""

from fastapi.testclient import TestClient
from sqlmodel import Session, select
from main import app
from app.db import engine
from app.models import Application, Institution, StageConfig, User
from app.seed import seed_database

client = TestClient(app)


def test_seed_data_presence():
    with Session(engine) as session:
        institutions = session.exec(select(Institution)).all()
        assert len(institutions) >= 3

        users = session.exec(select(User)).all()
        assert len(users) >= 5

        stages = session.exec(select(StageConfig)).all()
        assert len(stages) == 8

        applications = session.exec(select(Application)).all()
        assert len(applications) >= 12


def test_seed_idempotency():
    with Session(engine) as session:
        count_before = len(session.exec(select(Application)).all())
        # Call seed without force
        seed_database(session, force=False)
        count_after = len(session.exec(select(Application)).all())
        assert count_before == count_after


def test_demo_reset_endpoint():
    response = client.post("/api/demo/reset")
    assert response.status_code == 200
    assert "reset successfully" in response.json()["message"]

    with Session(engine) as session:
        applications = session.exec(select(Application)).all()
        assert len(applications) >= 12
