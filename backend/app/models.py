"""SQLModel entities and database models for PRISM."""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    display_name: str
    email: str = Field(index=True, unique=True)
    role: str = Field(index=True)  # institution_user | officer | admin
    institution_id: Optional[str] = Field(default=None, index=True)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now)


class Institution(SQLModel, table=True):
    __tablename__ = "institutions"

    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    code: str = Field(index=True, unique=True)
    region: str
    created_at: datetime = Field(default_factory=utc_now)


class StageConfig(SQLModel, table=True):
    __tablename__ = "stage_configs"

    id: str = Field(primary_key=True)
    name: str
    order: int = Field(index=True)
    description: Optional[str] = Field(default=None)
    responsible_role: str = Field(default="officer")  # officer | admin | institution_user
    requires_decision: bool = Field(default=False)
    allow_clarifications: bool = Field(default=True)
    is_terminal: bool = Field(default=False)
    is_active: bool = Field(default=True)



class Application(SQLModel, table=True):
    __tablename__ = "applications"

    id: str = Field(primary_key=True)
    ref: str = Field(index=True, unique=True)  # DEMO-APP-0001
    institution_id: str = Field(index=True)
    application_type: str = Field(default="Extension of Approval (EoA)")
    academic_year: str = Field(default="2026-2027")
    current_stage_id: str = Field(index=True)
    current_status: str = Field(index=True)  # needs_attention, in_progress, overdue, on_track, etc.
    assigned_owner_id: Optional[str] = Field(default=None, index=True)
    submission_timestamp: Optional[datetime] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: str = Field(primary_key=True)
    application_id: str = Field(index=True)
    original_filename: str
    storage_filename: str = Field(unique=True, index=True)
    mime_type: str
    file_size: int
    uploaded_by_id: str = Field(index=True)
    uploaded_at: datetime = Field(default_factory=utc_now)
    category: Optional[str] = Field(default=None)


class DocumentExtraction(SQLModel, table=True):
    __tablename__ = "document_extractions"

    id: str = Field(primary_key=True)
    document_id: str = Field(index=True, unique=True)
    application_id: str = Field(index=True)
    status: str = Field(default="pending", index=True)  # pending | completed | empty | failed | unsupported
    page_count: int = Field(default=0)
    extracted_text: Optional[str] = Field(default=None)
    extracted_fields_json: Optional[str] = Field(default=None)  # JSON string of list[ExtractedField]
    processed_at: datetime = Field(default_factory=utc_now)
    error_message: Optional[str] = Field(default=None)


class Finding(SQLModel, table=True):
    __tablename__ = "findings"

    id: str = Field(primary_key=True)
    application_id: str = Field(index=True)
    document_id: Optional[str] = Field(default=None, index=True)
    check_id: str = Field(index=True)
    category: str = Field(default="Consistency")  # Consistency | Validity | Completeness
    severity: str = Field(index=True)  # high | medium | low
    title: str
    explanation: str
    extracted_value: Optional[str] = Field(default=None)
    expected_value: Optional[str] = Field(default=None)
    evidence_snippet: Optional[str] = Field(default=None)
    page_number: Optional[int] = Field(default=None)
    source: str = Field(default="rule")  # rule | ai_mock
    confidence: str = Field(default="high")  # high | medium | low
    review_state: str = Field(default="needs_review", index=True)  # needs_review | confirmed | dismissed
    reviewed_by_id: Optional[str] = Field(default=None)
    reviewed_by_name: Optional[str] = Field(default=None)
    reviewed_at: Optional[datetime] = Field(default=None)
    note: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now)


class AuditEvent(SQLModel, table=True):
    __tablename__ = "audit_events"

    id: str = Field(primary_key=True)
    actor_id: str = Field(index=True)
    actor_name: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: str = Field(index=True)
    timestamp: datetime = Field(default_factory=utc_now)
    detail: Optional[str] = Field(default=None)  # JSON string


class RegulatoryRule(SQLModel, table=True):
    __tablename__ = "regulatory_rules"

    id: str = Field(primary_key=True)
    rule_code: str = Field(index=True)  # e.g. RULE-LAND-01
    version: str = Field(default="1.0", index=True)
    title: str
    description: str
    category: str = Field(index=True)  # Land & Infrastructure, Safety & Statutory, etc.
    applicable_types_json: str = Field(default='["*"]')  # JSON list of application types
    evaluation_type: str = Field(index=True)  # document_presence, field_presence, certificate_expiry, date_order_validity, extracted_vs_record_match, mandatory_human_review, evidence_freshness
    check_config_json: str = Field(default="{}")  # JSON dict parameters for deterministic check
    severity: str = Field(default="high", index=True)  # high | medium | low
    mandatory_review: bool = Field(default=False)
    source_document: str = Field(default="AICTE Approval Process Handbook (APH 2024–2027)")
    source_section: str
    effective_from: datetime = Field(default_factory=utc_now)
    effective_until: Optional[datetime] = Field(default=None)
    is_synthetic: bool = Field(default=False)  # True if synthetic demonstration rule
    is_active: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=utc_now)


class ComplianceObligation(SQLModel, table=True):
    __tablename__ = "compliance_obligations"

    id: str = Field(primary_key=True)
    application_id: str = Field(index=True)
    rule_code: str = Field(index=True)
    rule_version: str = Field(default="1.0")
    title: str
    category: str
    severity: str = Field(default="high")
    status: str = Field(default="pending_evidence", index=True)  # satisfied | not_satisfied | pending_evidence | needs_review | unable_to_evaluate | not_applicable
    due_date: Optional[datetime] = Field(default=None, index=True)
    last_evaluated_at: Optional[datetime] = Field(default=None)
    review_status: str = Field(default="unreviewed", index=True)  # unreviewed | confirmed | overridden
    review_decision: Optional[str] = Field(default=None)  # satisfied | not_satisfied | exception_granted
    reviewed_by_id: Optional[str] = Field(default=None)
    reviewed_by_name: Optional[str] = Field(default=None)
    reviewed_at: Optional[datetime] = Field(default=None)
    review_notes: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class RuleEvaluation(SQLModel, table=True):
    __tablename__ = "rule_evaluations"

    id: str = Field(primary_key=True)
    application_id: str = Field(index=True)
    obligation_id: Optional[str] = Field(default=None, index=True)
    rule_code: str = Field(index=True)
    rule_version: str = Field(default="1.0")
    evaluation_batch_id: str = Field(index=True)
    status: str = Field(index=True)  # satisfied | not_satisfied | pending_evidence | needs_review | unable_to_evaluate | not_applicable
    explanation: str
    expected_value: Optional[str] = Field(default=None)
    actual_value: Optional[str] = Field(default=None)
    evidence_document_id: Optional[str] = Field(default=None, index=True)
    evidence_document_name: Optional[str] = Field(default=None)
    evidence_page: Optional[int] = Field(default=None)
    evidence_snippet: Optional[str] = Field(default=None)
    evaluator_type: str = Field(default="deterministic")  # deterministic | manual_review
    error_detail: Optional[str] = Field(default=None)
    evaluated_at: datetime = Field(default_factory=utc_now)


class AssignmentHistory(SQLModel, table=True):
    __tablename__ = "assignment_history"

    id: str = Field(primary_key=True)
    application_id: str = Field(index=True)
    assigned_by_id: str = Field(index=True)
    assigned_by_name: str
    previous_owner_id: Optional[str] = Field(default=None, index=True)
    previous_owner_name: Optional[str] = Field(default=None)
    new_owner_id: str = Field(index=True)
    new_owner_name: str
    reason: Optional[str] = Field(default=None)
    assigned_at: datetime = Field(default_factory=utc_now)


class ClarificationRequest(SQLModel, table=True):
    __tablename__ = "clarification_requests"

    id: str = Field(primary_key=True)
    application_id: str = Field(index=True)
    finding_id: Optional[str] = Field(default=None, index=True)
    rule_code: Optional[str] = Field(default=None, index=True)
    title: str
    description: str
    requested_by_id: str = Field(index=True)
    requested_by_name: str
    status: str = Field(default="open", index=True)  # open | responded | under_review | resolved | cancelled
    due_date: Optional[datetime] = Field(default=None, index=True)
    resolution_note: Optional[str] = Field(default=None)
    resolved_by_id: Optional[str] = Field(default=None)
    resolved_by_name: Optional[str] = Field(default=None)
    resolved_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class ClarificationResponse(SQLModel, table=True):
    __tablename__ = "clarification_responses"

    id: str = Field(primary_key=True)
    clarification_id: str = Field(index=True)
    sender_id: str = Field(index=True)
    sender_name: str
    sender_role: str  # institution_user | officer | admin
    message: str
    document_id: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=utc_now)


class DecisionRecord(SQLModel, table=True):
    __tablename__ = "decision_records"

    id: str = Field(primary_key=True)
    application_id: str = Field(index=True)
    decided_by_id: str = Field(index=True)
    decided_by_name: str
    decision: str = Field(index=True)  # approved | rejected
    decision_reason: str
    conditions_or_remarks: Optional[str] = Field(default=None)
    reference_findings_json: Optional[str] = Field(default=None)  # JSON list of finding IDs
    decided_at: datetime = Field(default_factory=utc_now)


