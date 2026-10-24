"""FastAPI router for Workflow Automation, Stage Transitions, Officer Assignments, and Decisions."""

import json
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.auth import get_current_session
from app.db import get_session
from app.models import (
    Application,
    AssignmentHistory,
    DecisionRecord,
    StageConfig,
    User,
)
from app.routers.applications import _check_app_access
from app.schemas import (
    AssignmentHistoryRead,
    AssignmentRequest,
    DecisionRecordRead,
    DecisionRecordRequest,
    OfficerSummary,
    StageConfigRead,
    StageConfigUpdate,
    StageReadinessResponse,
    StageReturnRequest,
    StageTransitionRequest,
    StageTransitionResponse,
)
from app.services.workflow_engine import WorkflowEngine

router = APIRouter(tags=["Workflow & Stage Automation"])


@router.get("/stages", response_model=list[StageConfigRead])
def list_stages(
    active_only: bool = True,
    db: Session = Depends(get_session),
    _: dict[str, Any] = Depends(get_current_session),
) -> list[StageConfigRead]:
    """Retrieve all configured approval workflow stages."""
    stages = WorkflowEngine.get_stages(db, active_only=active_only)
    return [
        StageConfigRead(
            id=s.id,
            name=s.name,
            order=s.order,
            description=s.description,
            responsible_role=s.responsible_role,
            requires_decision=s.requires_decision,
            allow_clarifications=s.allow_clarifications,
            is_terminal=s.is_terminal,
            is_active=s.is_active,
        )
        for s in stages
    ]


@router.put("/stages/{stage_id}", response_model=StageConfigRead)
def update_stage_config(
    stage_id: str,
    req: StageConfigUpdate,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> StageConfigRead:
    """Update workflow stage configuration (Administrator restricted)."""
    user_role = session.get("role")
    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Managing workflow stage configuration requires administrator permissions",
        )

    stage = db.get(StageConfig, stage_id)
    if not stage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stage configuration '{stage_id}' not found",
        )

    if req.name is not None:
        stage.name = req.name.strip()
    if req.description is not None:
        stage.description = req.description.strip()
    if req.responsible_role is not None:
        stage.responsible_role = req.responsible_role
    if req.requires_decision is not None:
        stage.requires_decision = req.requires_decision
    if req.allow_clarifications is not None:
        stage.allow_clarifications = req.allow_clarifications
    if req.is_active is not None:
        stage.is_active = req.is_active

    db.add(stage)
    db.commit()
    db.refresh(stage)

    return StageConfigRead(
        id=stage.id,
        name=stage.name,
        order=stage.order,
        description=stage.description,
        responsible_role=stage.responsible_role,
        requires_decision=stage.requires_decision,
        allow_clarifications=stage.allow_clarifications,
        is_terminal=stage.is_terminal,
        is_active=stage.is_active,
    )


@router.get("/users/officers", response_model=list[OfficerSummary])
def list_eligible_officers(
    db: Session = Depends(get_session),
    _: dict[str, Any] = Depends(get_current_session),
) -> list[OfficerSummary]:
    """Retrieve eligible scrutiny officers and their active assignment workload."""
    officers = list(
        db.exec(
            select(User).where(User.role.in_(["officer", "admin"])).where(User.is_active == True)  # noqa: E712
        ).all()
    )

    # Calculate active assignments count
    apps = list(db.exec(select(Application)).all())
    counts: dict[str, int] = {}
    for a in apps:
        if a.assigned_owner_id:
            counts[a.assigned_owner_id] = counts.get(a.assigned_owner_id, 0) + 1

    return [
        OfficerSummary(
            id=u.id,
            display_name=u.display_name,
            email=u.email,
            role=u.role,
            active_assignments_count=counts.get(u.id, 0),
        )
        for u in officers
    ]


@router.get("/applications/{application_id}/readiness", response_model=StageReadinessResponse)
def get_stage_readiness(
    application_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> StageReadinessResponse:
    """Evaluate current stage readiness and list all blocking conditions preventing advancement."""
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found",
        )

    _check_app_access(application, session)

    actor = db.get(User, session["user_id"])
    return WorkflowEngine.evaluate_stage_readiness(application, db, actor)


@router.post("/applications/{application_id}/advance", response_model=StageTransitionResponse)
def advance_application_stage(
    application_id: str,
    req: StageTransitionRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> StageTransitionResponse:
    """Advance an application to the next authorized regulatory approval stage."""
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

    return WorkflowEngine.advance_stage(
        application=application,
        target_stage_id=req.target_stage_id,
        actor=actor,
        note=req.note,
        override_blockers=req.override_blockers,
        override_reason=req.override_reason,
        db=db,
    )


@router.post("/applications/{application_id}/return", response_model=StageTransitionResponse)
def return_application_stage(
    application_id: str,
    req: StageReturnRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> StageTransitionResponse:
    """Return an application to an earlier stage for revisions, re-scrutiny, or corrections."""
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

    return WorkflowEngine.return_stage(
        application=application,
        target_stage_id=req.target_stage_id,
        return_reason=req.return_reason,
        actor=actor,
        db=db,
    )


@router.post("/applications/{application_id}/assign", response_model=AssignmentHistoryRead)
def assign_application_officer(
    application_id: str,
    req: AssignmentRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> AssignmentHistoryRead:
    """Assign or reassign an application to an eligible scrutiny officer with audit tracking."""
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

    history, _ = WorkflowEngine.assign_officer(
        application=application,
        target_owner_id=req.owner_id,
        actor=actor,
        reason=req.reason,
        db=db,
    )

    return AssignmentHistoryRead(
        id=history.id,
        application_id=history.application_id,
        assigned_by_id=history.assigned_by_id,
        assigned_by_name=history.assigned_by_name,
        previous_owner_id=history.previous_owner_id,
        previous_owner_name=history.previous_owner_name,
        new_owner_id=history.new_owner_id,
        new_owner_name=history.new_owner_name,
        reason=history.reason,
        assigned_at=history.assigned_at,
    )


@router.get("/applications/{application_id}/assignments", response_model=list[AssignmentHistoryRead])
def list_application_assignments(
    application_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> list[AssignmentHistoryRead]:
    """Retrieve assignment and reassignment audit history for an application."""
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found",
        )

    _check_app_access(application, session)

    records = list(
        db.exec(
            select(AssignmentHistory)
            .where(AssignmentHistory.application_id == application_id)
            .order_by(AssignmentHistory.assigned_at.desc())  # type: ignore[attr-defined]
        ).all()
    )

    return [
        AssignmentHistoryRead(
            id=r.id,
            application_id=r.application_id,
            assigned_by_id=r.assigned_by_id,
            assigned_by_name=r.assigned_by_name,
            previous_owner_id=r.previous_owner_id,
            previous_owner_name=r.previous_owner_name,
            new_owner_id=r.new_owner_id,
            new_owner_name=r.new_owner_name,
            reason=r.reason,
            assigned_at=r.assigned_at,
        )
        for r in records
    ]


@router.post("/applications/{application_id}/decision", response_model=DecisionRecordRead)
def record_application_decision(
    application_id: str,
    req: DecisionRecordRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> DecisionRecordRead:
    """Record an official authorized statutory regulatory decision (Approval / Rejection)."""
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

    record = WorkflowEngine.record_decision(
        application=application,
        decision=req.decision,
        reason=req.reason,
        conditions_or_remarks=req.conditions_or_remarks,
        reference_finding_ids=req.reference_finding_ids,
        override_blockers=req.override_blockers,
        override_reason=req.override_reason,
        actor=actor,
        db=db,
    )

    try:
        ref_findings = json.loads(record.reference_findings_json or "[]")
    except Exception:
        ref_findings = []

    return DecisionRecordRead(
        id=record.id,
        application_id=record.application_id,
        decided_by_id=record.decided_by_id,
        decided_by_name=record.decided_by_name,
        decision=record.decision,
        decision_reason=record.decision_reason,
        conditions_or_remarks=record.conditions_or_remarks,
        reference_findings=ref_findings,
        decided_at=record.decided_at,
    )


@router.get("/applications/{application_id}/decision", response_model=Optional[DecisionRecordRead])
def get_application_decision(
    application_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> Optional[DecisionRecordRead]:
    """Retrieve recorded statutory decision for an application if available."""
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found",
        )

    _check_app_access(application, session)

    record = db.exec(
        select(DecisionRecord).where(DecisionRecord.application_id == application_id)
    ).first()

    if not record:
        return None

    try:
        ref_findings = json.loads(record.reference_findings_json or "[]")
    except Exception:
        ref_findings = []

    return DecisionRecordRead(
        id=record.id,
        application_id=record.application_id,
        decided_by_id=record.decided_by_id,
        decided_by_name=record.decided_by_name,
        decision=record.decision,
        decision_reason=record.decision_reason,
        conditions_or_remarks=record.conditions_or_remarks,
        reference_findings=ref_findings,
        decided_at=record.decided_at,
    )
