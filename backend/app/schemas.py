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
