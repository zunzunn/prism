"""Tests for document upload validation, storage, and authorized download/preview."""

import io
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def get_token(role: str) -> str:
    res = client.post("/api/demo-login", json={"role": role})
    assert res.status_code == 200
    return res.json()["token"]


def test_valid_pdf_upload():
    token = get_token("institution_user")  # belongs to inst-01
    pdf_content = b"%PDF-1.4 sample content for test"
    files = {"file": ("test_compliance_cert.pdf", io.BytesIO(pdf_content), "application/pdf")}
    data = {"category": "Safety Certificate"}

    response = client.post(
        "/api/applications/app-0001/documents",
        files=files,
        data=data,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    doc = response.json()
    assert doc["original_filename"] == "test_compliance_cert.pdf"
    assert doc["mime_type"] == "application/pdf"
    assert doc["file_size"] == len(pdf_content)
    assert doc["category"] == "Safety Certificate"

    # Verify download of uploaded document
    doc_id = doc["id"]
    dl_res = client.get(f"/api/documents/{doc_id}/file", headers={"Authorization": f"Bearer {token}"})
    assert dl_res.status_code == 200
    assert dl_res.content == pdf_content


def test_unsupported_file_type_rejected():
    token = get_token("institution_user")
    fake_exe = b"MZ executable content"
    files = {"file": ("malicious.exe", io.BytesIO(fake_exe), "application/octet-stream")}

    response = client.post(
        "/api/applications/app-0001/documents",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_extension_mismatch_rejected():
    token = get_token("institution_user")
    pdf_content = b"%PDF-1.4 real pdf but named png"
    files = {"file": ("document.png", io.BytesIO(pdf_content), "image/png")}

    response = client.post(
        "/api/applications/app-0001/documents",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "extension" in response.json()["detail"].lower()


def test_oversized_file_rejected():
    token = get_token("institution_user")
    # 10 MB + 100 bytes
    oversized_data = b"%PDF-1.4" + (b"0" * (10 * 1024 * 1024 + 100))
    files = {"file": ("huge_file.pdf", io.BytesIO(oversized_data), "application/pdf")}

    response = client.post(
        "/api/applications/app-0001/documents",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 400
    assert "exceeds maximum allowed size" in response.json()["detail"]


def test_unauthorized_upload_denial():
    # inst-01 user attempting to upload to inst-02 application
    token = get_token("institution_user")
    pdf_content = b"%PDF-1.4 content"
    files = {"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")}

    response = client.post(
        "/api/applications/app-0005/documents",
        files=files,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


def test_unauthorized_download_denial():
    # inst-01 user attempting to download doc-0004 (which belongs to app-0005 under inst-02)
    token = get_token("institution_user")
    response = client.get("/api/documents/doc-0004/file", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    assert "access denied" in response.json()["detail"].lower()


def test_download_nonexistent_document():
    token = get_token("officer")
    response = client.get("/api/documents/nonexistent-doc/file", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
