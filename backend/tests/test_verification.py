import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_verify_valid_reference_public():
    response = client.post(
        "/api/verification/verify",
        json={
            "reference": "VRF-2026-V8892",
            "verifier_role": "public",
            "verifier_organization": "Public Portal",
            "purpose": "General Credential Check",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["reference"] == "VRF-2026-V8892"
    assert data["status"] == "Verified Authentic"
    assert data["is_valid"] is True
    assert data["is_expired"] is False
    assert data["student_name"] == "Aarav Sharma"
    assert data["institution_name"] == "College of Engineering, Pune (COEP)"
    assert data["programme_name"] == "Computer Science & Engineering"
    assert "cryptographic_proof_hash" in data
    assert "DEMONSTRATION ONLY" in data["demo_disclaimer"]

    # Restricted fields check: Public role must NOT see employer or institution confidential fields
    permitted = data["permitted_fields"]
    assert "candidate_name" in permitted
    assert "institution_name" in permitted
    assert "conferred_date" not in permitted
    assert "migration_clearance" not in permitted
    # Security constraint: Raw APAAR ID must NEVER be exposed
    assert "raw_apaar_secret" not in permitted
    assert "apaar_id" not in permitted


def test_verify_role_based_field_restriction():
    # Employer role gets completion status and conferred date
    emp_res = client.post(
        "/api/verification/verify",
        json={
            "reference": "VRF-2026-V8892",
            "verifier_role": "employer",
            "verifier_organization": "Tech Corp HR",
            "purpose": "Employment Background Verification",
        },
    )
    assert emp_res.status_code == 200
    emp_data = emp_res.json()
    emp_permitted = emp_data["permitted_fields"]
    assert "completion_status" in emp_permitted
    assert "conferred_date" in emp_permitted
    assert "cryptographic_hash_proof" in emp_permitted
    # But employer still cannot see institutional migration clearance
    assert "migration_clearance" not in emp_permitted
    assert "raw_apaar_secret" not in emp_permitted

    # Institution role gets migration clearance and admission category
    inst_res = client.post(
        "/api/verification/verify",
        json={
            "reference": "VRF-2026-V8892",
            "verifier_role": "institution",
            "verifier_organization": "IIT Bombay Admissions",
            "purpose": "Postgraduate Admissions Eligibility",
        },
    )
    assert inst_res.status_code == 200
    inst_permitted = inst_res.json()["permitted_fields"]
    assert "migration_clearance" in inst_permitted
    assert "admission_category" in inst_permitted
    assert "approval_order_ref" in inst_permitted
    assert "raw_apaar_secret" not in inst_permitted


def test_verify_awaiting_review_status():
    response = client.get("/api/verification/VRF-2026-R4109?role=employer")
    assert response.status_code == 200
    data = response.json()
    assert data["reference"] == "VRF-2026-R4109"
    assert data["status"] == "Awaiting Institutional Review"
    assert data["is_valid"] is False
    assert data["student_name"] == "Priya Patel"


def test_verify_corrected_duplicate_status():
    response = client.get("/api/verification/VRF-2026-D9901")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Corrected & Cleared"
    assert data["is_valid"] is True
    assert data["student_name"] == "Rohan Verma"


def test_verify_invalid_revoked_record():
    response = client.get("/api/verification/VRF-2026-X0012")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Invalid / Revoked"
    assert data["is_valid"] is False


def test_verify_expired_reference():
    response = client.get("/api/verification/VRF-2025-EXP99")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Expired Reference"
    assert data["is_valid"] is False
    assert data["is_expired"] is True


def test_verify_nonexistent_reference():
    response = client.get("/api/verification/VRF-9999-NOTFOUND")
    assert response.status_code == 404
    assert "not found in AICTE National Registry" in response.json()["detail"]


def test_verify_malformed_reference_rejected():
    # References that try to inject raw APAAR or malformed tokens must be rejected
    response = client.get("/api/verification/9823-4412-9011")
    assert response.status_code == 400
    assert "Invalid verification reference format" in response.json()["detail"]


def test_verification_receipt_generation():
    response = client.get("/api/verification/receipt/VRF-2026-V8892")
    assert response.status_code == 200
    receipt = response.json()
    assert "receipt_id" in receipt
    assert receipt["reference"] == "VRF-2026-V8892"
    assert receipt["status"] == "Verified Authentic"
    assert "digital_signature_hash" in receipt
    assert receipt["verification_url"] == "/verify/VRF-2026-V8892"


def test_verification_audit_logging():
    # Make a verification call
    client.post(
        "/api/verification/verify",
        json={
            "reference": "VRF-2026-V8892",
            "verifier_role": "employer",
            "verifier_organization": "Accenture Screening",
            "purpose": "Hiring Verification",
        },
    )

    # Query audit logs
    audit_res = client.get("/api/verification/audit/logs")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) > 0

    latest = logs[0]
    assert latest["verifier_organization"] == "Accenture Screening"
    assert latest["reference"] == "VRF-2026-V8892"
    assert "ip_address_hash" in latest
    # Ensure no raw personal identity is logged
    assert "raw_apaar" not in latest
