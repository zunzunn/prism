"""Document verification and findings API router."""

import json
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from app.auth import get_current_session
from app.db import get_session
from app.models import Application, AuditEvent, Document, DocumentExtraction, Finding, Institution, User, utc_now
from app.routers.applications import _check_app_access
from app.schemas import (
    DocumentExtractionRead,
    ExtractedFieldSchema,
    FindingRead,
    FindingReviewRequest,
    FindingReviewResponse,
    VerificationRunResponse,
)
from app.services.verification_pipeline import VerificationPipeline

router = APIRouter(tags=["Verification & Findings"])


def _to_finding_read(finding: Finding, document_name_map: dict[str, str]) -> FindingRead:
    return FindingRead(
        id=finding.id,
        application_id=finding.application_id,
        document_id=finding.document_id,
        document_name=document_name_map.get(finding.document_id or "") if finding.document_id else None,
        check_id=finding.check_id,
        category=finding.category,
        severity=finding.severity,
        title=finding.title,
        explanation=finding.explanation,
        extracted_value=finding.extracted_value,
        expected_value=finding.expected_value,
        evidence_snippet=finding.evidence_snippet,
        page_number=finding.page_number,
        source=finding.source,
        confidence=finding.confidence,
        review_state=finding.review_state,
        reviewed_by_id=finding.reviewed_by_id,
        reviewed_by_name=finding.reviewed_by_name,
        reviewed_at=finding.reviewed_at,
        note=finding.note,
        created_at=finding.created_at,
    )


@router.post("/documents/{document_id}/verify", response_model=VerificationRunResponse)
def verify_document(
    document_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> VerificationRunResponse:
    """Execute the verification pipeline on an authorized document.
    
    Extracts text, parses structured fields, and executes deterministic cross-checks
    against the application record.
    """
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found",
        )

    application = db.get(Application, document.application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated application '{document.application_id}' not found",
        )

    _check_app_access(application, session)

    actor = db.get(User, session["user_id"])
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user record not found",
        )

    institution = db.get(Institution, application.institution_id)
    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Institution '{application.institution_id}' not found",
        )

    extraction_rec, findings = VerificationPipeline.process_document(
        document=document,
        application=application,
        institution=institution,
        actor=actor,
        db=db,
    )

    doc_map = {document.id: document.original_filename}
    finding_reads = [_to_finding_read(f, doc_map) for f in findings]

    return VerificationRunResponse(
        document_id=document.id,
        application_id=application.id,
        extraction_status=extraction_rec.status,
        findings_created=len(findings),
        findings=finding_reads,
    )


@router.get("/documents/{document_id}/extraction", response_model=DocumentExtractionRead)
def get_document_extraction(
    document_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> DocumentExtractionRead:
    """Retrieve extraction results and structured fields for an authorized document."""
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found",
        )

    application = db.get(Application, document.application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated application '{document.application_id}' not found",
        )

    _check_app_access(application, session)

    extraction = db.exec(
        select(DocumentExtraction).where(DocumentExtraction.document_id == document_id)
    ).first()

    if not extraction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No extraction found for document '{document_id}'. Run verification first.",
        )

    extracted_fields: list[ExtractedFieldSchema] = []
    if extraction.extracted_fields_json:
        try:
            raw_fields = json.loads(extraction.extracted_fields_json)
            extracted_fields = [ExtractedFieldSchema(**f) for f in raw_fields]
        except Exception:
            extracted_fields = []

    return DocumentExtractionRead(
        id=extraction.id,
        document_id=extraction.document_id,
        application_id=extraction.application_id,
        status=extraction.status,
        page_count=extraction.page_count,
        extracted_text=extraction.extracted_text,
        extracted_fields=extracted_fields,
        processed_at=extraction.processed_at,
        error_message=extraction.error_message,
    )


@router.get("/applications/{application_id}/findings", response_model=list[FindingRead])
def get_application_findings(
    application_id: str,
    severity: Optional[str] = Query(None, description="Filter by severity: high | medium | low"),
    review_state: Optional[str] = Query(None, description="Filter by review state: needs_review | confirmed | dismissed"),
    category: Optional[str] = Query(None, description="Filter by category: Consistency | Validity | Completeness"),
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> list[FindingRead]:
    """Retrieve findings for an application with optional filtering."""
    app = db.get(Application, application_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{application_id}' not found",
        )

    _check_app_access(app, session)

    query = select(Finding).where(Finding.application_id == application_id)
    if severity:
        query = query.where(Finding.severity == severity)
    if review_state:
        query = query.where(Finding.review_state == review_state)
    if category:
        query = query.where(Finding.category == category)

    findings = db.exec(query.order_by(Finding.created_at.desc())).all()

    # Pre-fetch document filenames
    docs = db.exec(select(Document).where(Document.application_id == application_id)).all()
    doc_map = {d.id: d.original_filename for d in docs}

    return [_to_finding_read(f, doc_map) for f in findings]


@router.post("/findings/{finding_id}/review", response_model=FindingReviewResponse)
def review_finding(
    finding_id: str,
    payload: FindingReviewRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> FindingReviewResponse:
    """Record an authorized human review decision (confirm or dismiss) on a finding."""
    # RBAC check: only officer and admin can review findings
    role = session.get("role")
    if role not in ["officer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only regulatory officers or administrators can review findings.",
        )

    if payload.state not in ["confirmed", "dismissed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review state must be 'confirmed' or 'dismissed'.",
        )

    finding = db.get(Finding, finding_id)
    if not finding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Finding with ID '{finding_id}' not found",
        )

    app = db.get(Application, finding.application_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated application '{finding.application_id}' not found",
        )

    _check_app_access(app, session)

    actor = db.get(User, session["user_id"])
    now = utc_now()

    finding.review_state = payload.state
    finding.reviewed_by_id = actor.id if actor else session["user_id"]
    finding.reviewed_by_name = actor.display_name if actor else "Officer"
    finding.reviewed_at = now
    if payload.note is not None:
        finding.note = payload.note

    db.add(finding)

    # Record Audit Event
    audit = AuditEvent(
        id=f"evt-{utc_now().strftime('%Y%m%d%H%M%S')}-{finding.id[:6]}",
        actor_id=finding.reviewed_by_id,
        actor_name=finding.reviewed_by_name,
        actor_role=role,
        action=f"Finding review marked as {payload.state}",
        entity_type="finding",
        entity_id=finding.id,
        timestamp=now,
        detail=json.dumps({
            "finding_id": finding.id,
            "application_id": finding.application_id,
            "title": finding.title,
            "review_state": payload.state,
            "note": payload.note,
        }),
    )
    db.add(audit)
    db.commit()
    db.refresh(finding)

    doc = db.get(Document, finding.document_id) if finding.document_id else None
    doc_map = {doc.id: doc.original_filename} if doc else {}
    finding_read = _to_finding_read(finding, doc_map)

    return FindingReviewResponse(
        finding=finding_read,
        message=f"Finding '{finding.title}' successfully marked as {payload.state}.",
    )
