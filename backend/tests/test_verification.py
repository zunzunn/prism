"""Unit and integration tests for the Document Verification Engine."""

from datetime import datetime, timedelta, timezone
from pathlib import Path
import json
import pytest
import pymupdf as fitz
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from app.config import settings
from app.models import Application, AuditEvent, Document, DocumentExtraction, Finding, Institution, User
from app.services.document_processor import DocumentProcessor
from app.services.field_extractor import FieldExtractor
from app.services.verification_pipeline import VerificationPipeline
from main import app


def _create_pdf(lines: list[str]) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    y = 60
    for line in lines:
        page.insert_text((50, y), line, fontsize=11)
        y += 24
    b = doc.tobytes()
    doc.close()
    return b


def test_document_processor_extract_pdf(tmp_path: Path):
    """Test PDF text extraction across multiple lines and pages."""
    pdf_bytes = _create_pdf([
        "GOVERNMENT OF MAHARASHTRA",
        "Institution Name: Apex Institute of Technology",
        "Registration Deed No: DEED-9912",
        "Date of Registration: 10 Jan 2025",
    ])
    test_file = tmp_path / "valid.pdf"
    test_file.write_bytes(pdf_bytes)

    res = DocumentProcessor.extract_from_file(test_file, "application/pdf")
    assert res.status == "completed"
    assert res.page_count == 1
    assert "Apex Institute of Technology" in res.full_text
    assert len(res.pages) == 1
    assert res.error_message is None


def test_document_processor_empty_file(tmp_path: Path):
    """Test empty file handling without exceptions."""
    empty_file = tmp_path / "empty.pdf"
    empty_file.write_bytes(b"")

    res = DocumentProcessor.extract_from_file(empty_file, "application/pdf")
    assert res.status == "empty"
    assert res.page_count == 0
    assert "Document is empty" in (res.error_message or "")


def test_document_processor_corrupt_file(tmp_path: Path):
    """Test corrupt file handling safely."""
    corrupt_file = tmp_path / "corrupt.pdf"
    corrupt_file.write_bytes(b"This is not a real PDF at all")

    res = DocumentProcessor.extract_from_file(corrupt_file, "application/pdf")
    assert res.status == "failed"
    assert res.page_count == 0
    assert "Corrupt or unreadable" in (res.error_message or "")


def test_field_extractor_structured_fields():
    """Test field extraction for institution name, identifier, and dates."""
    pdf_bytes = _create_pdf([
        "Institution Name: Horizon College of Engineering",
        "Certificate No: CERT-HORIZON-2024-55",
        "Date of Issue: 15 Mar 2024",
        "Expiry date: 15 Mar 2027",
    ])
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = [DocumentProcessor._extract_pdf(Path("dummy")).pages[0] if False else None]
    # Re-extract via DocumentProcessor directly
    res = DocumentProcessor._extract_pdf_from_bytes = lambda b: None  # mock guard
    # Use real file for DocumentProcessor
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
        tf.write(pdf_bytes)
        tf_path = Path(tf.name)
    try:
        proc_res = DocumentProcessor.extract_from_file(tf_path, "application/pdf")
        fields = FieldExtractor.extract_fields(proc_res.full_text, proc_res.pages, "Safety Compliance")

        field_map = {f.field_name: f for f in fields}
        assert field_map["institution_name"].state == "extracted"
        assert field_map["institution_name"].extracted_value == "Horizon College of Engineering"
        assert field_map["document_identifier"].state == "extracted"
        assert field_map["document_identifier"].extracted_value == "CERT-HORIZON-2024-55"
        assert field_map["issuance_date"].state == "extracted"
        assert field_map["issuance_date"].extracted_value == "15 Mar 2024"
        assert field_map["expiry_date"].state == "extracted"
        assert field_map["expiry_date"].extracted_value == "15 Mar 2027"
    finally:
        tf_path.unlink(missing_ok=True)


def test_verification_pipeline_checks(tmp_path: Path):
    """Test deterministic regulatory cross-checks in VerificationPipeline."""
    now = datetime.now(timezone.utc)
    app = Application(
        id="test-app-01",
        ref="APP-TEST-01",
        institution_id="inst-test-01",
        application_type="EoA",
        academic_year="2026-2027",
        current_stage_id="stage-doc-check",
        current_status="in_progress",
        submission_timestamp=now - timedelta(days=10),
        created_at=now - timedelta(days=15),
        updated_at=now,
    )
    inst = Institution(
        id="inst-test-01",
        name="Apex Institute of Technology",
        code="INST-APEX",
        region="Western",
    )
    actor = User(
        id="usr-test-off",
        display_name="Test Officer",
        email="officer@test.example",
        role="officer",
    )

    # 1. Document with mismatched institution name and expired date
    pdf_bytes = _create_pdf([
        "FIRE SAFETY CERTIFICATE",
        "Institution Name: Zenith Academy of Science",
        "Certificate No: SAF-2022-01",
        "Date of Issue: 10 Jan 2022",
        "Expiry date: 10 Jan 2023",
    ])
    doc_file = settings.storage_dir / "test_mismatch.pdf"
    doc_file.write_bytes(pdf_bytes)

    doc = Document(
        id="test-doc-01",
        application_id=app.id,
        original_filename="Safety_Certificate.pdf",
        storage_filename="test_mismatch.pdf",
        mime_type="application/pdf",
        file_size=len(pdf_bytes),
        uploaded_by_id="usr-inst-01",
        category="Safety Compliance",
    )

    from app.db import engine
    with Session(engine) as session:
        session.add(inst)
        session.add(app)
        session.add(actor)
        session.add(doc)
        session.commit()

        ext, findings = VerificationPipeline.process_document(
            document=doc,
            application=app,
            institution=inst,
            actor=actor,
            db=session,
        )

        assert ext.status == "completed"
        check_ids = [f.check_id for f in findings]
        assert "CHK_INST_MATCH" in check_ids
        assert "CHK_EXPIRY_PAST" in check_ids

        # Clean up
        session.delete(doc)
        for f in findings:
            session.delete(f)
        session.delete(ext)
        session.delete(app)
        session.delete(inst)
        session.delete(actor)
        session.commit()

    doc_file.unlink(missing_ok=True)


def test_api_verify_document_endpoint():
    """Test POST /api/documents/{id}/verify endpoint."""
    client = TestClient(app)

    # Login as officer
    login_res = client.post("/api/demo-login", json={"role": "officer"})
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify doc-0001
    res = client.post("/api/documents/doc-0001/verify", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["document_id"] == "doc-0001"
    assert data["extraction_status"] == "completed"
    assert "findings" in data


def test_api_get_extraction_endpoint():
    """Test GET /api/documents/{id}/extraction endpoint."""
    client = TestClient(app)

    login_res = client.post("/api/demo-login", json={"role": "officer"})
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/documents/doc-0001/extraction", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["document_id"] == "doc-0001"
    assert data["status"] == "completed"
    assert len(data["extracted_fields"]) > 0


def test_api_get_findings_with_filters():
    """Test GET /api/applications/{id}/findings with severity and review_state filters."""
    client = TestClient(app)

    login_res = client.post("/api/demo-login", json={"role": "officer"})
    token = login_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # All findings for app-0001
    res = client.get("/api/applications/app-0001/findings", headers=headers)
    assert res.status_code == 200
    findings = res.json()
    assert len(findings) >= 2

    # Filter by severity
    res_high = client.get("/api/applications/app-0001/findings?severity=high", headers=headers)
    assert res_high.status_code == 200
    assert all(f["severity"] == "high" for f in res_high.json())


def test_api_review_finding_rbac_and_audit():
    """Test POST /api/findings/{id}/review with RBAC enforcement and audit generation."""
    client = TestClient(app)

    # 1. Institution user attempt -> 403 Forbidden
    inst_login = client.post("/api/demo-login", json={"role": "institution_user"})
    inst_token = inst_login.json()["token"]
    inst_headers = {"Authorization": f"Bearer {inst_token}"}

    # Fetch a finding
    off_login = client.post("/api/demo-login", json={"role": "officer"})
    off_token = off_login.json()["token"]
    off_headers = {"Authorization": f"Bearer {off_token}"}

    findings_res = client.get("/api/applications/app-0001/findings", headers=off_headers)
    assert findings_res.status_code == 200
    findings = findings_res.json()
    assert len(findings) > 0
    target_finding_id = findings[0]["id"]

    # Institution user tries to review -> 403
    forbidden_res = client.post(
        f"/api/findings/{target_finding_id}/review",
        json={"state": "confirmed", "note": "Unauthorized attempt"},
        headers=inst_headers,
    )
    assert forbidden_res.status_code == 403

    # Officer reviews -> 200 OK
    review_res = client.post(
        f"/api/findings/{target_finding_id}/review",
        json={"state": "confirmed", "note": "Verified with registrar record"},
        headers=off_headers,
    )
    assert review_res.status_code == 200
    review_data = review_res.json()
    assert review_data["finding"]["review_state"] == "confirmed"
    assert review_data["finding"]["reviewed_by_name"] == "Priya Sharma"
    assert review_data["finding"]["note"] == "Verified with registrar record"

    # Verify audit event was written
    audit_res = client.get("/api/applications/app-0001/audit", headers=off_headers)
    assert audit_res.status_code == 200
    audit_events = audit_res.json()
    assert any("Finding review marked as confirmed" in e["action"] for e in audit_events)
