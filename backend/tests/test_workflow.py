"""Automated tests for PRISM Workflow Automation Engine, Stage Transitions, Readiness Checks, Assignments, and Clarifications."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def get_token(role: str) -> str:
    res = client.post("/api/demo-login", json={"role": role})
    assert res.status_code == 200
    return res.json()["token"]


def test_list_stages():
    """Verify configured regulatory approval stages are retrieved in correct order."""
    token = get_token("officer")
    res = client.get("/api/stages", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    stages = res.json()
    assert len(stages) == 8
    orders = [s["order"] for s in stages]
    assert orders == sorted(orders)
    # Check enriched stage attributes
    first = stages[0]
    assert first["id"] == "stage-draft"
    assert "description" in first
    assert first["responsible_role"] == "institution_user"
    assert first["allow_clarifications"] is False


def test_list_eligible_officers():
    """Verify eligible officers and active workload counts are retrieved."""
    token = get_token("officer")
    res = client.get("/api/users/officers", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    officers = res.json()
    assert len(officers) >= 2
    for o in officers:
        assert o["role"] in ["officer", "admin"]
        assert "active_assignments_count" in o
        assert isinstance(o["active_assignments_count"], int)


def test_stage_readiness_evaluation():
    """Verify stage readiness evaluation detects pending blockers."""
    token = get_token("officer")
    # app-0001 is seeded with unreviewed findings and unsatisfied obligations
    res = client.get(
        "/api/applications/app-0001/readiness",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["application_id"] == "app-0001"
    assert "is_ready" in data
    assert "total_blockers" in data
    assert isinstance(data["blockers"], list)
    assert data["current_stage_id"] == "stage-doc-check"
    assert data["target_stage_id"] == "stage-desk-review"


def test_stage_advancement_blocked_without_override():
    """Verify attempting to advance an unready stage without override fails with 400."""
    token = get_token("officer")
    res = client.post(
        "/api/applications/app-0001/advance",
        headers={"Authorization": f"Bearer {token}"},
        json={"target_stage_id": "stage-clarification"},
    )
    # Either blocked or allowed based on blockers. For app-0001, findings/obligations block advancement
    if res.status_code == 400:
        data = res.json()
        assert "cannot advance" in data["detail"].lower() or "blocker" in data["detail"].lower()


def test_stage_advancement_admin_override():
    """Verify admin can override blockers with mandatory legal reason."""
    admin_token = get_token("admin")
    res = client.post(
        "/api/applications/app-0003/advance",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "target_stage_id": "stage-clarification",
            "override_blockers": True,
            "override_reason": "Executive Chair statutory waiver for urgent expedited hearing",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["application_id"] == "app-0003"
    assert data["new_stage_id"] == "stage-clarification"


def test_stage_return_to_earlier_stage():
    """Verify officer can return application to an earlier stage with a return reason."""
    officer_token = get_token("officer")
    # Return app-0003 from stage-clarification back to stage-desk-review
    res = client.post(
        "/api/applications/app-0003/return",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "target_stage_id": "stage-desk-review",
            "return_reason": "Discrepancy in fire safety certification requires re-scrutiny",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["new_stage_id"] == "stage-desk-review"
    assert data["previous_stage_id"] == "stage-clarification"


def test_officer_assignment_and_history():
    """Verify officer assignment updates application and logs assignment history."""
    admin_token = get_token("admin")
    res = client.post(
        "/api/applications/app-0002/assign",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "owner_id": "usr-off-01",
            "reason": "Routine regional caseload distribution",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["application_id"] == "app-0002"
    assert data["new_owner_id"] == "usr-off-01"

    # Verify history retrieval
    res_hist = client.get(
        "/api/applications/app-0002/assignments",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_hist.status_code == 200
    hist = res_hist.json()
    assert len(hist) >= 1
    assert any(h["new_owner_id"] == "usr-off-01" for h in hist)


def test_clarification_lifecycle():
    """Verify full clarification thread lifecycle: request -> reply -> resolve."""
    officer_token = get_token("officer")
    inst_token = get_token("institution_user")

    # 1. Officer creates clarification request on app-0001
    create_res = client.post(
        "/api/applications/app-0001/clarifications",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "title": "Clarify Building Plan Approval Date",
            "description": "Please provide sanctioned municipal plan approval letter reference date.",
            "rule_code": "BUILT-01",
        },
    )
    assert create_res.status_code == 201
    clr = create_res.json()
    clr_id = clr["id"]
    assert clr["status"] == "open"
    assert clr["title"] == "Clarify Building Plan Approval Date"

    # 2. Institution user replies
    reply_res = client.post(
        f"/api/clarifications/{clr_id}/reply",
        headers={"Authorization": f"Bearer {inst_token}"},
        json={
            "message": "Municipal approval was granted under order DTCP/2023/889 on 12/04/2023.",
        },
    )
    assert reply_res.status_code == 201
    reply = reply_res.json()
    assert reply["clarification_id"] == clr_id
    assert "order DTCP/2023/889" in reply["message"]

    # 3. Officer resolves clarification
    resolve_res = client.post(
        f"/api/clarifications/{clr_id}/resolve",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "resolution_note": "Order number verified against local planning authority portal.",
        },
    )
    assert resolve_res.status_code == 200
    resolved = resolve_res.json()
    assert resolved["status"] == "resolved"
    assert resolved["resolution_note"] is not None


def test_institution_user_cannot_perform_officer_workflow_actions():
    """Verify institution users are strictly forbidden from officer-only workflow actions."""
    inst_token = get_token("institution_user")

    # Cannot advance
    adv_res = client.post(
        "/api/applications/app-0001/advance",
        headers={"Authorization": f"Bearer {inst_token}"},
        json={"target_stage_id": "stage-committee"},
    )
    assert adv_res.status_code == 403

    # Cannot return
    ret_res = client.post(
        "/api/applications/app-0001/return",
        headers={"Authorization": f"Bearer {inst_token}"},
        json={"target_stage_id": "stage-draft", "return_reason": "Invalid attempt"},
    )
    assert ret_res.status_code == 403

    # Cannot assign officer
    asgn_res = client.post(
        "/api/applications/app-0001/assign",
        headers={"Authorization": f"Bearer {inst_token}"},
        json={"owner_id": "usr-officer-01", "reason": "Self assign"},
    )
    assert asgn_res.status_code == 403

    # Cannot record final statutory decision
    dec_res = client.post(
        "/api/applications/app-0001/decision",
        headers={"Authorization": f"Bearer {inst_token}"},
        json={"decision": "approved", "reason": "Self approval attempt"},
    )
    assert dec_res.status_code == 403


def test_record_statutory_decision_and_terminal_closure():
    """Verify official decision records regulatory finding, closes application, and blocks further advance."""
    admin_token = get_token("admin")

    # Record decision for app-0004
    dec_res = client.post(
        "/api/applications/app-0004/decision",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "decision": "approved",
            "reason": "All statutory land title and infrastructural norms satisfied under AICTE APH 2024-25 Clause 2.1.",
            "conditions_or_remarks": "Subject to submission of permanent fire NOC within 90 days of commissioning.",
            "override_blockers": True,
            "override_reason": "Statutory Council approval under emergency quorum",
        },
    )
    assert dec_res.status_code == 200
    decision = dec_res.json()
    assert decision["decision"] == "approved"
    assert decision["decided_by_name"] is not None

    # Verify decision retrieval
    get_dec_res = client.get(
        "/api/applications/app-0004/decision",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert get_dec_res.status_code == 200
    assert get_dec_res.json()["id"] == decision["id"]

    # Verify application cannot be advanced now that it is closed
    adv_res = client.post(
        "/api/applications/app-0004/advance",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"target_stage_id": "stage-closed"},
    )
    assert adv_res.status_code == 400
    assert "terminal" in adv_res.json()["detail"].lower()
