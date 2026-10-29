from datetime import datetime, timezone
import hashlib
import re
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from app.schemas.verification import (
    VerifierRole,
    VerificationStatus,
    VerificationResultResponse,
    VerificationReceiptResponse,
    VerificationAuditEntry,
)

# Demo Synthetic Records
MOCK_VERIFICATION_RECORDS: Dict[str, Dict[str, Any]] = {
    # 1. Valid Example
    "VRF-2026-V8892": {
        "reference": "VRF-2026-V8892",
        "student_id": "STU-001",
        "full_name": "Aarav Sharma",
        "raw_apaar_secret": "9823-4412-9011",  # NEVER EXPOSED DIRECTLY
        "institution_name": "College of Engineering, Pune (COEP)",
        "institution_code": "1-332901124",
        "programme_name": "Computer Science & Engineering",
        "degree_level": "Undergraduate (B.Tech)",
        "academic_year": "2026-27",
        "status": VerificationStatus.VERIFIED,
        "is_valid": True,
        "is_expired": False,
        "verification_date": "2026-10-29T08:35:10Z",
        "expires_at": "2027-10-29T23:59:59Z",
        "completion_status": "Degree Completed with First Class Distinction",
        "conferred_date": "2026-06-15",
        "cgpa_public": 9.24,
        "migration_clearance": "Issued & Verified by DTE Maharashtra",
        "admission_category": "General / Open",
        "approval_order_ref": "AICTE/APH/2026/COEP/CS-240",
    },
    # 2. Record Awaiting Review
    "VRF-2026-R4109": {
        "reference": "VRF-2026-R4109",
        "student_id": "STU-002",
        "full_name": "Priya Patel",
        "raw_apaar_secret": "9823-7721-3401",
        "institution_name": "Delhi Technological University (DTU)",
        "institution_code": "1-882910344",
        "programme_name": "Information Technology",
        "degree_level": "Undergraduate (B.Tech)",
        "academic_year": "2026-27",
        "status": VerificationStatus.AWAITING_REVIEW,
        "is_valid": False,
        "is_expired": False,
        "verification_date": "2026-10-28T14:20:00Z",
        "expires_at": "2027-10-28T23:59:59Z",
        "completion_status": "Enrolled (Final Semester) - Pending Institutional Verification",
        "conferred_date": None,
        "cgpa_public": None,
        "migration_clearance": "Awaiting Dual-Counseling Clearance Certificate",
        "admission_category": "General / Open",
        "approval_order_ref": "AICTE/APH/2026/DTU/IT-360",
    },
    # 3. Resolved Duplicate Conflict Example
    "VRF-2026-D9901": {
        "reference": "VRF-2026-D9901",
        "student_id": "STU-003",
        "full_name": "Rohan Verma",
        "raw_apaar_secret": "9823-8891-2044",
        "institution_name": "College of Engineering, Pune (COEP)",
        "institution_code": "1-332901124",
        "programme_name": "Mechanical Engineering",
        "degree_level": "Undergraduate (B.Tech)",
        "academic_year": "2026-27",
        "status": VerificationStatus.CORRECTED,
        "is_valid": True,
        "is_expired": False,
        "verification_date": "2026-10-27T11:15:30Z",
        "expires_at": "2027-10-27T23:59:59Z",
        "completion_status": "Active Regular Enrolment - Cleared",
        "conferred_date": None,
        "cgpa_public": 8.75,
        "migration_clearance": "Dual-enrolment conflict resolved via State DTE cancellation certificate",
        "admission_category": "OBC-NCL",
        "approval_order_ref": "AICTE/APH/2026/COEP/ME-240",
    },
    # 4. Invalid / Revoked Record Example
    "VRF-2026-X0012": {
        "reference": "VRF-2026-X0012",
        "student_id": "STU-004",
        "full_name": "Sneha Nair",
        "raw_apaar_secret": "9823-9999-0000",
        "institution_name": "Unaccredited Technical Institute",
        "institution_code": "1-000000000",
        "programme_name": "Unapproved Computer Engineering",
        "degree_level": "Undergraduate (B.Tech)",
        "academic_year": "2026-27",
        "status": VerificationStatus.INVALID,
        "is_valid": False,
        "is_expired": False,
        "verification_date": "2026-10-26T09:00:00Z",
        "expires_at": "2027-10-26T09:00:00Z",
        "completion_status": "Revoked / Unapproved Admission Exceeding Quota Cap",
        "conferred_date": None,
        "cgpa_public": None,
        "migration_clearance": "Revoked: Programme intake exceeds approved AICTE statutory quota",
        "admission_category": "Unrecognized Category",
        "approval_order_ref": "INVALID-NO-APPROVAL-LETTER",
    },
    # 5. Expired Reference Example
    "VRF-2025-EXP99": {
        "reference": "VRF-2025-EXP99",
        "student_id": "STU-005",
        "full_name": "Aditya Joshi",
        "raw_apaar_secret": "9823-1122-3344",
        "institution_name": "PSG College of Technology, Coimbatore",
        "institution_code": "1-558291023",
        "programme_name": "Electrical & Electronics Engg",
        "degree_level": "Undergraduate (B.Tech)",
        "academic_year": "2024-25",
        "status": VerificationStatus.EXPIRED,
        "is_valid": False,
        "is_expired": True,
        "verification_date": "2024-10-15T10:00:00Z",
        "expires_at": "2025-10-15T23:59:59Z",  # Expired in past!
        "completion_status": "Completed - Reference Expired",
        "conferred_date": "2024-06-20",
        "cgpa_public": 8.90,
        "migration_clearance": "Standard Clearance",
        "admission_category": "General / Open",
        "approval_order_ref": "AICTE/APH/2024/PSG/EEE-120",
    },
}

# Audit log store
VERIFICATION_AUDIT_LOGS: List[VerificationAuditEntry] = []


def generate_sha256_proof(reference: str, status_str: str) -> str:
    """Deterministic cryptographic proof digest of verification verification event."""
    payload = f"CREDEN:AICTE:{reference}:{status_str}:REGISTRY_SEAL_V2"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def check_reference_format(reference: str) -> bool:
    """Validates opaque format without permitting raw APAAR numbers."""
    if not reference or len(reference) > 32 or len(reference) < 6:
        return False
    # Must match opaque pattern VRF-...
    return bool(re.match(r"^VRF-[A-Z0-9-]+$", reference.strip().upper()))


def verify_credential_reference(
    reference: str,
    role: VerifierRole = VerifierRole.PUBLIC,
    organization: str = "Authorized Screening Agent",
    purpose: str = "Academic Background Verification",
) -> VerificationResultResponse:
    clean_ref = reference.strip().upper()

    if not check_reference_format(clean_ref):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification reference format: '{reference}'. References must be opaque alphanumeric identifiers (e.g. VRF-2026-V8892).",
        )

    record = MOCK_VERIFICATION_RECORDS.get(clean_ref)
    if not record:
        # Record audit of failed attempt
        now_iso = datetime.now(timezone.utc).isoformat()
        VERIFICATION_AUDIT_LOGS.insert(
            0,
            VerificationAuditEntry(
                id=f"AUD-VRF-{int(datetime.now().timestamp() * 1000)}",
                reference=clean_ref,
                verifier_role=role.value,
                verifier_organization=organization,
                purpose=purpose,
                status="NOT_FOUND",
                accessed_at=now_iso,
                ip_address_hash=hashlib.sha256(b"127.0.0.1").hexdigest()[:16],
            ),
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification reference '{clean_ref}' not found in AICTE National Registry. Check the reference code or request an updated QR pass from candidate.",
        )

    # Check expiration
    now = datetime.now(timezone.utc)
    is_expired = record["is_expired"]
    if record.get("expires_at"):
        try:
            exp_dt = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))
            if now > exp_dt:
                is_expired = True
        except Exception:
            pass

    current_status = VerificationStatus.EXPIRED if is_expired else record["status"]
    is_valid = record["is_valid"] and not is_expired

    # Cryptographic proof
    proof_hash = generate_sha256_proof(clean_ref, current_status.value)

    # RESTRICTED FIELDS ENFORCEMENT BASED ON VERIFIER ROLE:
    # Notice: Raw APAAR ID is NEVER permitted or returned under any role!
    permitted_fields: Dict[str, Any] = {
        "candidate_name": record["full_name"],
        "institution_name": record["institution_name"],
        "institution_code": record["institution_code"],
        "programme_name": record["programme_name"],
        "degree_level": record["degree_level"],
        "academic_year": record["academic_year"],
        "verification_status": current_status.value,
        "verified_on": record["verification_date"],
    }

    if role == VerifierRole.EMPLOYER or role == VerifierRole.INSTITUTION:
        # Authorized Employer gets completion status and conferring date
        permitted_fields["completion_status"] = record.get("completion_status")
        permitted_fields["conferred_date"] = record.get("conferred_date")
        permitted_fields["cryptographic_hash_proof"] = proof_hash

    if role == VerifierRole.INSTITUTION:
        # Institution Registrar gets migration clearance and admission quota reference
        permitted_fields["migration_clearance"] = record.get("migration_clearance")
        permitted_fields["admission_category"] = record.get("admission_category")
        permitted_fields["approval_order_ref"] = record.get("approval_order_ref")

    # Record successful audit attempt (no sensitive student info logged)
    now_iso = datetime.now(timezone.utc).isoformat()
    VERIFICATION_AUDIT_LOGS.insert(
        0,
        VerificationAuditEntry(
            id=f"AUD-VRF-{int(datetime.now().timestamp() * 1000)}",
            reference=clean_ref,
            verifier_role=role.value,
            verifier_organization=organization,
            purpose=purpose,
            status=current_status.value,
            accessed_at=now_iso,
            ip_address_hash=hashlib.sha256(b"127.0.0.1").hexdigest()[:16],
        ),
    )

    return VerificationResultResponse(
        reference=clean_ref,
        status=current_status,
        is_valid=is_valid,
        is_expired=is_expired,
        student_name=record["full_name"],
        institution_name=record["institution_name"],
        institution_code=record["institution_code"],
        programme_name=record["programme_name"],
        degree_level=record["degree_level"],
        academic_year=record["academic_year"],
        verification_date=record["verification_date"],
        expires_at=record.get("expires_at"),
        cryptographic_proof_hash=proof_hash,
        issuing_authority="AICTE Central Governance & Verification Service",
        verifier_role=role,
        permitted_fields=permitted_fields,
        demo_disclaimer="DEMONSTRATION ONLY: Synthetic test record generated for evaluation environment. Does not constitute an official statutory degree verification under Indian Law.",
    )


def generate_verification_receipt(
    reference: str, role: VerifierRole = VerifierRole.PUBLIC
) -> VerificationReceiptResponse:
    clean_ref = reference.strip().upper()
    result = verify_credential_reference(clean_ref, role)

    receipt_id = f"RCP-AICTE-{clean_ref.replace('VRF-', '')}-{datetime.now().strftime('%Y%m%d')}"
    return VerificationReceiptResponse(
        receipt_id=receipt_id,
        reference=clean_ref,
        status=result.status,
        student_name=result.student_name,
        institution_name=result.institution_name,
        programme_name=result.programme_name,
        degree_level=result.degree_level,
        academic_year=result.academic_year,
        verified_at=datetime.now(timezone.utc).isoformat(),
        issued_by="AICTE National Academic Credential Verification Authority",
        digital_signature_hash=result.cryptographic_proof_hash,
        verification_url=f"/verify/{clean_ref}",
        disclaimer="OFFICIAL VERIFICATION RECEIPT (DEMONSTRATION SANDBOX). Verifiable via AICTE digital node signature.",
    )


def get_verification_audit_logs() -> List[VerificationAuditEntry]:
    return VERIFICATION_AUDIT_LOGS
