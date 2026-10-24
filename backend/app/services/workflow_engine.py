"""Workflow automation and stage transition engine for PRISM."""

from datetime import datetime, timezone
import json
from typing import Any, Optional
import uuid
from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.models import (
    Application,
    AssignmentHistory,
    AuditEvent,
    ClarificationRequest,
    ComplianceObligation,
    DecisionRecord,
    Document,
    DocumentExtraction,
    Finding,
    StageConfig,
    User,
    utc_now,
)
from app.schemas import (
    ReadinessBlocker,
    StageReadinessResponse,
    StageTransitionResponse,
)


class WorkflowEngine:
    """Service enforcing workflow rules, readiness checks, stage transitions, and assignments."""

    @staticmethod
    def get_stages(db: Session, active_only: bool = True) -> list[StageConfig]:
        """Fetch all configured workflow stages ordered by sequence."""
        stmt = select(StageConfig)
        if active_only:
            stmt = stmt.where(StageConfig.is_active == True)  # noqa: E712
        return list(db.exec(stmt.order_by(StageConfig.order)).all())  # type: ignore[attr-defined]

    @staticmethod
    def get_next_stage(current_stage: StageConfig, stages: list[StageConfig]) -> Optional[StageConfig]:
        """Determine next sequential non-terminal stage."""
        if current_stage.is_terminal:
            return None
        sorted_stages = sorted(stages, key=lambda s: s.order)
        for s in sorted_stages:
            if s.order > current_stage.order and not s.is_terminal:
                return s
        # If no non-terminal stage with higher order, return terminal stage if exists
        for s in sorted_stages:
            if s.order > current_stage.order and s.is_terminal:
                return s
        return None

    @staticmethod
    def evaluate_stage_readiness(
        application: Application,
        db: Session,
        actor: Optional[User] = None,
    ) -> StageReadinessResponse:
        """Evaluate whether an application satisfies requirements to advance from its current stage."""
        stages = WorkflowEngine.get_stages(db)
        stage_map = {s.id: s for s in stages}
        current_stage = stage_map.get(application.current_stage_id)

        if not current_stage:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Configured stage '{application.current_stage_id}' not found",
            )

        next_stage = WorkflowEngine.get_next_stage(current_stage, stages)
        blockers: list[ReadinessBlocker] = []

        # 1. Document presence check (for stages beyond draft)
        documents = list(
            db.exec(select(Document).where(Document.application_id == application.id)).all()
        )
        if current_stage.id != "stage-draft" and not documents:
            blockers.append(
                ReadinessBlocker(
                    code="DOC_MISSING_EVIDENCE",
                    title="No Supporting Documents Uploaded",
                    severity="high",
                    category="document",
                    description="Application requires at least one verified supporting document to advance beyond initial filing.",
                    source_entity="document",
                )
            )

        # Check for unreadable or corrupt documents
        extractions = list(
            db.exec(select(DocumentExtraction).where(DocumentExtraction.application_id == application.id)).all()
        )
        for ext in extractions:
            if ext.status in ["failed", "unsupported"]:
                doc = next((d for d in documents if d.id == ext.document_id), None)
                blockers.append(
                    ReadinessBlocker(
                        code="DOC_EXTRACTION_FAILED",
                        title=f"Unreadable Document: {doc.original_filename if doc else ext.document_id}",
                        severity="high",
                        category="document",
                        description=f"Extraction failure detected ({ext.error_message or 'Corrupt file'}). Document must be replaced.",
                        source_entity="document",
                        entity_id=ext.document_id,
                    )
                )

        # 2. Finding review blockers (checks for unresolved findings)
        findings = list(
            db.exec(select(Finding).where(Finding.application_id == application.id)).all()
        )
        needs_review_findings = [f for f in findings if f.review_state == "needs_review"]

        for f in needs_review_findings:
            if f.severity == "high":
                blockers.append(
                    ReadinessBlocker(
                        code="FINDING_HIGH_UNREVIEWED",
                        title=f"Unreviewed High-Severity Finding: {f.title}",
                        severity="high",
                        category="finding",
                        description=f"Regulatory discrepancy '{f.title}' requires affirmative review and decision by an authorized officer.",
                        source_entity="finding",
                        entity_id=f.id,
                    )
                )
            elif current_stage.order >= 4:  # Desk review and beyond require all findings resolved
                blockers.append(
                    ReadinessBlocker(
                        code="FINDING_UNREVIEWED",
                        title=f"Unreviewed Finding: {f.title}",
                        severity="medium",
                        category="finding",
                        description=f"Finding '{f.title}' ({f.severity} severity) is pending human review.",
                        source_entity="finding",
                        entity_id=f.id,
                    )
                )

        # 3. Compliance obligation blockers
        obligations = list(
            db.exec(
                select(ComplianceObligation).where(
                    ComplianceObligation.application_id == application.id
                )
            ).all()
        )
        if current_stage.order >= 4:  # Desk review, committee, and decision require compliance checks
            for oblg in obligations:
                if oblg.status == "not_satisfied" and oblg.review_status != "overridden":
                    blockers.append(
                        ReadinessBlocker(
                            code="OBLIGATION_BREACHED",
                            title=f"Requirement Unsatisfied: {oblg.title}",
                            severity="high",
                            category="compliance",
                            description=f"Rule {oblg.rule_code} evaluated as not satisfied. Evidence must be rectified or officer exception granted.",
                            source_entity="compliance_obligation",
                            entity_id=oblg.id,
                        )
                    )
                elif oblg.status == "pending_evidence" and oblg.severity == "high":
                    blockers.append(
                        ReadinessBlocker(
                            code="OBLIGATION_MISSING_EVIDENCE",
                            title=f"Missing Evidence: {oblg.title}",
                            severity="high",
                            category="compliance",
                            description=f"Mandatory evidence for {oblg.rule_code} ({oblg.category}) has not been submitted.",
                            source_entity="compliance_obligation",
                            entity_id=oblg.id,
                        )
                    )
                elif oblg.status == "needs_review" and oblg.review_status == "unreviewed":
                    blockers.append(
                        ReadinessBlocker(
                            code="OBLIGATION_NEEDS_SCRUTINY",
                            title=f"Scrutiny Sign-Off Required: {oblg.title}",
                            severity="medium",
                            category="compliance",
                            description=f"Rule {oblg.rule_code} mandates human officer scrutiny and endorsement before advancement.",
                            source_entity="compliance_obligation",
                            entity_id=oblg.id,
                        )
                    )

        # 4. Open clarification blockers
        clarifications = list(
            db.exec(
                select(ClarificationRequest).where(
                    ClarificationRequest.application_id == application.id
                )
            ).all()
        )
        unresolved_clarifications = [
            c for c in clarifications if c.status in ["open", "responded", "under_review"]
        ]
        for clr in unresolved_clarifications:
            blockers.append(
                ReadinessBlocker(
                    code="CLARIFICATION_UNRESOLVED",
                    title=f"Active Clarification Request: {clr.title}",
                    severity="high",
                    category="clarification",
                    description=(
                        f"Clarification '{clr.title}' is currently '{clr.status}'. "
                        "All clarification threads must be formally resolved or cancelled by an officer before stage advancement."
                    ),
                    source_entity="clarification_request",
                    entity_id=clr.id,
                )
            )

        # 5. Assigned officer check (for stages 3 and above)
        if current_stage.order >= 3 and not application.assigned_owner_id:
            blockers.append(
                ReadinessBlocker(
                    code="OFFICER_UNASSIGNED",
                    title="No Assigned Scrutiny Officer",
                    severity="medium",
                    category="assignment",
                    description="Application requires an assigned review officer to oversee stage advancement.",
                    source_entity="application",
                    entity_id=application.id,
                )
            )

        # 6. Decision stage requirement
        if current_stage.requires_decision:
            decision = db.exec(
                select(DecisionRecord).where(DecisionRecord.application_id == application.id)
            ).first()
            if not decision:
                blockers.append(
                    ReadinessBlocker(
                        code="DECISION_PENDING",
                        title="Authorized Regulatory Decision Required",
                        severity="high",
                        category="decision",
                        description="An explicit regulatory determination (Approval or Rejection) must be recorded by an authorized official.",
                        source_entity="decision_record",
                    )
                )

        has_high_blocker = any(b.severity == "high" for b in blockers)
        is_ready = len(blockers) == 0

        can_override = (actor.role == "admin") if actor else False

        return StageReadinessResponse(
            application_id=application.id,
            is_ready=is_ready,
            current_stage_id=current_stage.id,
            current_stage_name=current_stage.name,
            target_stage_id=next_stage.id if next_stage else None,
            target_stage_name=next_stage.name if next_stage else None,
            blockers=blockers,
            total_blockers=len(blockers),
            can_admin_override=can_override,
            assessed_at=utc_now(),
        )

    @staticmethod
    def assign_officer(
        application: Application,
        target_owner_id: str,
        actor: User,
        reason: Optional[str],
        db: Session,
    ) -> tuple[AssignmentHistory, Application]:
        """Assign or reassign an application to an eligible officer with audit tracking."""
        if actor.role not in ["officer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Assigning applications requires scrutiny officer or administrator permissions",
            )

        target_user = db.get(User, target_owner_id)
        if not target_user or not target_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target officer '{target_owner_id}' not found or inactive",
            )

        if target_user.role not in ["officer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Applications can only be assigned to users with role 'officer' or 'admin'",
            )

        prev_owner = db.get(User, application.assigned_owner_id) if application.assigned_owner_id else None
        now = utc_now()

        # Update application
        application.assigned_owner_id = target_user.id
        application.updated_at = now
        db.add(application)

        # Record assignment history
        history = AssignmentHistory(
            id=f"asgn-{uuid.uuid4().hex[:10]}",
            application_id=application.id,
            assigned_by_id=actor.id,
            assigned_by_name=actor.display_name,
            previous_owner_id=prev_owner.id if prev_owner else None,
            previous_owner_name=prev_owner.display_name if prev_owner else None,
            new_owner_id=target_user.id,
            new_owner_name=target_user.display_name,
            reason=reason or "Officer assigned via workflow management",
            assigned_at=now,
        )
        db.add(history)

        # Record audit event
        audit = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action="Officer assignment updated",
            entity_type="application",
            entity_id=application.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "previous_officer": prev_owner.display_name if prev_owner else "Unassigned",
                    "new_officer": target_user.display_name,
                    "reason": reason or "Officer assigned",
                }
            ),
        )
        db.add(audit)

        db.commit()
        db.refresh(application)
        db.refresh(history)
        return history, application

    @staticmethod
    def advance_stage(
        application: Application,
        target_stage_id: Optional[str],
        actor: User,
        note: Optional[str],
        override_blockers: bool,
        override_reason: Optional[str],
        db: Session,
    ) -> StageTransitionResponse:
        """Validate readiness and advance application to the next authorized stage."""
        stages = WorkflowEngine.get_stages(db)
        stage_map = {s.id: s for s in stages}
        current_stage = stage_map.get(application.current_stage_id)

        if not current_stage:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Current stage configuration not found",
            )

        if current_stage.is_terminal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot advance: Stage '{current_stage.name}' is terminal (closed)",
            )

        # Role validation
        if current_stage.id == "stage-draft":
            if actor.role not in ["institution_user", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Initial application submission must be performed by the applicant institution",
                )
        else:
            if actor.role not in ["officer", "admin"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Advancing approval stages requires scrutiny officer or administrator permissions",
                )

        # Target stage resolution
        if target_stage_id:
            target_stage = stage_map.get(target_stage_id)
            if not target_stage:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Target stage '{target_stage_id}' not found",
                )
            # Cannot skip stages arbitrarily unless moving to clarification
            if target_stage.order <= current_stage.order and target_stage.id != "stage-clarification":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Target stage '{target_stage.name}' must be sequentially subsequent to '{current_stage.name}'. Use return_stage to go back.",
                )
        else:
            target_stage = WorkflowEngine.get_next_stage(current_stage, stages)
            if not target_stage:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No subsequent stage configured after '{current_stage.name}'",
                )

        # Check readiness and blockers
        readiness = WorkflowEngine.evaluate_stage_readiness(application, db, actor)
        if not readiness.is_ready:
            if not override_blockers:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": f"Cannot advance stage: {readiness.total_blockers} blocking condition(s) unresolved",
                        "blockers": [b.model_dump() for b in readiness.blockers],
                    },
                )

            # Override requested
            if actor.role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Overriding workflow blocking conditions requires administrator authorization",
                )
            if not override_reason or not override_reason.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Mandatory override reason is required for administrative stage bypass",
                )

        now = utc_now()
        prev_stage_id = current_stage.id
        prev_stage_name = current_stage.name

        # Update application state
        application.current_stage_id = target_stage.id
        if current_stage.id == "stage-draft":
            application.submission_timestamp = now

        # Update lifecycle status
        if target_stage.is_terminal:
            # Must remain or become closed
            if application.current_status not in ["approved", "rejected"]:
                application.current_status = "closed"
        elif target_stage.id == "stage-clarification":
            application.current_status = "awaiting_reply"
        elif readiness.total_blockers > 0 and override_blockers:
            application.current_status = "needs_attention"
        else:
            application.current_status = "in_progress"

        application.updated_at = now
        db.add(application)

        # Audit event
        audit = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action="Application stage advanced",
            entity_type="application",
            entity_id=application.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "previous_stage_id": prev_stage_id,
                    "previous_stage_name": prev_stage_name,
                    "new_stage_id": target_stage.id,
                    "new_stage_name": target_stage.name,
                    "note": note,
                    "overridden": override_blockers,
                    "override_reason": override_reason,
                }
            ),
        )
        db.add(audit)

        db.commit()
        db.refresh(application)

        return StageTransitionResponse(
            application_id=application.id,
            previous_stage_id=prev_stage_id,
            previous_stage_name=prev_stage_name,
            new_stage_id=target_stage.id,
            new_stage_name=target_stage.name,
            status=application.current_status,
            message=f"Application successfully transitioned from {prev_stage_name} to {target_stage.name}",
        )

    @staticmethod
    def return_stage(
        application: Application,
        target_stage_id: str,
        return_reason: str,
        actor: User,
        db: Session,
    ) -> StageTransitionResponse:
        """Return application to an earlier stage for revisions or re-evaluation."""
        if actor.role not in ["officer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Returning applications to earlier stages requires scrutiny officer or admin authorization",
            )

        if not return_reason or not return_reason.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A detailed return reason is required for administrative accountability",
            )

        stages = WorkflowEngine.get_stages(db)
        stage_map = {s.id: s for s in stages}
        current_stage = stage_map.get(application.current_stage_id)
        target_stage = stage_map.get(target_stage_id)

        if not current_stage or not target_stage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Stage configuration not found",
            )

        if current_stage.is_terminal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot return application: Current stage is terminal (closed)",
            )

        if target_stage.order >= current_stage.order and target_stage.id != "stage-clarification":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Target stage '{target_stage.name}' must be sequentially prior to current stage '{current_stage.name}'",
            )

        now = utc_now()
        prev_stage_id = current_stage.id
        prev_stage_name = current_stage.name

        application.current_stage_id = target_stage.id
        application.current_status = "needs_attention"
        application.updated_at = now
        db.add(application)

        # Audit event
        audit = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action="Application stage returned",
            entity_type="application",
            entity_id=application.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "previous_stage_id": prev_stage_id,
                    "previous_stage_name": prev_stage_name,
                    "returned_to_stage_id": target_stage.id,
                    "returned_to_stage_name": target_stage.name,
                    "return_reason": return_reason.strip(),
                }
            ),
        )
        db.add(audit)

        db.commit()
        db.refresh(application)

        return StageTransitionResponse(
            application_id=application.id,
            previous_stage_id=prev_stage_id,
            previous_stage_name=prev_stage_name,
            new_stage_id=target_stage.id,
            new_stage_name=target_stage.name,
            status=application.current_status,
            message=f"Application returned from {prev_stage_name} to {target_stage.name}: {return_reason}",
        )

    @staticmethod
    def record_decision(
        application: Application,
        decision: str,  # approved | rejected
        reason: str,
        conditions_or_remarks: Optional[str],
        reference_finding_ids: list[str],
        override_blockers: bool,
        override_reason: Optional[str],
        actor: User,
        db: Session,
    ) -> DecisionRecord:
        """Record authorized official statutory determination (Approval or Rejection)."""
        if actor.role not in ["officer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Recording regulatory decisions requires scrutiny officer or administrator permissions",
            )

        if decision not in ["approved", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Decision must be either 'approved' or 'rejected'",
            )

        if not reason or not reason.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A detailed justification reason is required for legal and regulatory record-keeping",
            )

        stages = WorkflowEngine.get_stages(db)
        stage_map = {s.id: s for s in stages}
        current_stage = stage_map.get(application.current_stage_id)

        if not current_stage:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Current stage not found",
            )

        if current_stage.is_terminal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application is already closed and finalized",
            )

        # Check readiness for decision
        readiness = WorkflowEngine.evaluate_stage_readiness(application, db, actor)
        # Filter out the DECISION_PENDING blocker itself since we are recording it now
        effective_blockers = [b for b in readiness.blockers if b.code != "DECISION_PENDING"]

        if effective_blockers and not override_blockers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": f"Cannot finalize decision: {len(effective_blockers)} blocking condition(s) unresolved",
                    "blockers": [b.model_dump() for b in effective_blockers],
                },
            )

        if effective_blockers and override_blockers:
            if actor.role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Overriding blockers to record a decision requires administrator authorization",
                )
            if not override_reason or not override_reason.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Override reason required for decision with outstanding blockers",
                )

        now = utc_now()

        # Create DecisionRecord
        record = DecisionRecord(
            id=f"dec-{uuid.uuid4().hex[:10]}",
            application_id=application.id,
            decided_by_id=actor.id,
            decided_by_name=actor.display_name,
            decision=decision,
            decision_reason=reason.strip(),
            conditions_or_remarks=conditions_or_remarks.strip() if conditions_or_remarks else None,
            reference_findings_json=json.dumps(reference_finding_ids),
            decided_at=now,
        )
        db.add(record)

        # Update application state to closed and approved/rejected
        terminal_stage = next((s for s in stages if s.is_terminal), None)
        if terminal_stage:
            application.current_stage_id = terminal_stage.id
        application.current_status = decision  # approved | rejected
        application.updated_at = now
        db.add(application)

        # Audit event
        audit = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action=f"Regulatory decision recorded: {decision.upper()}",
            entity_type="application",
            entity_id=application.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "decision": decision,
                    "reason": reason.strip(),
                    "conditions": conditions_or_remarks,
                    "reference_findings": reference_finding_ids,
                    "overridden": override_blockers,
                    "override_reason": override_reason,
                }
            ),
        )
        db.add(audit)

        db.commit()
        db.refresh(record)
        db.refresh(application)
        return record
