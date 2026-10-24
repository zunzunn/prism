"""FastAPI router for Interlocutory Clarification Requests and Responses."""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.auth import get_current_session
from app.db import get_session
from app.models import Application, ClarificationRequest, User
from app.routers.applications import _check_app_access
from app.schemas import (
    ClarificationCancelRequest,
    ClarificationCreateRequest,
    ClarificationRequestRead,
    ClarificationResolveRequest,
    ClarificationResponseCreateRequest,
    ClarificationResponseRead,
)
from app.services.clarification_service import ClarificationService

router = APIRouter(tags=["Clarification Requests & Responses"])


@router.get(
    "/applications/{application_id}/clarifications",
    response_model=list[ClarificationRequestRead],
)
def list_application_clarifications(
    application_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> list[ClarificationRequestRead]:
    """Retrieve all clarification requests and response threads for an application."""
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found",
        )

    _check_app_access(application, session)
    return ClarificationService.get_application_clarifications(application_id, db)


@router.post(
    "/applications/{application_id}/clarifications",
    response_model=ClarificationRequestRead,
    status_code=status.HTTP_201_CREATED,
)
def create_clarification_request(
    application_id: str,
    req: ClarificationCreateRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> ClarificationRequestRead:
    """Initiate a formal clarification request for an application (Officers/Admins only)."""
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found",
        )

    _check_app_access(application, session)

    actor = db.get(User, session["user_id"])
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user record not found",
        )

    clr = ClarificationService.create_clarification(
        application=application,
        title=req.title,
        description=req.description,
        finding_id=req.finding_id,
        rule_code=req.rule_code,
        due_date=req.due_date,
        actor=actor,
        db=db,
    )

    # Return full read object
    all_clrs = ClarificationService.get_application_clarifications(application_id, db)
    for c in all_clrs:
        if c.id == clr.id:
            return c

    return ClarificationRequestRead(
        id=clr.id,
        application_id=clr.application_id,
        finding_id=clr.finding_id,
        rule_code=clr.rule_code,
        title=clr.title,
        description=clr.description,
        requested_by_id=clr.requested_by_id,
        requested_by_name=clr.requested_by_name,
        status=clr.status,
        due_date=clr.due_date,
        created_at=clr.created_at,
        updated_at=clr.updated_at,
        responses=[],
    )


@router.post(
    "/clarifications/{clarification_id}/reply",
    response_model=ClarificationResponseRead,
    status_code=status.HTTP_201_CREATED,
)
def reply_to_clarification(
    clarification_id: str,
    req: ClarificationResponseCreateRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> ClarificationResponseRead:
    """Submit a response to an open clarification request."""
    clr = db.get(ClarificationRequest, clarification_id)
    if not clr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clarification request '{clarification_id}' not found",
        )

    application = db.get(Application, clr.application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent application not found",
        )

    _check_app_access(application, session)

    actor = db.get(User, session["user_id"])
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user record not found",
        )

    resp = ClarificationService.submit_response(
        clarification=clr,
        application=application,
        message=req.message,
        document_id=req.document_id,
        actor=actor,
        db=db,
    )

    doc_name = None
    if resp.document_id:
        from app.models import Document

        doc = db.get(Document, resp.document_id)
        if doc:
            doc_name = doc.original_filename

    return ClarificationResponseRead(
        id=resp.id,
        clarification_id=resp.clarification_id,
        sender_id=resp.sender_id,
        sender_name=resp.sender_name,
        sender_role=resp.sender_role,
        message=resp.message,
        document_id=resp.document_id,
        document_name=doc_name,
        created_at=resp.created_at,
    )


@router.post(
    "/clarifications/{clarification_id}/resolve",
    response_model=ClarificationRequestRead,
)
def resolve_clarification_request(
    clarification_id: str,
    req: ClarificationResolveRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> ClarificationRequestRead:
    """Mark a clarification request as resolved (Officers/Admins only)."""
    clr = db.get(ClarificationRequest, clarification_id)
    if not clr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clarification request '{clarification_id}' not found",
        )

    application = db.get(Application, clr.application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent application not found",
        )

    _check_app_access(application, session)

    actor = db.get(User, session["user_id"])
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user record not found",
        )

    ClarificationService.resolve_clarification(
        clarification=clr,
        application=application,
        resolution_note=req.resolution_note,
        actor=actor,
        db=db,
    )

    all_clrs = ClarificationService.get_application_clarifications(application.id, db)
    for c in all_clrs:
        if c.id == clr.id:
            return c

    return ClarificationRequestRead(
        id=clr.id,
        application_id=clr.application_id,
        finding_id=clr.finding_id,
        rule_code=clr.rule_code,
        title=clr.title,
        description=clr.description,
        requested_by_id=clr.requested_by_id,
        requested_by_name=clr.requested_by_name,
        status=clr.status,
        due_date=clr.due_date,
        resolution_note=clr.resolution_note,
        resolved_by_id=clr.resolved_by_id,
        resolved_by_name=clr.resolved_by_name,
        resolved_at=clr.resolved_at,
        created_at=clr.created_at,
        updated_at=clr.updated_at,
        responses=[],
    )


@router.post(
    "/clarifications/{clarification_id}/cancel",
    response_model=ClarificationRequestRead,
)
def cancel_clarification_request(
    clarification_id: str,
    req: ClarificationCancelRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> ClarificationRequestRead:
    """Cancel a clarification request that is no longer required (Officers/Admins only)."""
    clr = db.get(ClarificationRequest, clarification_id)
    if not clr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clarification request '{clarification_id}' not found",
        )

    application = db.get(Application, clr.application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent application not found",
        )

    _check_app_access(application, session)

    actor = db.get(User, session["user_id"])
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user record not found",
        )

    ClarificationService.cancel_clarification(
        clarification=clr,
        application=application,
        reason=req.reason,
        actor=actor,
        db=db,
    )

    all_clrs = ClarificationService.get_application_clarifications(application.id, db)
    for c in all_clrs:
        if c.id == clr.id:
            return c

    return ClarificationRequestRead(
        id=clr.id,
        application_id=clr.application_id,
        finding_id=clr.finding_id,
        rule_code=clr.rule_code,
        title=clr.title,
        description=clr.description,
        requested_by_id=clr.requested_by_id,
        requested_by_name=clr.requested_by_name,
        status=clr.status,
        due_date=clr.due_date,
        resolution_note=clr.resolution_note,
        resolved_by_id=clr.resolved_by_id,
        resolved_by_name=clr.resolved_by_name,
        resolved_at=clr.resolved_at,
        created_at=clr.created_at,
        updated_at=clr.updated_at,
        responses=[],
    )
