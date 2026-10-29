from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class VerifierRole(str, Enum):
    PUBLIC = "public"
    EMPLOYER = "employer"
    INSTITUTION = "institution"


class VerificationStatus(str, Enum):
    VERIFIED = "Verified Authentic"
    AWAITING_REVIEW = "Awaiting Institutional Review"
    CORRECTED = "Corrected & Cleared"
    INVALID = "Invalid / Revoked"
    EXPIRED = "Expired Reference"


class VerificationLookupRequest(BaseModel):
    reference: str = Field(..., description="Opaque verification reference (e.g. VRF-2026-V8892)")
    verifier_role: VerifierRole = Field(default=VerifierRole.PUBLIC, description="Role authorization level")
    verifier_organization: Optional[str] = Field(default="Screening Agent", description="Name of inquiring verifier")
    purpose: Optional[str] = Field(default="Academic Background Verification", description="Verification purpose")


class VerificationResultResponse(BaseModel):
    reference: str
    status: VerificationStatus
    is_valid: bool
    is_expired: bool
    student_name: str
    institution_name: str
    institution_code: str
    programme_name: str
    degree_level: str
    academic_year: str
    verification_date: str
    expires_at: Optional[str] = None
    cryptographic_proof_hash: str
    issuing_authority: str
    verifier_role: VerifierRole
    permitted_fields: Dict[str, Any]
    demo_disclaimer: str


class VerificationReceiptResponse(BaseModel):
    receipt_id: str
    reference: str
    status: VerificationStatus
    student_name: str
    institution_name: str
    programme_name: str
    degree_level: str
    academic_year: str
    verified_at: str
    issued_by: str
    digital_signature_hash: str
    verification_url: str
    disclaimer: str


class VerificationAuditEntry(BaseModel):
    id: str
    reference: str
    verifier_role: str
    verifier_organization: str
    purpose: str
    status: str
    accessed_at: str
    ip_address_hash: str
