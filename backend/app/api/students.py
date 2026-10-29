import csv
import io
import re
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, status, Depends
from sqlalchemy.orm import Session

from app.schemas.student import (
    StudentCsvRowResult,
    StudentCsvUploadSummary,
    StudentRecordSummary,
)
from app.db.session import get_db
from app.models.student import Student
from app.models.institution import Institution
from app.services.verification_service import VERIFICATION_AUDIT_LOGS
from app.schemas.verification import VerificationAuditEntry

router = APIRouter(prefix="/students", tags=["Student Registry & Ingestion"])

REQUIRED_COLUMNS = ["apaar_id", "student_id", "full_name", "programme", "academic_year"]
MAX_CSV_BYTES = 5 * 1024 * 1024  # 5 MB


def mask_apaar_safe(raw_apaar: str) -> str:
    cleaned = re.sub(r"[-\s]", "", raw_apaar)
    if len(cleaned) == 12:
        return f"{cleaned[:2]}••-••••-{cleaned[-4:]}"
    elif len(cleaned) >= 8:
        return f"{cleaned[:2]}••••{cleaned[-4:]}"
    return "••••-••••-••••"


@router.post(
    "/upload",
    response_model=StudentCsvUploadSummary,
    summary="Batch upload student enrolment CSV with server-side validation",
)
async def upload_student_csv(
    file: UploadFile = File(...),
    institution_code: Optional[str] = Form("1-332901124"),
    db: Session = Depends(get_db),
):
    """
    Validates institutional student enrolment CSV batches server-side.
    Enforces required columns, APAAR formatting rules, intra-batch duplicate checks,
    and returns a row-by-row diagnostic report.
    """
    # 1. Filename & Extension check
    filename = file.filename or "enrolment.csv"
    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only RFC-4180 compliant .csv files are supported.",
        )

    # 2. File size & Content reading
    content = await file.read()
    if len(content) > MAX_CSV_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"CSV file exceeds maximum upload size limit of {MAX_CSV_BYTES // (1024 * 1024)}MB.",
        )

    try:
        decoded_text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            decoded_text = content.decode("latin-1")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to decode CSV file. Please upload a UTF-8 encoded CSV.",
            )

    # 3. CSV Parsing
    reader = csv.reader(io.StringIO(decoded_text))
    try:
        raw_headers = next(reader)
    except StopIteration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty.",
        )

    headers = [h.strip().lower().replace(" ", "_") for h in raw_headers if h.strip()]
    missing_columns = [col for col in REQUIRED_COLUMNS if col not in headers]

    # Map column names to indexes
    col_idx_map = {h: idx for idx, h in enumerate(headers)}

    row_results: List[StudentCsvRowResult] = []
    seen_apaars = set()
    seen_student_ids = set()

    valid_count = 0
    warning_count = 0
    rejected_count = 0

    batch_ref = f"BATCH-AICTE-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{len(content) % 9000 + 1000}"

    row_num = 0
    for raw_row in reader:
        if not any(raw_row):
            continue  # Skip blank rows
        row_num += 1

        row_dict = {}
        for h, idx in col_idx_map.items():
            row_dict[h] = raw_row[idx].strip() if idx < len(raw_row) else ""

        errors: List[str] = []
        warnings: List[str] = []

        apaar_val = row_dict.get("apaar_id", "")
        clean_apaar = re.sub(r"[-\s]", "", apaar_val)
        student_id_val = row_dict.get("student_id", "")
        name_val = row_dict.get("full_name", "")
        programme_val = row_dict.get("programme", "")
        category_val = row_dict.get("admission_category", "")

        # APAAR validations
        if not apaar_val:
            errors.append("Missing mandatory APAAR identifier.")
        elif not re.fullmatch(r"\d{12}", clean_apaar):
            errors.append(f"Invalid APAAR syntax: Expected 12 numeric digits, received '{apaar_val}'.")
        elif clean_apaar in seen_apaars:
            errors.append(f"Intra-batch duplicate: APAAR ID already present in earlier row of this batch.")
        else:
            seen_apaars.add(clean_apaar)

        # Student ID validations
        if not student_id_val:
            errors.append("Missing institutional student ID / Roll No.")
        elif student_id_val in seen_student_ids:
            errors.append(f"Intra-batch duplicate: Student Roll No '{student_id_val}' collision in batch.")
        else:
            seen_student_ids.add(student_id_val)

        if not name_val:
            errors.append("Missing student full name.")
        if not programme_val:
            errors.append("Missing academic programme.")

        # Warnings
        if category_val and category_val not in ["General", "OBC", "SC", "ST", "EWS", "General / Open", "OBC-NCL"]:
            warnings.push_warning = f"Non-standard category '{category_val}', will default to Open quota."
            warnings.append(warnings.push_warning)

        # Status determination
        if errors or missing_columns:
            status_str = "Rejected"
            rejected_count += 1
        elif warnings:
            status_str = "Warning"
            warning_count += 1
        else:
            status_str = "Valid"
            valid_count += 1

        row_results.append(
            StudentCsvRowResult(
                row_number=row_num,
                student_id=student_id_val or f"ROW-{row_num}",
                apaar_id=mask_apaar_safe(apaar_val),
                status=status_str,
                errors=errors,
                warnings=warnings,
                data={k: v for k, v in row_dict.items() if k != "apaar_id"},
            )
        )

    # 4. Record compliance audit entry
    audit_entry = VerificationAuditEntry(
        id=f"AUD-{len(VERIFICATION_AUDIT_LOGS) + 101}",
        reference=batch_ref,
        verifier_role="institution",
        verifier_organization=f"AICTE Node [{institution_code}]",
        purpose="CSV Batch Ingestion & Validation",
        status=f"{valid_count} Valid, {rejected_count} Rejected",
        accessed_at=datetime.now(timezone.utc).isoformat(),
        ip_address_hash="d41d8cd98f00b204e9800998ecf8427e",
    )
    VERIFICATION_AUDIT_LOGS.insert(0, audit_entry)

    return StudentCsvUploadSummary(
        file_name=filename,
        batch_reference=batch_ref,
        total_rows=row_num,
        valid_rows_count=valid_count,
        warning_rows_count=warning_count,
        rejected_rows_count=rejected_count,
        column_mapping_issues=missing_columns,
        row_results=row_results,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@router.get(
    "",
    response_model=List[StudentRecordSummary],
    summary="List student registry records with masked identifiers",
)
def list_students(
    institution_id: Optional[int] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Returns stored student records with strict privacy masking."""
    query = db.query(Student)
    if institution_id:
        query = query.filter(Student.institution_id == institution_id)

    students = query.offset(offset).limit(limit).all()

    results: List[StudentRecordSummary] = []
    for s in students:
        results.append(
            StudentRecordSummary(
                id=str(s.id),
                apaar_masked=mask_apaar_safe(s.apaar_id),
                enrollment_number=s.enrollment_number,
                full_name=s.full_name,
                institution_id=s.institution_id,
                institution_name=s.institution.name if s.institution else None,
                institution_code=s.institution.aicte_id if s.institution else None,
                program=s.program,
                batch_year=s.batch_year,
                cgpa=s.cgpa,
                verification_status=s.verification_status,
            )
        )
    return results
