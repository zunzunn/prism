import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_upload_valid_student_csv():
    csv_content = (
        "apaar_id,student_id,full_name,programme,academic_year,admission_category\n"
        "982344129011,COEP/2026/CS/001,Aarav Sharma,Computer Science,2026-27,General\n"
        "982344129012,COEP/2026/CS/002,Priya Sundaram,Computer Science,2026-27,OBC\n"
    )
    files = {"file": ("students.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/api/students/upload", files=files, data={"institution_code": "1-332901124"})
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] == 2
    assert data["valid_rows_count"] == 2
    assert data["rejected_rows_count"] == 0
    assert len(data["column_mapping_issues"]) == 0
    # Ensure APAAR is masked in output
    assert "••••" in data["row_results"][0]["apaar_id"]


def test_upload_invalid_file_extension():
    files = {"file": ("students.txt", io.BytesIO(b"random content"), "text/plain")}
    response = client.post("/api/students/upload", files=files)
    assert response.status_code == 400
    assert "Only RFC-4180 compliant .csv" in response.json()["detail"]


def test_upload_missing_required_columns():
    csv_content = (
        "student_id,full_name\n"
        "COEP/001,Student One\n"
    )
    files = {"file": ("incomplete.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/api/students/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "apaar_id" in data["column_mapping_issues"]
    assert "programme" in data["column_mapping_issues"]
    assert data["rejected_rows_count"] == 1


def test_upload_invalid_apaar_syntax_and_batch_duplicate():
    csv_content = (
        "apaar_id,student_id,full_name,programme,academic_year\n"
        "INVALID-APAAR,COEP/001,Student One,Mechanical,2026-27\n"
        "982344129015,COEP/002,Student Two,Mechanical,2026-27\n"
        "982344129015,COEP/003,Student Three,Mechanical,2026-27\n"  # Duplicate APAAR
    )
    files = {"file": ("batches.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    response = client.post("/api/students/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] == 3
    assert data["valid_rows_count"] == 1
    assert data["rejected_rows_count"] == 2

    # Check row 1 errors
    assert any("Invalid APAAR syntax" in err for err in data["row_results"][0]["errors"])
    # Check row 3 duplicate error
    assert any("Intra-batch duplicate" in err for err in data["row_results"][2]["errors"])


def test_list_students_api():
    response = client.get("/api/students?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "apaar_masked" in first
        assert "••••" in first["apaar_masked"]
