"""Application management router with pagination, search, filtering, and role-based access control."""

from datetime import datetime, timezone
import json
from math import ceil
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, col, func, select
from app.auth import get_current_session
from app.db import get_session
from app.models import Application, AuditEvent, Document, Institution, StageConfig, User
from app.schemas import (
    ApplicationDetailResponse,
    ApplicationListItem,
    ApplicationListResponse,
    AuditEventRead,
    DocumentRead,
    StageConfigRead,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


def _check_app_access(app: Application, session: dict[str, Any]) -> None:
    """Enforce role-based access to an application."""
    user_role = session.get("role")
    user_inst_id = session.get("institution_id")

    if user_role == "institution_user":
        if not user_inst_id or app.institution_id != user_inst_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: you can only view applications belonging to your institution",
            )


@router.get("", response_model=ApplicationListResponse)
def list_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    institution_id: Optional[str] = Query(None),
    owner_id: Optional[str] = Query(None),
    needs_attention: Optional[bool] = Query(None),
    sort_by: str = Query("deadline"),
    sort_order: str = Query("asc"),
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> ApplicationListResponse:
    """List applications with server-side pagination, search, filtering, and role restrictions."""
    user_role = session.get("role")
    user_inst_id = session.get("institution_id")

    query = select(Application)

    # 1. Enforce Role Permissions
    if user_role == "institution_user":
        if not user_inst_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Institution user has no associated institution",
            )
        query = query.where(Application.institution_id == user_inst_id)
    elif institution_id:
        query = query.where(Application.institution_id == institution_id)

    # 2. Filters
    if stage:
        query = query.where(Application.current_stage_id == stage)

    if status_filter:
        query = query.where(Application.current_status == status_filter)

    if owner_id:
        query = query.where(Application.assigned_owner_id == owner_id)

    now = datetime.now(timezone.utc)
    if needs_attention is True:
        # Needs attention if status is needs_attention/overdue or deadline is in past
        query = query.where(
            (Application.current_status.in_(["needs_attention", "overdue"]))
            | (Application.due_date < now)
        )

    # 3. Search across ref and institution name
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        # Match ref or application_type or institution name
        subquery_inst_ids = select(Institution.id).where(
            func.lower(Institution.name).like(term) | func.lower(Institution.code).like(term)
        )
        query = query.where(
            func.lower(Application.ref).like(term)
            | func.lower(Application.application_type).like(term)
            | col(Application.institution_id).in_(subquery_inst_ids)
        )

    # Count total matching
    count_query = select(func.count()).select_from(query.subquery())
    total = db.exec(count_query).one()

    # 4. Sorting
    sort_col = Application.due_date
    if sort_by == "ref":
        sort_col = Application.ref
    elif sort_by == "status":
        sort_col = Application.current_status
    elif sort_by == "stage":
        sort_col = Application.current_stage_id
    elif sort_by == "updated_at":
        sort_col = Application.updated_at
    elif sort_by == "deadline":
        sort_col = Application.due_date

    if sort_order.lower() == "desc":
        query = query.order_by(col(sort_col).desc().nulls_last())
    else:
        query = query.order_by(col(sort_col).asc().nulls_last())

    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    apps = db.exec(query).all()

    # Prefetch lookups
    inst_map = {i.id: i.name for i in db.exec(select(Institution)).all()}
    stage_map = {s.id: s.name for s in db.exec(select(StageConfig)).all()}
    user_map = {u.id: u.display_name for u in db.exec(select(User)).all()}

    # Compute document counts
    app_ids = [a.id for a in apps]
    doc_counts: dict[str, int] = {}
    if app_ids:
        counts = db.exec(
            select(Document.application_id, func.count(Document.id))
            .where(col(Document.application_id).in_(app_ids))
            .group_by(Document.application_id)
        ).all()
        doc_counts = {app_id: count for app_id, count in counts}

    items = []
    for a in apps:
        is_priority = (
            a.current_status in ["needs_attention", "overdue"]
            or (a.due_date is not None and a.due_date < now)
        )
        items.append(
            ApplicationListItem(
                id=a.id,
                ref=a.ref,
                institution_id=a.institution_id,
                institution_name=inst_map.get(a.institution_id, "Unknown Institution"),
                application_type=a.application_type,
                academic_year=a.academic_year,
                stage_id=a.current_stage_id,
                stage_name=stage_map.get(a.current_stage_id, a.current_stage_id),
                status=a.current_status,
                owner_id=a.assigned_owner_id,
                owner_name=user_map.get(a.assigned_owner_id) if a.assigned_owner_id else None,
                submission_timestamp=a.submission_timestamp,
                due_date=a.due_date,
                created_at=a.created_at,
                updated_at=a.updated_at,
                document_count=doc_counts.get(a.id, 0),
                is_priority=is_priority,
            )
        )

    total_pages = ceil(total / page_size) if total > 0 else 1

    return ApplicationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{application_id}", response_model=ApplicationDetailResponse)
def get_application_detail(
    application_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> ApplicationDetailResponse:
    """Retrieve full application dossier with stage config, documents, and audit history."""
    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{application_id}' not found",
        )

    # Check permission
    _check_app_access(app, session)

    # Metadata
    inst = db.get(Institution, app.institution_id)
    stage = db.get(StageConfig, app.current_stage_id)
    owner = db.get(User, app.assigned_owner_id) if app.assigned_owner_id else None

    # Stages in order
    stages = db.exec(select(StageConfig).order_by(StageConfig.order.asc())).all()
    stage_reads = [
        StageConfigRead(
            id=s.id,
            name=s.name,
            order=s.order,
            is_terminal=s.is_terminal,
        )
        for s in stages
    ]

    # Documents
    user_map = {u.id: u.display_name for u in db.exec(select(User)).all()}
    docs = db.exec(
        select(Document)
        .where(Document.application_id == app.id)
        .order_by(Document.uploaded_at.desc())
    ).all()
    doc_reads = [
        DocumentRead(
            id=d.id,
            application_id=d.application_id,
            original_filename=d.original_filename,
            mime_type=d.mime_type,
            file_size=d.file_size,
            uploaded_by_id=d.uploaded_by_id,
            uploaded_by_name=user_map.get(d.uploaded_by_id, "Unknown User"),
            uploaded_at=d.uploaded_at,
            category=d.category,
        )
        for d in docs
    ]

    # Audit events
    events = db.exec(
        select(AuditEvent)
        .where(AuditEvent.entity_id.in_([app.id] + [d.id for d in docs]))
        .order_by(AuditEvent.timestamp.desc())
    ).all()
    
    event_reads = []
    for e in events:
        detail_obj = None
        if e.detail:
            try:
                detail_obj = json.loads(e.detail)
            except Exception:
                detail_obj = {"raw": e.detail}
        event_reads.append(
            AuditEventRead(
                id=e.id,
                actor_id=e.actor_id,
                actor_name=e.actor_name,
                actor_role=e.actor_role,
                action=e.action,
                entity_type=e.entity_type,
                entity_id=e.entity_id,
                timestamp=e.timestamp,
                detail=detail_obj,
            )
        )

    now = datetime.now(timezone.utc)
    is_priority = (
        app.current_status in ["needs_attention", "overdue"]
        or (app.due_date is not None and app.due_date < now)
    )

    app_item = ApplicationListItem(
        id=app.id,
        ref=app.ref,
        institution_id=app.institution_id,
        institution_name=inst.name if inst else "Unknown Institution",
        application_type=app.application_type,
        academic_year=app.academic_year,
        stage_id=app.current_stage_id,
        stage_name=stage.name if stage else app.current_stage_id,
        status=app.current_status,
        owner_id=app.assigned_owner_id,
        owner_name=owner.display_name if owner else None,
        submission_timestamp=app.submission_timestamp,
        due_date=app.due_date,
        created_at=app.created_at,
        updated_at=app.updated_at,
        document_count=len(docs),
        is_priority=is_priority,
    )

    return ApplicationDetailResponse(
        application=app_item,
        stages=stage_reads,
        documents=doc_reads,
        audit_events=event_reads,
    )


@router.get("/{application_id}/audit", response_model=list[AuditEventRead])
def get_application_audit_trail(
    application_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> list[AuditEventRead]:
    """Retrieve the audit log for a specific application."""
    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{application_id}' not found",
        )

    _check_app_access(app, session)

    events = db.exec(
        select(AuditEvent)
        .where(AuditEvent.entity_id == app.id)
        .order_by(AuditEvent.timestamp.desc())
    ).all()

    result = []
    for e in events:
        detail_obj = None
        if e.detail:
            try:
                detail_obj = json.loads(e.detail)
            except Exception:
                detail_obj = {"raw": e.detail}
        result.append(
            AuditEventRead(
                id=e.id,
                actor_id=e.actor_id,
                actor_name=e.actor_name,
                actor_role=e.actor_role,
                action=e.action,
                entity_type=e.entity_type,
                entity_id=e.entity_id,
                timestamp=e.timestamp,
                detail=detail_obj,
            )
        )
    return result
