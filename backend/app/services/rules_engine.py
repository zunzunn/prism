"""Deterministic regulatory compliance rules evaluation service for PRISM."""

from datetime import datetime, timezone
import json
import re
from typing import Any, Optional
import uuid
from sqlmodel import Session, select
from app.models import (
    Application,
    AuditEvent,
    ComplianceObligation,
    Document,
    DocumentExtraction,
    Finding,
    Institution,
    RegulatoryRule,
    RuleEvaluation,
    User,
    utc_now,
)
from app.services.rules_registry import get_default_rules


def parse_flexible_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parse common date formats deterministically without external fragile parsers."""
    if not date_str or not date_str.strip():
        return None
    cleaned = date_str.strip()
    formats = [
        "%Y-%m-%d",
        "%d %b %Y",
        "%d %B %Y",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y/%m/%d",
        "%b %d, %Y",
        "%B %d, %Y",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(cleaned, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    # Try ISO format
    try:
        dt = datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def normalize_name(name: Optional[str]) -> str:
    """Normalize organization names for robust matching."""
    if not name:
        return ""
    s = name.lower().strip()
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\b(pvt|ltd|limited|private|the|of|institute|college)\b", "", s)
    return " ".join(s.split())


class RulesEngine:
    """Service implementing deterministic compliance evaluation against regulatory rules."""

    @staticmethod
    def ensure_default_rules(db: Session) -> list[RegulatoryRule]:
        """Seed default authoritative rules into database if none exist."""
        existing = db.exec(select(RegulatoryRule)).first()
        if not existing:
            default_rules = get_default_rules()
            for r in default_rules:
                db.add(r)
            db.commit()
            return default_rules
        return list(db.exec(select(RegulatoryRule)).all())

    @staticmethod
    def get_applicable_rules(
        application: Application,
        db: Session,
        active_only: bool = True,
    ) -> list[RegulatoryRule]:
        """Determine all applicable rules for an application based on type and academic year/date.
        
        Applies version resolution: selects the active version effective at the application date.
        """
        RulesEngine.ensure_default_rules(db)
        ref_time = application.submission_timestamp or utc_now()

        statement = select(RegulatoryRule)
        if active_only:
            statement = statement.where(RegulatoryRule.is_active == True)  # noqa: E712

        all_rules = list(db.exec(statement).all())

        # Group by rule_code to select the most appropriate version
        grouped: dict[str, list[RegulatoryRule]] = {}
        for rule in all_rules:
            # Check date effectivity
            if rule.effective_from <= ref_time:
                if rule.effective_until is None or rule.effective_until > ref_time:
                    grouped.setdefault(rule.rule_code, []).append(rule)

        applicable: list[RegulatoryRule] = []
        for code, versions in grouped.items():
            # Pick highest version
            sorted_versions = sorted(versions, key=lambda r: [int(x) if x.isdigit() else 0 for x in r.version.split(".")], reverse=True)
            chosen_rule = sorted_versions[0]

            # Check application_type applicability
            try:
                types = json.loads(chosen_rule.applicable_types_json)
            except Exception:
                types = ["*"]

            if "*" in types or application.application_type in types:
                applicable.append(chosen_rule)

        # Sort by category and code
        applicable.sort(key=lambda r: (r.category, r.rule_code))
        return applicable

    @staticmethod
    def ensure_application_obligations(
        application: Application,
        db: Session,
    ) -> list[ComplianceObligation]:
        """Ensure all applicable rules have corresponding ComplianceObligation records for this application."""
        applicable_rules = RulesEngine.get_applicable_rules(application, db)
        existing_obligations = list(
            db.exec(
                select(ComplianceObligation).where(
                    ComplianceObligation.application_id == application.id
                )
            ).all()
        )
        existing_by_code = {o.rule_code: o for o in existing_obligations}

        obligations: list[ComplianceObligation] = []
        now = utc_now()

        for rule in applicable_rules:
            if rule.rule_code in existing_by_code:
                oblg = existing_by_code[rule.rule_code]
                # Update metadata if rule version changed
                oblg.rule_version = rule.version
                oblg.title = rule.title
                oblg.category = rule.category
                oblg.severity = rule.severity
                oblg.updated_at = now
                db.add(oblg)
                obligations.append(oblg)
            else:
                new_oblg = ComplianceObligation(
                    id=f"oblg_{application.id}_{rule.rule_code}",
                    application_id=application.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    title=rule.title,
                    category=rule.category,
                    severity=rule.severity,
                    status="pending_evidence",
                    due_date=application.due_date,
                    last_evaluated_at=None,
                    review_status="unreviewed",
                    created_at=now,
                    updated_at=now,
                )
                db.add(new_oblg)
                obligations.append(new_oblg)

        db.commit()
        for o in obligations:
            db.refresh(o)
        return obligations

    @staticmethod
    def evaluate_application(
        application: Application,
        db: Session,
        actor: Optional[User] = None,
        trigger: str = "manual_evaluate",
    ) -> tuple[list[RuleEvaluation], list[ComplianceObligation]]:
        """Run deterministic compliance evaluation across all applicable rules for this application."""
        obligations = RulesEngine.ensure_application_obligations(application, db)
        applicable_rules = RulesEngine.get_applicable_rules(application, db)
        rules_by_code = {r.rule_code: r for r in applicable_rules}

        # Fetch institution, documents, and extractions
        institution = db.get(Institution, application.institution_id)
        inst_name = institution.name if institution else ""

        documents = list(
            db.exec(
                select(Document).where(Document.application_id == application.id)
            ).all()
        )
        doc_map = {d.id: d for d in documents}

        extractions = list(
            db.exec(
                select(DocumentExtraction).where(
                    DocumentExtraction.application_id == application.id
                )
            ).all()
        )
        ext_by_doc = {e.document_id: e for e in extractions}

        batch_id = f"eval-batch-{uuid.uuid4().hex[:10]}"
        now = utc_now()
        evaluations: list[RuleEvaluation] = []

        status_counts = {
            "satisfied": 0,
            "not_satisfied": 0,
            "pending_evidence": 0,
            "needs_review": 0,
            "unable_to_evaluate": 0,
            "not_applicable": 0,
        }

        for obligation in obligations:
            rule = rules_by_code.get(obligation.rule_code)
            if not rule:
                continue

            try:
                check_config = json.loads(rule.check_config_json)
            except Exception:
                check_config = {}

            evaluation = RulesEngine._evaluate_single_rule(
                rule=rule,
                check_config=check_config,
                application=application,
                institution_name=inst_name,
                documents=documents,
                extractions_by_doc=ext_by_doc,
                batch_id=batch_id,
                obligation=obligation,
                now=now,
            )
            evaluations.append(evaluation)
            db.add(evaluation)

            # Update obligation status
            # If user has an active manual override, retain override status on obligation, but log deterministic evaluation
            if obligation.review_status == "overridden" and obligation.review_decision:
                obligation.status = obligation.review_decision
            else:
                obligation.status = evaluation.status
                if rule.mandatory_review and evaluation.status == "satisfied" and obligation.review_status != "confirmed":
                    obligation.status = "needs_review"

            obligation.last_evaluated_at = now
            obligation.updated_at = now
            db.add(obligation)

            status_counts[obligation.status] = status_counts.get(obligation.status, 0) + 1

        # Record audit event
        actor_id = actor.id if actor else "system"
        actor_name = actor.display_name if actor else "PRISM Rules Engine"
        actor_role = actor.role if actor else "system"

        audit_evt = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor_id,
            actor_name=actor_name,
            actor_role=actor_role,
            action="Regulatory compliance evaluation executed",
            entity_type="application",
            entity_id=application.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "batch_id": batch_id,
                    "trigger": trigger,
                    "total_evaluated": len(evaluations),
                    "summary": status_counts,
                }
            ),
        )
        db.add(audit_evt)

        db.commit()
        for e in evaluations:
            db.refresh(e)
        for o in obligations:
            db.refresh(o)

        return evaluations, obligations

    @staticmethod
    def _evaluate_single_rule(
        rule: RegulatoryRule,
        check_config: dict[str, Any],
        application: Application,
        institution_name: str,
        documents: list[Document],
        extractions_by_doc: dict[str, DocumentExtraction],
        batch_id: str,
        obligation: ComplianceObligation,
        now: datetime,
    ) -> RuleEvaluation:
        """Deterministic evaluation logic for a single regulatory rule."""
        eval_type = rule.evaluation_type
        target_category = check_config.get("target_category", "")

        # Find matching documents by category or filename
        matching_docs = [
            d for d in documents
            if (target_category and (
                (d.category and target_category.lower() in d.category.lower())
                or target_category.lower() in d.original_filename.lower()
            ))
        ] if target_category else documents

        # 1. Document presence check
        if eval_type == "required_document_presence":
            if not matching_docs:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="pending_evidence",
                    explanation=(
                        f"Required document for category '{target_category}' has not been uploaded. "
                        f"Per {rule.source_document} ({rule.source_section}), this documentation is mandatory."
                    ),
                    expected_value=f"Valid {target_category} Document",
                    actual_value="No document uploaded",
                    evidence_document_id=None,
                    evidence_document_name=None,
                    evidence_page=None,
                    evidence_snippet=None,
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            target_doc = matching_docs[0]
            ext = extractions_by_doc.get(target_doc.id)

            if ext and ext.status in ["failed", "unsupported"]:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="unable_to_evaluate",
                    explanation=f"Document '{target_doc.original_filename}' is on file but could not be processed: {ext.error_message or 'Extraction error'}.",
                    expected_value=f"Readable {target_category} Document",
                    actual_value=f"Processing status: {ext.status}",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evidence_page=None,
                    evidence_snippet=None,
                    evaluator_type="deterministic",
                    error_detail=ext.error_message,
                    evaluated_at=now,
                )

            # If mandatory review flag is set
            if rule.mandatory_review:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="needs_review",
                    explanation=(
                        f"Document '{target_doc.original_filename}' is on file. "
                        f"In accordance with {rule.source_section}, this requirement mandates affirmative review by an authorized scrutiny officer."
                    ),
                    expected_value=f"Officer-verified {target_category}",
                    actual_value=f"Document uploaded: {target_doc.original_filename}",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evidence_page=1,
                    evidence_snippet=None,
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            return RuleEvaluation(
                id=f"eval-{uuid.uuid4().hex[:12]}",
                application_id=application.id,
                obligation_id=obligation.id,
                rule_code=rule.rule_code,
                rule_version=rule.version,
                evaluation_batch_id=batch_id,
                status="satisfied",
                explanation=f"Required document '{target_doc.original_filename}' is on file under category '{target_doc.category or target_category}'.",
                expected_value=f"{target_category} Document",
                actual_value=target_doc.original_filename,
                evidence_document_id=target_doc.id,
                evidence_document_name=target_doc.original_filename,
                evidence_page=1,
                evidence_snippet=None,
                evaluator_type="deterministic",
                evaluated_at=now,
            )

        # 2. Field presence check
        elif eval_type == "required_field_presence":
            target_field = check_config.get("target_field", "")
            if not matching_docs:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="pending_evidence",
                    explanation=f"Required supporting document '{target_category}' containing field '{target_field}' is not uploaded.",
                    expected_value=f"Field '{target_field}' in {target_category}",
                    actual_value="Document missing",
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            target_doc = matching_docs[0]
            ext = extractions_by_doc.get(target_doc.id)
            if not ext or ext.status in ["failed", "pending", "unsupported"]:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="unable_to_evaluate",
                    explanation=f"Cannot extract field '{target_field}': Document '{target_doc.original_filename}' has not completed structured extraction.",
                    expected_value=f"Completed extraction for '{target_field}'",
                    actual_value=ext.status if ext else "No extraction",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            extracted_fields = []
            if ext.extracted_fields_json:
                try:
                    extracted_fields = json.loads(ext.extracted_fields_json)
                except Exception:
                    pass

            matched_field = next((f for f in extracted_fields if f.get("field_name") == target_field), None)
            if matched_field and matched_field.get("state") == "extracted":
                val = matched_field.get("extracted_value")
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="satisfied",
                    explanation=f"Field '{target_field}' was successfully verified from '{target_doc.original_filename}'.",
                    expected_value=f"Valid {target_field}",
                    actual_value=val,
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evidence_page=matched_field.get("page_number", 1),
                    evidence_snippet=matched_field.get("evidence_snippet"),
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )
            else:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="not_satisfied",
                    explanation=f"Required field '{target_field}' was not found or could not be determined in '{target_doc.original_filename}'.",
                    expected_value=f"Extracted {target_field}",
                    actual_value=matched_field.get("state") if matched_field else "not_found",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

        # 3. Certificate expiry check
        elif eval_type == "certificate_expiry":
            if not matching_docs:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="pending_evidence",
                    explanation=f"Required safety or statutory certificate ({target_category or 'Safety Compliance'}) is missing from application dossier.",
                    expected_value="Valid, unexpired certificate",
                    actual_value="Document missing",
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            target_doc = matching_docs[0]
            ext = extractions_by_doc.get(target_doc.id)
            if not ext or ext.status in ["failed", "pending", "unsupported"]:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="unable_to_evaluate",
                    explanation=f"Cannot evaluate validity: Document '{target_doc.original_filename}' extraction is incomplete or unreadable.",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            fields = json.loads(ext.extracted_fields_json or "[]")
            expiry_f = next((f for f in fields if f.get("field_name") == "expiry_date"), None)

            if not expiry_f or not expiry_f.get("extracted_value"):
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="needs_review",
                    explanation=f"Expiry date not deterministically found in '{target_doc.original_filename}'. Human officer review required to confirm certificate validity.",
                    expected_value="Explicit expiry date",
                    actual_value="No expiry date detected",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            exp_str = expiry_f.get("extracted_value")
            exp_date = parse_flexible_date(exp_str)
            if not exp_date:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="needs_review",
                    explanation=f"Expiry date '{exp_str}' could not be parsed automatically. Officer review required.",
                    expected_value="Standard parseable date",
                    actual_value=exp_str,
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evidence_page=expiry_f.get("page_number", 1),
                    evidence_snippet=expiry_f.get("evidence_snippet"),
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            if exp_date < now:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="not_satisfied",
                    explanation=(
                        f"Certificate expired on {exp_str}. "
                        f"Per {rule.source_document} ({rule.source_section}), certificates must possess active validity extending through the operative academic approval cycle."
                    ),
                    expected_value=f"Valid through {application.academic_year}",
                    actual_value=f"Expired on {exp_str}",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evidence_page=expiry_f.get("page_number", 1),
                    evidence_snippet=expiry_f.get("evidence_snippet"),
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            return RuleEvaluation(
                id=f"eval-{uuid.uuid4().hex[:12]}",
                application_id=application.id,
                obligation_id=obligation.id,
                rule_code=rule.rule_code,
                rule_version=rule.version,
                evaluation_batch_id=batch_id,
                status="satisfied",
                explanation=f"Certificate is valid until {exp_str}, meeting active validity requirements.",
                expected_value=f"Valid through {application.academic_year}",
                actual_value=f"Valid until {exp_str}",
                evidence_document_id=target_doc.id,
                evidence_document_name=target_doc.original_filename,
                evidence_page=expiry_f.get("page_number", 1),
                evidence_snippet=expiry_f.get("evidence_snippet"),
                evaluator_type="deterministic",
                evaluated_at=now,
            )

        # 4. Extracted vs record match
        elif eval_type == "extracted_vs_record_match":
            target_field = check_config.get("target_field", "institution_name")
            if not matching_docs:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="pending_evidence",
                    explanation=f"Supporting document for '{target_category}' is required to verify institutional title and ownership.",
                    expected_value=institution_name,
                    actual_value="Document missing",
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            target_doc = matching_docs[0]
            ext = extractions_by_doc.get(target_doc.id)
            if not ext or ext.status in ["failed", "pending", "unsupported"]:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="unable_to_evaluate",
                    explanation=f"Cannot verify ownership: Document '{target_doc.original_filename}' has not been parsed successfully.",
                    expected_value=institution_name,
                    actual_value=ext.status if ext else "No extraction",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            fields = json.loads(ext.extracted_fields_json or "[]")
            field_obj = next((f for f in fields if f.get("field_name") == target_field), None)

            if not field_obj or not field_obj.get("extracted_value"):
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="needs_review",
                    explanation=f"Field '{target_field}' could not be automatically extracted from '{target_doc.original_filename}'. Officer manual review required.",
                    expected_value=institution_name,
                    actual_value="Field unextracted",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            extracted_val = field_obj.get("extracted_value", "")
            norm_extracted = normalize_name(extracted_val)
            norm_expected = normalize_name(institution_name)

            if norm_extracted == norm_expected or norm_expected in norm_extracted or norm_extracted in norm_expected:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="satisfied",
                    explanation=f"Document title matches registered institution name '{institution_name}'. Verified free from title discrepancies.",
                    expected_value=institution_name,
                    actual_value=extracted_val,
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evidence_page=field_obj.get("page_number", 1),
                    evidence_snippet=field_obj.get("evidence_snippet"),
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )
            else:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="not_satisfied",
                    explanation=(
                        f"Ownership discrepancy detected: Document cites '{extracted_val}', "
                        f"which does not match official registered name '{institution_name}'. "
                        f"Per {rule.source_document} ({rule.source_section}), title must be legally continuous."
                    ),
                    expected_value=institution_name,
                    actual_value=extracted_val,
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evidence_page=field_obj.get("page_number", 1),
                    evidence_snippet=field_obj.get("evidence_snippet"),
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

        # 5. Date order validity
        elif eval_type == "date_order_validity":
            submission_dt = application.submission_timestamp
            if not documents:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="pending_evidence",
                    explanation="No supporting statutory documents available to evaluate issuance timeline.",
                    expected_value="Issuance before submission date",
                    actual_value="No documents uploaded",
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            if not submission_dt:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="pending_evidence",
                    explanation="Application is still in draft state; formal submission timestamp has not been recorded.",
                    expected_value="Formal submission timestamp",
                    actual_value="Draft application",
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            # Check all documents with issuance_date
            post_dated_docs = []
            for doc in documents:
                ext = extractions_by_doc.get(doc.id)
                if ext and ext.extracted_fields_json:
                    try:
                        fields = json.loads(ext.extracted_fields_json)
                        iss_f = next((f for f in fields if f.get("field_name") == "issuance_date"), None)
                        if iss_f and iss_f.get("extracted_value"):
                            iss_dt = parse_flexible_date(iss_f.get("extracted_value"))
                            if iss_dt and iss_dt > submission_dt:
                                post_dated_docs.append((doc, iss_f, iss_dt))
                    except Exception:
                        pass

            if post_dated_docs:
                bad_doc, bad_f, bad_dt = post_dated_docs[0]
                iss_str = bad_f.get("extracted_value")
                sub_str = submission_dt.strftime("%d %b %Y")
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="not_satisfied",
                    explanation=(
                        f"Document '{bad_doc.original_filename}' has issuance date '{iss_str}' which is after the application submission date ({sub_str}). "
                        f"Per {rule.source_section}, statutory clearances must precede formal filing."
                    ),
                    expected_value=f"Issuance on or before {sub_str}",
                    actual_value=f"Post-dated: {iss_str}",
                    evidence_document_id=bad_doc.id,
                    evidence_document_name=bad_doc.original_filename,
                    evidence_page=bad_f.get("page_number", 1),
                    evidence_snippet=bad_f.get("evidence_snippet"),
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            return RuleEvaluation(
                id=f"eval-{uuid.uuid4().hex[:12]}",
                application_id=application.id,
                obligation_id=obligation.id,
                rule_code=rule.rule_code,
                rule_version=rule.version,
                evaluation_batch_id=batch_id,
                status="satisfied",
                explanation="All verified statutory clearances and certificates were issued prior to or on the application submission date.",
                expected_value=f"Issuance on or before {submission_dt.strftime('%d %b %Y')}",
                actual_value="All certificates pre-date submission",
                evaluator_type="deterministic",
                evaluated_at=now,
            )

        # 6. Mandatory human review
        elif eval_type == "mandatory_human_review":
            if not matching_docs:
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="pending_evidence",
                    explanation=f"Statutory document for '{target_category}' has not been uploaded. Submission of notarized affidavit is mandatory.",
                    expected_value=f"Notarized {target_category}",
                    actual_value="Document missing",
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            target_doc = matching_docs[0]
            if obligation.review_status == "confirmed":
                return RuleEvaluation(
                    id=f"eval-{uuid.uuid4().hex[:12]}",
                    application_id=application.id,
                    obligation_id=obligation.id,
                    rule_code=rule.rule_code,
                    rule_version=rule.version,
                    evaluation_batch_id=batch_id,
                    status="satisfied",
                    explanation=f"Affidavit '{target_doc.original_filename}' reviewed and confirmed by authorized officer {obligation.reviewed_by_name or ''}.",
                    expected_value="Officer-reviewed affidavit",
                    actual_value="Confirmed by officer",
                    evidence_document_id=target_doc.id,
                    evidence_document_name=target_doc.original_filename,
                    evaluator_type="deterministic",
                    evaluated_at=now,
                )

            return RuleEvaluation(
                id=f"eval-{uuid.uuid4().hex[:12]}",
                application_id=application.id,
                obligation_id=obligation.id,
                rule_code=rule.rule_code,
                rule_version=rule.version,
                evaluation_batch_id=batch_id,
                status="needs_review",
                explanation=(
                    f"Affidavit document '{target_doc.original_filename}' is on file. "
                    f"Per {rule.source_document} ({rule.source_section}), notary seals, stamp duty, and penal undertakings require affirmative scrutiny and sign-off by an authorized officer."
                ),
                expected_value="Officer scrutiny & signature endorsement",
                actual_value=f"Pending scrutiny on {target_doc.original_filename}",
                evidence_document_id=target_doc.id,
                evidence_document_name=target_doc.original_filename,
                evidence_page=1,
                evaluator_type="deterministic",
                evaluated_at=now,
            )

        # Fallback default
        return RuleEvaluation(
            id=f"eval-{uuid.uuid4().hex[:12]}",
            application_id=application.id,
            obligation_id=obligation.id,
            rule_code=rule.rule_code,
            rule_version=rule.version,
            evaluation_batch_id=batch_id,
            status="not_applicable",
            explanation=f"Evaluation rule {rule.rule_code} not applicable or completed.",
            evaluator_type="deterministic",
            evaluated_at=now,
        )

    @staticmethod
    def record_obligation_review(
        obligation: ComplianceObligation,
        review_status: str,  # "confirmed" | "overridden"
        decision: Optional[str],  # "satisfied" | "not_satisfied" | "exception_granted"
        notes: str,
        actor: User,
        db: Session,
    ) -> ComplianceObligation:
        """Record an authorized officer or admin review decision on a compliance obligation."""
        now = utc_now()
        effective_decision = decision or obligation.status

        obligation.review_status = review_status
        obligation.review_decision = effective_decision
        obligation.reviewed_by_id = actor.id
        obligation.reviewed_by_name = actor.display_name
        obligation.reviewed_at = now
        obligation.review_notes = notes
        obligation.status = effective_decision
        obligation.updated_at = now

        db.add(obligation)

        # Append human review evaluation record to audit trail
        eval_record = RuleEvaluation(
            id=f"eval-{uuid.uuid4().hex[:12]}",
            application_id=obligation.application_id,
            obligation_id=obligation.id,
            rule_code=obligation.rule_code,
            rule_version=obligation.rule_version,
            evaluation_batch_id=f"review-{uuid.uuid4().hex[:8]}",
            status=effective_decision,
            explanation=f"Officer Review [{review_status.upper()}]: {notes}",
            expected_value="Authorized Officer Determination",
            actual_value=effective_decision,
            evaluator_type="manual_review",
            evaluated_at=now,
        )
        db.add(eval_record)

        # Audit event
        audit_evt = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:12]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action=f"Compliance obligation {review_status}: {obligation.rule_code}",
            entity_type="compliance_obligation",
            entity_id=obligation.id,
            timestamp=now,
            detail=json.dumps(
                {
                    "rule_code": obligation.rule_code,
                    "review_status": review_status,
                    "decision": effective_decision,
                    "notes": notes,
                    "officer_name": actor.display_name,
                }
            ),
        )
        db.add(audit_evt)

        db.commit()
        db.refresh(obligation)
        return obligation
