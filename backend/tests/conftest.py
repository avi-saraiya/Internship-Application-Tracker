import os

# Point the whole app (engine included) at the test database before it is imported.
from app.core.config import get_settings

os.environ["DATABASE_URL"] = get_settings().test_database_url
get_settings.cache_clear()

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.core.db import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base  # noqa: E402

PASSWORD = "correct-horse-battery"


@pytest.fixture(scope="session", autouse=True)
def _schema():
    assert engine.url.database == "tracker_test", "refusing to run tests against non-test DB"
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture(autouse=True)
def _clean_tables():
    yield
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE users, user_sessions, applications RESTART IDENTITY CASCADE"))


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def register(client: TestClient, email: str = "alice@example.com", password: str = PASSWORD):
    return client.post("/api/v1/auth/register", json={"email": email, "password": password})


@pytest.fixture
def auth_client(client: TestClient) -> TestClient:
    assert register(client).status_code == 201
    return client


@pytest.fixture
def make_client():
    """Factory for independent logged-in clients (separate cookie jars)."""

    def _make(email: str) -> TestClient:
        c = TestClient(app)
        assert register(c, email).status_code == 201
        return c

    return _make
