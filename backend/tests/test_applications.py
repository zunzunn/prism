"""Tests for application listing, filtering, search, detail retrieval, and cross-institution authorization."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def get_token_for_role(role: str) -> str:
    response = client.post("/api/demo-login", json={"role": role})
    assert response.status_code == 200
    return response.json()["token"]


def test_officer_can_view_all_applications():
    token = get_token_for_role("officer")
    response = client.get("/api/applications", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 12
    assert len(data["items"]) <= 10  # page_size default 10


def test_institution_user_can_only_view_own_applications():
    # Dr. Ramesh Gupta belongs to inst-01
    token = get_token_for_role("institution_user")
    response = client.get("/api/applications", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    # Verify every returned item strictly belongs to inst-01
    for item in data["items"]:
        assert item["institution_id"] == "inst-01"


def test_cross_institution_access_denial():
    # inst-01 user attempting to view app-0005 (which belongs to inst-02)
    inst_token = get_token_for_role("institution_user")
    response = client.get("/api/applications/app-0005", headers={"Authorization": f"Bearer {inst_token}"})
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


def test_officer_can_view_any_application_dossier():
    officer_token = get_token_for_role("officer")
    response = client.get("/api/applications/app-0005", headers={"Authorization": f"Bearer {officer_token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["application"]["id"] == "app-0005"
    assert len(data["stages"]) == 8
    assert isinstance(data["documents"], list)
    assert isinstance(data["audit_events"], list)


def test_application_not_found():
    admin_token = get_token_for_role("admin")
    response = client.get("/api/applications/nonexistent-id", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_application_search():
    officer_token = get_token_for_role("officer")
    response = client.get(
        "/api/applications?search=DEMO-APP-0001",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["ref"] == "DEMO-APP-0001"


def test_application_filter_by_stage_and_status():
    officer_token = get_token_for_role("officer")
    response = client.get(
        "/api/applications?stage=stage-doc-check&status=needs_attention",
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["stage_id"] == "stage-doc-check"
        assert item["status"] == "needs_attention"


def test_application_audit_trail_endpoint():
    officer_token = get_token_for_role("officer")
    response = client.get("/api/applications/app-0001/audit", headers={"Authorization": f"Bearer {officer_token}"})
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    assert len(events) >= 1
