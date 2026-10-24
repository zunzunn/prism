"""Clarification requests and institution responses service for PRISM."""

from datetime import datetime
import json
from typing import Optional
import uuid
from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.models import (
    Application,
    AuditEvent,
    ClarificationRequest,
    ClarificationResponse,
    Document,
    Finding,
    User,
    utc_now,
)
from app.schemas import ClarificationRequestRead, ClarificationResponseRead


class ClarificationService:
    """Service managing clarification threads, institution replies, and resolution lifecycle."""

    @staticmethod
    def create_clarification(
        application: Application,
        title: str,
        description: str,
        finding_id: Optional[str],
        rule_code: Optional[str],
        due_date: Optional[datetime],
        actor: User,
        db: Session,
    ) -> ClarificationRequest:
        """Create an interlocutory clarification request for an application."""
        if actor.role not in ["officer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Clarification requests can only be initiated by scrutiny officers or administrators",
            )

        if not title or not title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Clarification title / subject is required",
            )

        if not description or not description.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Clarification detailed explanation is required",
            )

        # Validate finding if provided
        if finding_id:
            finding = db.get(Finding, finding_id)
            if not finding or finding.application_id != application.id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Finding '{finding_id}' not found for this application",
                )

        now = utc_now()
        clr = ClarificationRequest(
            id=f"clr-{uuid.uuid4().hex[:10]}",
            application_id=application.id,
            finding_id=finding_id,
            rule_code=rule_code,
            title=title.strip(),
            description=description.strip(),
            requested_by_id=actor.id,
            requested_by_name=actor.display_name,
            status="open",
            due_date=due_date,
            created_at=now,
            updated_at=now,
        )
        db.add(clr)

        # Reflect in application status
        application.current_status = "awaiting_reply"
        application.updated_at = now
        db.add(application)

        # Audit event
        audit = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action="Clarification requested",
            entity_type="clarification_request",
            entity_id=clr.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "title": clr.title,
                    "application_id": application.id,
                    "finding_id": finding_id,
                    "due_date": due_date.isoformat() if due_date else None,
                }
            ),
        )
        db.add(audit)

        db.commit()
        db.refresh(clr)
        return clr

    @staticmethod
    def submit_response(
        clarification: ClarificationRequest,
        application: Application,
        message: str,
        document_id: Optional[str],
        actor: User,
        db: Session,
    ) -> ClarificationResponse:
        """Submit an institution reply with optional supporting document attachment."""
        if actor.role == "institution_user":
            if not actor.institution_id or application.institution_id != actor.institution_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only reply to clarifications for your own institution",
                )
        elif actor.role not in ["officer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized role for submitting clarification responses",
            )

        if clarification.status in ["resolved", "cancelled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reply: Clarification request is already '{clarification.status}'",
            )

        if not message or not message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Response message is required",
            )

        # Verify document attachment if provided
        if document_id:
            doc = db.get(Document, document_id)
            if not doc or doc.application_id != application.id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Attached document '{document_id}' not found for this application",
                )

        now = utc_now()
        resp = ClarificationResponse(
            id=f"clr-resp-{uuid.uuid4().hex[:10]}",
            clarification_id=clarification.id,
            sender_id=actor.id,
            sender_name=actor.display_name,
            sender_role=actor.role,
            message=message.strip(),
            document_id=document_id,
            created_at=now,
        )
        db.add(resp)

        # Update clarification status
        clarification.status = "responded"
        clarification.updated_at = now
        db.add(clarification)

        # Update application status
        application.current_status = "under_review"
        application.updated_at = now
        db.add(application)

        # Audit event
        audit = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action="Clarification response submitted",
            entity_type="clarification_response",
            entity_id=resp.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "clarification_id": clarification.id,
                    "application_id": application.id,
                    "has_document": bool(document_id),
                }
            ),
        )
        db.add(audit)

        db.commit()
        db.refresh(resp)
        db.refresh(clarification)
        return resp

    @staticmethod
    def resolve_clarification(
        clarification: ClarificationRequest,
        application: Application,
        resolution_note: str,
        actor: User,
        db: Session,
    ) -> ClarificationRequest:
        """Mark clarification request as resolved following officer review."""
        if actor.role not in ["officer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Resolving clarifications requires scrutiny officer or administrator permissions",
            )

        if not resolution_note or not resolution_note.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resolution note is required for regulatory audit trail",
            )

        now = utc_now()
        clarification.status = "resolved"
        clarification.resolution_note = resolution_note.strip()
        clarification.resolved_by_id = actor.id
        clarification.resolved_by_name = actor.display_name
        clarification.resolved_at = now
        clarification.updated_at = now
        db.add(clarification)

        # Audit event
        audit = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action="Clarification resolved",
            entity_type="clarification_request",
            entity_id=clarification.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "clarification_id": clarification.id,
                    "application_id": application.id,
                    "resolution_note": resolution_note.strip(),
                }
            ),
        )
        db.add(audit)

        db.commit()
        db.refresh(clarification)
        return clarification

    @staticmethod
    def cancel_clarification(
        clarification: ClarificationRequest,
        application: Application,
        reason: Optional[str],
        actor: User,
        db: Session,
    ) -> ClarificationRequest:
        """Cancel an open clarification request that is no longer required."""
        if actor.role not in ["officer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cancelling clarifications requires scrutiny officer or administrator permissions",
            )

        now = utc_now()
        clarification.status = "cancelled"
        clarification.resolution_note = reason or "Clarification cancelled by officer"
        clarification.resolved_by_id = actor.id
        clarification.resolved_by_name = actor.display_name
        clarification.resolved_at = now
        clarification.updated_at = now
        db.add(clarification)

        # Audit event
        audit = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action="Clarification cancelled",
            entity_type="clarification_request",
            entity_id=clarification.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "clarification_id": clarification.id,
                    "application_id": application.id,
                    "reason": reason,
                }
            ),
        )
        db.add(audit)

        db.commit()
        db.refresh(clarification)
        return clarification

    @staticmethod
    def get_application_clarifications(
        application_id: str,
        db: Session,
    ) -> list[ClarificationRequestRead]:
        """Fetch all clarification requests and response threads for an application."""
        requests = list(
            db.exec(
                select(ClarificationRequest)
                .where(ClarificationRequest.application_id == application_id)
                .order_by(ClarificationRequest.created_at.desc())  # type: ignore[attr-defined]
            ).all()
        )

        if not requests:
            return []

        req_ids = [r.id for r in requests]
        responses = list(
            db.exec(
                select(ClarificationResponse)
                .where(ClarificationResponse.clarification_id.in_(req_ids))  # type: ignore[attr-defined]
                .order_by(ClarificationResponse.created_at.asc())  # type: ignore[attr-defined]
            ).all()
        )
        resp_by_clr: dict[str, list[ClarificationResponse]] = {}
        for resp in responses:
            resp_by_clr.setdefault(resp.clarification_id, []).append(resp)

        # Fetch finding titles
        finding_ids = [r.finding_id for r in requests if r.finding_id]
        finding_map: dict[str, str] = {}
        if finding_ids:
            findings = list(db.exec(select(Finding).where(Finding.id.in_(finding_ids))).all())  # type: ignore[attr-defined]
            finding_map = {f.id: f.title for f in findings}

        # Fetch document names
        doc_ids = [resp.document_id for resp in responses if resp.document_id]
        doc_map: dict[str, str] = {}
        if doc_ids:
            docs = list(db.exec(select(Document).where(Document.id.in_(doc_ids))).all())  # type: ignore[attr-defined]
            doc_map = {d.id: d.original_filename for d in docs}

        reads: list[ClarificationRequestRead] = []
        for r in requests:
            resp_items = [
                ClarificationResponseRead(
                    id=rp.id,
                    clarification_id=rp.clarification_id,
                    sender_id=rp.sender_id,
                    sender_name=rp.sender_name,
                    sender_role=rp.sender_role,
                    message=rp.message,
                    document_id=rp.document_id,
                    document_name=doc_map.get(rp.document_id or "") if rp.document_id else None,
                    created_at=rp.created_at,
                )
                for rp in resp_by_clr.get(r.id, [])
            ]

            reads.append(
                ClarificationRequestRead(
                    id=r.id,
                    application_id=r.application_id,
                    finding_id=r.finding_id,
                    finding_title=finding_map.get(r.finding_id or ""),
                    rule_code=r.rule_code,
                    title=r.title,
                    description=r.description,
                    requested_by_id=r.requested_by_id,
                    requested_by_name=r.requested_by_name,
                    status=r.status,
                    due_date=r.due_date,
                    resolution_note=r.resolution_note,
                    resolved_by_id=r.resolved_by_id,
                    resolved_by_name=r.resolved_by_name,
                    resolved_at=r.resolved_at,
                    created_at=r.created_at,
                    updated_at=r.updated_at,
                    responses=resp_items,
                )
            )

        return reads
