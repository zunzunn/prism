"""Unit and integration tests for Regulatory Compliance Rules Engine."""

from datetime import datetime, timezone
import json
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.db import engine, init_db
from app.models import (
    Application,
    AuditEvent,
    ComplianceObligation,
    Document,
    DocumentExtraction,
    Institution,
    RegulatoryRule,
    RuleEvaluation,
    User,
)
from app.seed import seed_database
from app.services.rules_engine import RulesEngine, normalize_name, parse_flexible_date
from app.services.rules_registry import DEFAULT_REGULATORY_RULES, get_default_rules
from main import app


@pytest.fixture(autouse=True)
def ensure_database_state():
    """Ensure database has clean schema and seed data before each test."""
    init_db()
    with Session(engine) as session:
        seed_database(session, force=False)


def test_rules_registry_and_citations():
    """Verify default rules contain official AICTE APH citations and synthetic tags."""
    rules = get_default_rules()
    assert len(rules) >= 7

    # Check official citation on Land rule
    land_rule = next(r for r in rules if r.rule_code == "RULE-LAND-01" and r.version == "1.0")
    assert "Approval Process Handbook" in land_rule.source_document
    assert "Chapter II, Clause 2.1" in land_rule.source_section
    assert not land_rule.is_synthetic

    # Check synthetic demonstration rule
    demo_rule = next(r for r in rules if r.rule_code == "DEMO-RULE-SPEC-01")
    assert demo_rule.is_synthetic
    assert "Synthetic Demonstration Rule" in demo_rule.source_document


def test_name_normalization_and_date_parsing():
    """Test string normalization and deterministic date parsing."""
    assert normalize_name("Apex Institute of Technology Pvt Ltd") == "apex technology"
    assert normalize_name("Horizon College of Engineering") == "horizon engineering"

    dt1 = parse_flexible_date("15 Jan 2026")
    assert dt1 is not None
    assert dt1.year == 2026 and dt1.month == 1 and dt1.day == 15

    dt2 = parse_flexible_date("2026-05-30")
    assert dt2 is not None
    assert dt2.year == 2026 and dt2.month == 5 and dt2.day == 30

    assert parse_flexible_date("") is None
    assert parse_flexible_date("invalid-date-string") is None


def test_rule_version_resolution():
    """Verify version resolution selects the active version effective at application date."""
    with Session(engine) as session:
        # App in 2026 cycle should resolve to version 1.0 of RULE-LAND-01
        app_2026 = session.get(Application, "app-0001")
        assert app_2026 is not None
        applicable = RulesEngine.get_applicable_rules(app_2026, session)
        land_rule = next(r for r in applicable if r.rule_code == "RULE-LAND-01")
        assert land_rule.version == "1.0"

        # If an application is submitted in year 2027+, it should resolve to version 2.0
        future_app = Application(
            id="test-future-app",
            ref="TEST-APP-2027",
            institution_id="inst-01",
            application_type="Extension of Approval (EoA)",
            academic_year="2027-2028",
            current_stage_id="stage-submitted",
            current_status="in_progress",
            submission_timestamp=datetime(2027, 5, 1, tzinfo=timezone.utc),
        )
        session.add(future_app)
        session.commit()

        applicable_future = RulesEngine.get_applicable_rules(future_app, session)
        land_rule_v2 = next(r for r in applicable_future if r.rule_code == "RULE-LAND-01")
        assert land_rule_v2.version == "2.0"

        session.delete(future_app)
        session.commit()


def test_evaluate_application_evaluations_and_obligations():
    """Verify deterministic compliance evaluation produces explainable evaluations and updates obligations."""
    with Session(engine) as session:
        app1 = session.get(Application, "app-0001")
        assert app1 is not None
        officer = session.exec(select(User).where(User.role == "officer")).first()

        evaluations, obligations = RulesEngine.evaluate_application(
            application=app1,
            db=session,
            actor=officer,
            trigger="test_run",
        )

        assert len(evaluations) >= 5
        assert len(obligations) >= 5

        # RULE-LAND-01 should be evaluated with clear title explanation
        land_eval = next(e for e in evaluations if e.rule_code == "RULE-LAND-01")
        assert land_eval.status in ["satisfied", "not_satisfied"]
        assert land_eval.expected_value == "Apex Institute of Technology"
        assert land_eval.actual_value is not None

        # Check that audit event was recorded
        audit = session.exec(
            select(AuditEvent)
            .where(AuditEvent.entity_id == app1.id)
            .where(AuditEvent.action == "Regulatory compliance evaluation executed")
            .order_by(AuditEvent.timestamp.desc())  # type: ignore[attr-defined]
        ).first()
        assert audit is not None
        assert "test_run" in (audit.detail or "")



def test_safety_certificate_expiry_rule_on_app2():
    """Verify RULE-SAFE-01 correctly flags expired certificate on app-0002 as not_satisfied."""
    with Session(engine) as session:
        app2 = session.get(Application, "app-0002")
        assert app2 is not None
        officer = session.exec(select(User).where(User.role == "officer")).first()

        evaluations, obligations = RulesEngine.evaluate_application(
            application=app2,
            db=session,
            actor=officer,
            trigger="test_safety",
        )

        safe_eval = next(e for e in evaluations if e.rule_code == "RULE-SAFE-01")
        assert safe_eval.status == "not_satisfied"
        assert "expired" in safe_eval.explanation.lower()
        assert safe_eval.evidence_document_name == "Building_Safety_Certificate.pdf"


def test_officer_review_override_and_audit():
    """Verify authorized officer can override an obligation decision with accountability."""
    with Session(engine) as session:
        app1 = session.get(Application, "app-0001")
        assert app1 is not None
        officer = session.exec(select(User).where(User.role == "officer")).first()
        assert officer is not None

        oblg = session.get(ComplianceObligation, f"oblg_{app1.id}_DEMO-RULE-SPEC-01")
        if not oblg:
            RulesEngine.ensure_application_obligations(app1, session)
            oblg = session.get(ComplianceObligation, f"oblg_{app1.id}_DEMO-RULE-SPEC-01")

        assert oblg is not None

        # Override with exception_granted
        updated = RulesEngine.record_obligation_review(
            obligation=oblg,
            review_status="overridden",
            decision="exception_granted",
            notes="Temporary waiver granted under statutory discretionary exemption 4B.",
            actor=officer,
            db=session,
        )

        assert updated.review_status == "overridden"
        assert updated.status == "exception_granted"
        assert updated.reviewed_by_id == officer.id

        # Verify audit event
        audit = session.exec(
            select(AuditEvent)
            .where(AuditEvent.entity_id == oblg.id)
            .where(AuditEvent.action == "Compliance obligation overridden: DEMO-RULE-SPEC-01")
        ).first()
        assert audit is not None


def test_api_list_rules():
    """Test GET /api/rules and filtering."""
    client = TestClient(app)
    login_res = client.post("/api/demo-login", json={"role": "officer"})
    headers = {"Authorization": f"Bearer {login_res.json()['token']}"}

    res = client.get("/api/rules", headers=headers)
    assert res.status_code == 200
    rules = res.json()
    assert len(rules) >= 7

    # Filter synthetic only
    res_synth = client.get("/api/rules?is_synthetic=true", headers=headers)
    assert res_synth.status_code == 200
    synth_rules = res_synth.json()
    assert all(r["is_synthetic"] is True for r in synth_rules)

    # Filter by category
    res_cat = client.get("/api/rules?category=Safety%20%26%20Statutory", headers=headers)
    assert res_cat.status_code == 200
    assert len(res_cat.json()) >= 1


def test_api_get_rule_versions():
    """Test GET /api/rules/{rule_code}/versions."""
    client = TestClient(app)
    login_res = client.post("/api/demo-login", json={"role": "officer"})
    headers = {"Authorization": f"Bearer {login_res.json()['token']}"}

    res = client.get("/api/rules/RULE-LAND-01/versions", headers=headers)
    assert res.status_code == 200
    versions = res.json()
    assert len(versions) >= 2
    assert any(v["version"] == "1.0" for v in versions)
    assert any(v["version"] == "2.0" for v in versions)


def test_api_get_and_evaluate_compliance():
    """Test GET /api/applications/{id}/compliance and POST evaluate endpoint."""
    client = TestClient(app)
    login_res = client.post("/api/demo-login", json={"role": "officer"})
    headers = {"Authorization": f"Bearer {login_res.json()['token']}"}

    # GET compliance
    res = client.get("/api/applications/app-0001/compliance", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["application_id"] == "app-0001"
    assert "summary" in data
    assert "obligations" in data
    assert data["summary"]["total_obligations"] >= 5

    # Re-evaluate compliance
    res_eval = client.post("/api/applications/app-0001/compliance/evaluate", headers=headers)
    assert res_eval.status_code == 200
    eval_data = res_eval.json()
    assert eval_data["application_id"] == "app-0001"
    assert eval_data["summary"]["last_evaluated_at"] is not None


def test_api_compliance_history():
    """Test GET /api/applications/{id}/compliance/history."""
    client = TestClient(app)
    login_res = client.post("/api/demo-login", json={"role": "officer"})
    headers = {"Authorization": f"Bearer {login_res.json()['token']}"}

    res = client.get("/api/applications/app-0001/compliance/history", headers=headers)
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    assert len(history) > 0


def test_api_review_obligation_rbac():
    """Test POST /api/compliance/obligations/{id}/review RBAC restrictions."""
    client = TestClient(app)

    # 1. Institution user attempt -> 403 Forbidden
    inst_login = client.post("/api/demo-login", json={"role": "institution_user"})
    inst_headers = {"Authorization": f"Bearer {inst_login.json()['token']}"}

    res_forbidden = client.post(
        "/api/compliance/obligations/oblg_app-0001_RULE-LAND-01/review",
        json={"review_status": "confirmed", "notes": "Unauthorized attempt"},
        headers=inst_headers,
    )
    assert res_forbidden.status_code == 403

    # 2. Officer attempt with missing notes -> 400 Bad Request
    off_login = client.post("/api/demo-login", json={"role": "officer"})
    off_headers = {"Authorization": f"Bearer {off_login.json()['token']}"}

    res_bad = client.post(
        "/api/compliance/obligations/oblg_app-0001_RULE-LAND-01/review",
        json={"review_status": "confirmed", "notes": "  "},
        headers=off_headers,
    )
    assert res_bad.status_code == 400

    # 3. Valid officer review
    res_ok = client.post(
        "/api/compliance/obligations/oblg_app-0001_RULE-LAND-01/review",
        json={"review_status": "confirmed", "notes": "Title search registry documents verified by officer."},
        headers=off_headers,
    )
    assert res_ok.status_code == 200
    assert res_ok.json()["obligation"]["review_status"] == "confirmed"


def test_cross_institution_isolation():
    """Verify institution users cannot access compliance for other institutions' applications."""
    client = TestClient(app)

    # Dr. Ramesh Gupta belongs to inst-01
    inst_login = client.post("/api/demo-login", json={"role": "institution_user"})
    headers = {"Authorization": f"Bearer {inst_login.json()['token']}"}

    # app-0005 belongs to inst-02 (Horizon College)
    res = client.get("/api/applications/app-0005/compliance", headers=headers)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]
