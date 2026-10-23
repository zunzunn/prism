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
