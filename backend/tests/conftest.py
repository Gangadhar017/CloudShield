import os
import sys
import pytest

# Ensure repository root is on sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.database import Base, get_db
from backend.app.core.security import get_password_hash, create_access_token
from backend.app.models.models import User, Resource
from backend.app.main import app

# Use isolated in-memory SQLite for high-speed deterministic testing
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # Seed Admin & Operator in test DB
    admin = User(
        email="admin@test.local",
        password_hash=get_password_hash("Admin@123"),
        role="admin"
    )
    operator = User(
        email="operator@test.local",
        password_hash=get_password_hash("Operator@123"),
        role="operator"
    )
    res_app = Resource(
        name="test-app-service",
        resource_type="application",
        endpoint_or_path="http://localhost:8001",
        status="healthy"
    )
    res_cfg = Resource(
        name="target-cloud-config",
        resource_type="storage_config",
        endpoint_or_path="sample.yaml",
        status="degraded"
    )
    session.add_all([admin, operator, res_app, res_cfg])
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_headers():
    token = create_access_token({"sub": "admin@test.local", "role": "admin"})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def operator_headers():
    token = create_access_token({"sub": "operator@test.local", "role": "operator"})
    return {"Authorization": f"Bearer {token}"}
