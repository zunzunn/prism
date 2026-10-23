"""Tests for demo authentication, session token validation, and identity verification."""

import time
from fastapi.testclient import TestClient
from main import app
from app.auth import _b64_encode, create_session_token

client = TestClient(app)


def test_demo_login_institution_user():
    response = client.post("/api/demo-login", json={"role": "institution_user"})
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["role"] == "institution_user"
    assert data["user"]["institution_id"] == "inst-01"
    assert data["user"]["institution_name"] == "Apex Institute of Technology"


def test_demo_login_officer():
    response = client.post("/api/demo-login", json={"role": "officer"})
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["role"] == "officer"
    assert data["user"]["institution_id"] is None


def test_demo_login_admin():
    response = client.post("/api/demo-login", json={"role": "admin"})
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["role"] == "admin"


def test_demo_login_invalid_role():
    response = client.post("/api/demo-login", json={"role": "invalid_role"})
    assert response.status_code == 400
    assert "Invalid demo role" in response.json()["detail"]


def test_get_current_user_authenticated():
    login_res = client.post("/api/demo-login", json={"role": "institution_user"})
    token = login_res.json()["token"]

    response = client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    user = response.json()
    assert user["role"] == "institution_user"
    assert user["email"] == "r.gupta@apextech.example.test"


def test_get_current_user_missing_token():
    response = client.get("/api/me")
    assert response.status_code == 401


def test_get_current_user_invalid_signature():
    token = create_session_token("usr-inst-01", "institution_user", "inst-01")
    tampered_token = token[:-4] + "wxyz"
    response = client.get("/api/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert response.status_code == 401
    assert "signature" in response.json()["detail"].lower()


def test_logout_endpoint():
    response = client.post("/api/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"
