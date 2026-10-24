"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    id: str
    display_name: str
    email: str
    role: str
    institution_id: Optional[str] = None
    institution_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DemoLoginRequest(BaseModel):
    role: str  # institution_user | officer | admin


class DemoLoginResponse(BaseModel):
    token: str
    user: UserRead


class InstitutionRead(BaseModel):
    id: str
    name: str
    code: str
    region: str

    model_config = ConfigDict(from_attributes=True)


class StageConfigRead(BaseModel):
    id: str
    name: str
    order: int
    is_terminal: bool

    model_config = ConfigDict(from_attributes=True)


class DocumentRead(BaseModel):
    id: str
    application_id: str
    original_filename: str
    mime_type: str
    file_size: int
    uploaded_by_id: str
    uploaded_by_name: Optional[str] = None
    uploaded_at: datetime
    category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ExtractedFieldSchema(BaseModel):
    field_name: str
    extracted_value: Optional[str] = None
    state: str  # extracted | uncertain | not_found
    page_number: Optional[int] = None
    evidence_snippet: Optional[str] = None


class DocumentExtractionRead(BaseModel):
    id: str
    document_id: str
    application_id: str
    status: str
    page_count: int
    extracted_text: Optional[str] = None
    extracted_fields: list[ExtractedFieldSchema] = []
    processed_at: datetime
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FindingRead(BaseModel):
    id: str
    application_id: str
    document_id: Optional[str] = None
    document_name: Optional[str] = None
    check_id: str
    category: str
    severity: str
    title: str
    explanation: str
    extracted_value: Optional[str] = None
    expected_value: Optional[str] = None
    evidence_snippet: Optional[str] = None
    page_number: Optional[int] = None
    source: str
    confidence: str
    review_state: str
    reviewed_by_id: Optional[str] = None
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    note: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FindingReviewRequest(BaseModel):
    state: str  # confirmed | dismissed
    note: Optional[str] = None


class FindingReviewResponse(BaseModel):
    finding: FindingRead
    message: str


class VerificationRunResponse(BaseModel):
    document_id: str
    application_id: str
    extraction_status: str
    findings_created: int
    findings: list[FindingRead]


class AuditEventRead(BaseModel):
    id: str
    actor_id: str
    actor_name: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: str
    timestamp: datetime
    detail: Optional[dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class ApplicationListItem(BaseModel):
    id: str
    ref: str
    institution_id: str
    institution_name: str
    application_type: str
    academic_year: str
    stage_id: str
    stage_name: str
    status: str
    owner_id: Optional[str] = None
    owner_name: Optional[str] = None
    submission_timestamp: Optional[datetime] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    is_priority: bool = False

    model_config = ConfigDict(from_attributes=True)


class ApplicationListResponse(BaseModel):
    items: list[ApplicationListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class ApplicationDetailResponse(BaseModel):
    application: ApplicationListItem
    stages: list[StageConfigRead]
    documents: list[DocumentRead]
    audit_events: list[AuditEventRead]
    findings: list[FindingRead] = []


class RegulatoryRuleRead(BaseModel):
    id: str
    rule_code: str
    version: str
    title: str
    description: str
    category: str
    applicable_types: list[str] = []
    evaluation_type: str
    severity: str
    mandatory_review: bool
    source_document: str
    source_section: str
    effective_from: datetime
    effective_until: Optional[datetime] = None
    is_synthetic: bool = False
    is_active: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RuleEvaluationRead(BaseModel):
    id: str
    application_id: str
    obligation_id: Optional[str] = None
    rule_code: str
    rule_version: str
    evaluation_batch_id: str
    status: str
    explanation: str
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    evidence_document_id: Optional[str] = None
    evidence_document_name: Optional[str] = None
    evidence_page: Optional[int] = None
    evidence_snippet: Optional[str] = None
    evaluator_type: str
    error_detail: Optional[str] = None
    evaluated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplianceObligationRead(BaseModel):
    id: str
    application_id: str
    rule_code: str
    rule_version: str
    title: str
    category: str
    severity: str
    status: str
    due_date: Optional[datetime] = None
    last_evaluated_at: Optional[datetime] = None
    review_status: str
    review_decision: Optional[str] = None
    reviewed_by_id: Optional[str] = None
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    rule_details: Optional[RegulatoryRuleRead] = None
    latest_evaluation: Optional[RuleEvaluationRead] = None

    model_config = ConfigDict(from_attributes=True)


class ComplianceSummaryRead(BaseModel):
    total_obligations: int
    satisfied_count: int
    pending_evidence_count: int
    needs_review_count: int
    not_satisfied_count: int
    unable_to_evaluate_count: int
    not_applicable_count: int
    last_evaluated_at: Optional[datetime] = None


class ApplicationComplianceResponse(BaseModel):
    application_id: str
    application_ref: str
    academic_year: str
    summary: ComplianceSummaryRead
    obligations: list[ComplianceObligationRead]


class ObligationReviewRequest(BaseModel):
    review_status: str  # "confirmed" | "overridden"
    decision: Optional[str] = None  # "satisfied" | "not_satisfied" | "exception_granted"
    notes: str


class ObligationReviewResponse(BaseModel):
    obligation: ComplianceObligationRead
    message: str

