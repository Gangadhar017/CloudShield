import pytest

def test_health_and_version_unauthenticated(client):
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_ver = client.get("/api/version")
    assert res_ver.status_code == 200
    assert "version" in res_ver.json()

def test_unauthenticated_blocked(client):
    res = client.get("/api/resources")
    assert res.status_code == 401

    res_inc = client.get("/api/incidents")
    assert res_inc.status_code == 401

def test_login_flow(client):
    # Valid login
    res = client.post("/api/auth/login", json={
        "email": "admin@test.local",
        "password": "Admin@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@test.local"
    assert "password_hash" not in data["user"]

    # Invalid login
    res_bad = client.post("/api/auth/login", json={
        "email": "admin@test.local",
        "password": "WrongPassword"
    })
    assert res_bad.status_code == 401

def test_operator_cannot_approve_remediation(client, operator_headers):
    # Attempt approval with operator token -> must be 403 Forbidden
    res = client.post("/api/remediation/1/approve", json={"approved": True}, headers=operator_headers)
    assert res.status_code == 403
    assert "Administrative privileges required" in res.json()["detail"]

def test_operator_can_view_resources_and_incidents(client, operator_headers):
    res_res = client.get("/api/resources", headers=operator_headers)
    assert res_res.status_code == 200
    assert len(res_res.json()) >= 2

    res_inc = client.get("/api/incidents", headers=operator_headers)
    assert res_inc.status_code == 200

def test_registration_flow(client):
    res = client.post("/api/auth/register", json={
        "email": "freshuser@test.local",
        "password": "SecretPassword123",
        "role": "operator"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "freshuser@test.local"
    assert data["role"] == "operator"

    # Try duplicate registration
    res_dup = client.post("/api/auth/register", json={
        "email": "freshuser@test.local",
        "password": "SecretPassword123",
        "role": "operator"
    })
    assert res_dup.status_code == 400
    assert "already registered" in res_dup.json()["detail"]

    # Verify new user can login
    res_login = client.post("/api/auth/login", json={
        "email": "freshuser@test.local",
        "password": "SecretPassword123"
    })
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()

