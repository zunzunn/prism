"""FastAPI router for Regulatory Rules Engine & Compliance Monitoring."""

import json
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from app.auth import get_current_session
from app.db import get_session
from app.models import Application, ComplianceObligation, RegulatoryRule, RuleEvaluation, User
from app.routers.applications import _check_app_access
from app.schemas import (
    ApplicationComplianceResponse,
    ComplianceObligationRead,
    ComplianceSummaryRead,
    ObligationReviewRequest,
    ObligationReviewResponse,
    RegulatoryRuleRead,
    RuleEvaluationRead,
)
from app.services.rules_engine import RulesEngine

router = APIRouter(tags=["Compliance & Rules Engine"])


def _to_rule_read(rule: RegulatoryRule) -> RegulatoryRuleRead:
    try:
        applicable_types = json.loads(rule.applicable_types_json)
    except Exception:
        applicable_types = ["*"]

    return RegulatoryRuleRead(
        id=rule.id,
        rule_code=rule.rule_code,
        version=rule.version,
        title=rule.title,
        description=rule.description,
        category=rule.category,
        applicable_types=applicable_types,
        evaluation_type=rule.evaluation_type,
        severity=rule.severity,
        mandatory_review=rule.mandatory_review,
        source_document=rule.source_document,
        source_section=rule.source_section,
        effective_from=rule.effective_from,
        effective_until=rule.effective_until,
        is_synthetic=rule.is_synthetic,
        is_active=rule.is_active,
        created_at=rule.created_at,
    )


def _to_eval_read(e: RuleEvaluation) -> RuleEvaluationRead:
    return RuleEvaluationRead(
        id=e.id,
        application_id=e.application_id,
        obligation_id=e.obligation_id,
        rule_code=e.rule_code,
        rule_version=e.rule_version,
        evaluation_batch_id=e.evaluation_batch_id,
        status=e.status,
        explanation=e.explanation,
        expected_value=e.expected_value,
        actual_value=e.actual_value,
        evidence_document_id=e.evidence_document_id,
        evidence_document_name=e.evidence_document_name,
        evidence_page=e.evidence_page,
        evidence_snippet=e.evidence_snippet,
        evaluator_type=e.evaluator_type,
        error_detail=e.error_detail,
        evaluated_at=e.evaluated_at,
    )


def _build_compliance_response(
    application: Application,
    obligations: list[ComplianceObligation],
    db: Session,
) -> ApplicationComplianceResponse:
    rules = RulesEngine.ensure_default_rules(db)
    rules_by_code_version = {(r.rule_code, r.version): r for r in rules}
    # Fallback by code
    rules_by_code = {r.rule_code: r for r in rules}

    # Fetch latest evaluation per obligation
    evaluations = list(
        db.exec(
            select(RuleEvaluation)
            .where(RuleEvaluation.application_id == application.id)
            .order_by(RuleEvaluation.evaluated_at.desc())  # type: ignore[attr-defined]
        ).all()
    )
    latest_eval_by_obligation: dict[str, RuleEvaluation] = {}
    for ev in evaluations:
        if ev.obligation_id and ev.obligation_id not in latest_eval_by_obligation:
            latest_eval_by_obligation[ev.obligation_id] = ev
        elif ev.rule_code not in latest_eval_by_obligation:
            latest_eval_by_obligation[ev.rule_code] = ev

    counts = {
        "satisfied": 0,
        "not_satisfied": 0,
        "pending_evidence": 0,
        "needs_review": 0,
        "unable_to_evaluate": 0,
        "not_applicable": 0,
    }

    obligation_reads: list[ComplianceObligationRead] = []
    latest_ts = None

    for o in obligations:
        rule_entity = rules_by_code_version.get((o.rule_code, o.rule_version)) or rules_by_code.get(o.rule_code)
        rule_read = _to_rule_read(rule_entity) if rule_entity else None
        latest_eval = latest_eval_by_obligation.get(o.id) or latest_eval_by_obligation.get(o.rule_code)
        eval_read = _to_eval_read(latest_eval) if latest_eval else None

        counts[o.status] = counts.get(o.status, 0) + 1
        if o.last_evaluated_at and (latest_ts is None or o.last_evaluated_at > latest_ts):
            latest_ts = o.last_evaluated_at

        obligation_reads.append(
            ComplianceObligationRead(
                id=o.id,
                application_id=o.application_id,
                rule_code=o.rule_code,
                rule_version=o.rule_version,
                title=o.title,
                category=o.category,
                severity=o.severity,
                status=o.status,
                due_date=o.due_date,
                last_evaluated_at=o.last_evaluated_at,
                review_status=o.review_status,
                review_decision=o.review_decision,
                reviewed_by_id=o.reviewed_by_id,
                reviewed_by_name=o.reviewed_by_name,
                reviewed_at=o.reviewed_at,
                review_notes=o.review_notes,
                rule_details=rule_read,
                latest_evaluation=eval_read,
            )
        )

    summary = ComplianceSummaryRead(
        total_obligations=len(obligations),
        satisfied_count=counts["satisfied"],
        pending_evidence_count=counts["pending_evidence"],
        needs_review_count=counts["needs_review"],
        not_satisfied_count=counts["not_satisfied"],
        unable_to_evaluate_count=counts["unable_to_evaluate"],
        not_applicable_count=counts["not_applicable"],
        last_evaluated_at=latest_ts,
    )

    return ApplicationComplianceResponse(
        application_id=application.id,
        application_ref=application.ref,
        academic_year=application.academic_year,
        summary=summary,
        obligations=obligation_reads,
    )


@router.get("/rules", response_model=list[RegulatoryRuleRead])
def list_rules(
    category: Optional[str] = Query(None),
    is_synthetic: Optional[bool] = Query(None),
    active_only: bool = Query(True),
    db: Session = Depends(get_session),
    _: dict[str, Any] = Depends(get_current_session),
) -> list[RegulatoryRuleRead]:
    """List regulatory compliance rules, authoritative citations, and check definitions."""
    RulesEngine.ensure_default_rules(db)
    stmt = select(RegulatoryRule)
    if active_only:
        stmt = stmt.where(RegulatoryRule.is_active == True)  # noqa: E712
    if category:
        stmt = stmt.where(RegulatoryRule.category == category)
    if is_synthetic is not None:
        stmt = stmt.where(RegulatoryRule.is_synthetic == is_synthetic)

    rules = list(db.exec(stmt.order_by(RegulatoryRule.rule_code)).all())  # type: ignore[attr-defined]
    return [_to_rule_read(r) for r in rules]


@router.get("/rules/{rule_code}/versions", response_model=list[RegulatoryRuleRead])
def list_rule_versions(
    rule_code: str,
    db: Session = Depends(get_session),
    _: dict[str, Any] = Depends(get_current_session),
) -> list[RegulatoryRuleRead]:
    """Retrieve all historical and upcoming versions of a specific regulatory rule."""
    RulesEngine.ensure_default_rules(db)
    stmt = select(RegulatoryRule).where(RegulatoryRule.rule_code == rule_code).order_by(RegulatoryRule.version.desc())  # type: ignore[attr-defined]
    rules = list(db.exec(stmt).all())
    if not rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Rule with code '{rule_code}' not found",
        )
    return [_to_rule_read(r) for r in rules]


@router.get("/applications/{application_id}/compliance", response_model=ApplicationComplianceResponse)
def get_application_compliance(
    application_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> ApplicationComplianceResponse:
    """Retrieve compliance status, requirements, and latest evaluation for an application."""
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found",
        )

    _check_app_access(application, session)

    obligations = RulesEngine.ensure_application_obligations(application, db)

    # If never evaluated, perform initial evaluation
    has_eval = any(o.last_evaluated_at is not None for o in obligations)
    if not has_eval:
        actor = db.get(User, session["user_id"])
        _, obligations = RulesEngine.evaluate_application(
            application=application,
            db=db,
            actor=actor,
            trigger="initial_fetch",
        )

    return _build_compliance_response(application, obligations, db)


@router.post("/applications/{application_id}/compliance/evaluate", response_model=ApplicationComplianceResponse)
def evaluate_application_compliance(
    application_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> ApplicationComplianceResponse:
    """Trigger on-demand deterministic evaluation of all compliance obligations for an application."""
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

    _, obligations = RulesEngine.evaluate_application(
        application=application,
        db=db,
        actor=actor,
        trigger="user_requested",
    )

    return _build_compliance_response(application, obligations, db)


@router.get("/applications/{application_id}/compliance/history", response_model=list[RuleEvaluationRead])
def get_compliance_history(
    application_id: str,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> list[RuleEvaluationRead]:
    """Retrieve auditable history of all compliance rule evaluations performed for an application."""
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{application_id}' not found",
        )

    _check_app_access(application, session)

    evaluations = list(
        db.exec(
            select(RuleEvaluation)
            .where(RuleEvaluation.application_id == application.id)
            .order_by(RuleEvaluation.evaluated_at.desc())  # type: ignore[attr-defined]
        ).all()
    )
    return [_to_eval_read(e) for e in evaluations]


@router.post("/compliance/obligations/{obligation_id}/review", response_model=ObligationReviewResponse)
def review_obligation(
    obligation_id: str,
    req: ObligationReviewRequest,
    session: dict[str, Any] = Depends(get_current_session),
    db: Session = Depends(get_session),
) -> ObligationReviewResponse:
    """Record an authorized officer or admin review decision / override on a compliance obligation."""
    user_role = session.get("role")
    if user_role not in ["officer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Review decisions require scrutiny officer or admin authorization",
        )

    obligation = db.get(ComplianceObligation, obligation_id)
    if not obligation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compliance obligation '{obligation_id}' not found",
        )

    application = db.get(Application, obligation.application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated application '{obligation.application_id}' not found",
        )

    _check_app_access(application, session)

    if req.review_status not in ["confirmed", "overridden"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="review_status must be either 'confirmed' or 'overridden'",
        )

    if req.review_status == "overridden" and not req.decision:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="decision is required when overriding an obligation",
        )

    if not req.notes or not req.notes.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review notes are required for accountability and audit history",
        )

    actor = db.get(User, session["user_id"])
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user record not found",
        )

    updated_oblg = RulesEngine.record_obligation_review(
        obligation=obligation,
        review_status=req.review_status,
        decision=req.decision,
        notes=req.notes.strip(),
        actor=actor,
        db=db,
    )

    # Re-fetch rule and latest evaluation
    rule = db.exec(select(RegulatoryRule).where(RegulatoryRule.rule_code == updated_oblg.rule_code)).first()
    rule_read = _to_rule_read(rule) if rule else None

    latest_eval = db.exec(
        select(RuleEvaluation)
        .where(RuleEvaluation.obligation_id == updated_oblg.id)
        .order_by(RuleEvaluation.evaluated_at.desc())  # type: ignore[attr-defined]
    ).first()
    eval_read = _to_eval_read(latest_eval) if latest_eval else None

    oblg_read = ComplianceObligationRead(
        id=updated_oblg.id,
        application_id=updated_oblg.application_id,
        rule_code=updated_oblg.rule_code,
        rule_version=updated_oblg.rule_version,
        title=updated_oblg.title,
        category=updated_oblg.category,
        severity=updated_oblg.severity,
        status=updated_oblg.status,
        due_date=updated_oblg.due_date,
        last_evaluated_at=updated_oblg.last_evaluated_at,
        review_status=updated_oblg.review_status,
        review_decision=updated_oblg.review_decision,
        reviewed_by_id=updated_oblg.reviewed_by_id,
        reviewed_by_name=updated_oblg.reviewed_by_name,
        reviewed_at=updated_oblg.reviewed_at,
        review_notes=updated_oblg.review_notes,
        rule_details=rule_read,
        latest_evaluation=eval_read,
    )

    return ObligationReviewResponse(
        obligation=oblg_read,
        message=f"Compliance obligation {updated_oblg.rule_code} marked as {req.review_status}",
    )
