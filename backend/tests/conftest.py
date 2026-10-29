import pytest
from fastapi.testclient import TestClient
from app.main import app as fastapi_app
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    with TestClient(fastapi_app) as test_client:
        yield test_client
