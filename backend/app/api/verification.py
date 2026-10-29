from typing import List, Optional
from fastapi import APIRouter, Header, Query, status
from app.schemas.verification import (
    VerifierRole,
    VerificationLookupRequest,
    VerificationResultResponse,
    VerificationReceiptResponse,
    VerificationAuditEntry,
)
from app.services.verification_service import (
    verify_credential_reference,
    generate_verification_receipt,
    get_verification_audit_logs,
)

router = APIRouter(prefix="/verification", tags=["Academic Verification"])


@router.post(
    "/verify",
    response_model=VerificationResultResponse,
    summary="Verify an academic credential reference with role authorization",
)
def verify_credential(
    payload: VerificationLookupRequest,
    x_verifier_role: Optional[str] = Header(None, alias="X-Verifier-Role"),
):
    """
    Validates an opaque academic verification reference.
    Enforces authorization levels and restricts returned attributes accordingly.
    Raw APAAR IDs are NEVER disclosed.
    """
    # Use header override if supplied, otherwise payload role
    effective_role = payload.verifier_role
    if x_verifier_role:
        try:
            effective_role = VerifierRole(x_verifier_role.lower())
        except ValueError:
            pass

    return verify_credential_reference(
        reference=payload.reference,
        role=effective_role,
        organization=payload.verifier_organization or "Screening Partner",
        purpose=payload.purpose or "Credential Verification",
    )


@router.get(
    "/{reference}",
    response_model=VerificationResultResponse,
    summary="Inspect reference summary via controlled QR route",
)
def inspect_reference(
    reference: str,
    role: Optional[VerifierRole] = Query(VerifierRole.PUBLIC, description="Verifier access role"),
    org: Optional[str] = Query("Authorized Verifier", description="Organization name"),
):
    """
    Controlled route linked by QR codes.
    Returns restricted academic summary according to authorization role.
    """
    return verify_credential_reference(
        reference=reference,
        role=role or VerifierRole.PUBLIC,
        organization=org or "Authorized Verifier",
        purpose="QR Credential Verification Inspection",
    )


@router.get(
    "/receipt/{reference}",
    response_model=VerificationReceiptResponse,
    summary="Generate downloadable academic verification receipt",
)
def get_receipt(
    reference: str,
    role: Optional[VerifierRole] = Query(VerifierRole.EMPLOYER),
):
    """Generates official verification receipt with digital signature digest."""
    return generate_verification_receipt(reference=reference, role=role or VerifierRole.EMPLOYER)


@router.get(
    "/audit/logs",
    response_model=List[VerificationAuditEntry],
    summary="Retrieve compliance verification access audit logs",
)
def get_audit_trail():
    """Returns access logs without disclosing sensitive personal data."""
    return get_verification_audit_logs()
