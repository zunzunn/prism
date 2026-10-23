"""Pytest fixtures for backend test suite."""

import pytest
from sqlmodel import Session
from app.db import engine, init_db
from app.seed import seed_database


@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    """Ensure database schema is initialized and seeded before tests run."""
    init_db()
    with Session(engine) as session:
        seed_database(session, force=False)
