"""Verification pipeline running text extraction, field extraction, and deterministic regulatory checks."""

from datetime import datetime, timezone
import json
import uuid
from typing import Optional
from sqlmodel import Session, select
from app.config import settings
from app.models import Application, AuditEvent, Document, DocumentExtraction, Finding, Institution, User, utc_now
from app.services.document_processor import DocumentProcessor
from app.services.field_extractor import ExtractedField, FieldExtractor


def _parse_approx_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parse various common date string formats into datetime."""
    if not date_str:
        return None

    clean = date_str.strip()
    formats = [
        "%d %b %Y",
        "%d %B %Y",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y-%m-%d",
        "%Y/%m/%d",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(clean, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


class VerificationPipeline:
    """Orchestrates document extraction and runs regulatory cross-checks against application data."""

    @staticmethod
    def process_document(
        document: Document,
        application: Application,
        institution: Institution,
        actor: User,
        db: Session,
    ) -> tuple[DocumentExtraction, list[Finding]]:
        file_path = settings.storage_dir / document.storage_filename

        # 1. Text & Layout Extraction
        extraction_res = DocumentProcessor.extract_from_file(file_path, document.mime_type)

        # 2. Structured Field Extraction
        extracted_fields = FieldExtractor.extract_fields(
            extraction_res.full_text,
            extraction_res.pages,
            document.category,
        )

        # 3. Persist / Update DocumentExtraction
        existing_ext = db.exec(
            select(DocumentExtraction).where(DocumentExtraction.document_id == document.id)
        ).first()

        now = utc_now()
        fields_json = json.dumps([f.to_dict() for f in extracted_fields])

        if existing_ext:
            existing_ext.status = extraction_res.status
            existing_ext.page_count = extraction_res.page_count
            existing_ext.extracted_text = extraction_res.full_text
            existing_ext.extracted_fields_json = fields_json
            existing_ext.processed_at = now
            existing_ext.error_message = extraction_res.error_message
            db.add(existing_ext)
            extraction_record = existing_ext
        else:
            extraction_record = DocumentExtraction(
                id=f"ext-{uuid.uuid4().hex[:8]}",
                document_id=document.id,
                application_id=application.id,
                status=extraction_res.status,
                page_count=extraction_res.page_count,
                extracted_text=extraction_res.full_text,
                extracted_fields_json=fields_json,
                processed_at=now,
                error_message=extraction_res.error_message,
            )
            db.add(extraction_record)

        # 4. Remove previous findings for this document to ensure clean reprocessing
        prev_findings = db.exec(select(Finding).where(Finding.document_id == document.id)).all()
        for pf in prev_findings:
            db.delete(pf)
        db.commit()

        # 5. Deterministic Consistency & Compliance Checks
        new_findings: list[Finding] = []

        if extraction_res.status == "completed":
            field_map = {f.field_name: f for f in extracted_fields}

            # Check 1: Institution Name Consistency
            inst_field = field_map.get("institution_name")
            if inst_field and inst_field.extracted_value:
                clean_extracted = inst_field.extracted_value.lower()
                clean_registered = institution.name.lower()

                # If neither contains significant portion of the other
                if (
                    clean_extracted not in clean_registered
                    and clean_registered not in clean_extracted
                ):
                    finding = Finding(
                        id=f"fnd-{uuid.uuid4().hex[:8]}",
                        application_id=application.id,
                        document_id=document.id,
                        check_id="CHK_INST_MATCH",
                        category="Consistency",
                        severity="high",
                        title="Possible institution name inconsistency",
                        explanation=(
                            f"The institution name stated in the document ('{inst_field.extracted_value}') "
                            f"differs from the registered institution name in the application record ('{institution.name}')."
                        ),
                        extracted_value=inst_field.extracted_value,
                        expected_value=institution.name,
                        evidence_snippet=inst_field.evidence_snippet,
                        page_number=inst_field.page_number,
                        source="rule",
                        confidence="high",
                        review_state="needs_review",
                        created_at=now,
                    )
                    new_findings.append(finding)

            # Check 2: Date Sequencing (Registration / Issuance vs Application Submission)
            issuance_field = field_map.get("issuance_date")
            if (
                issuance_field
                and issuance_field.extracted_value
                and application.submission_timestamp
            ):
                issuance_dt = _parse_approx_date(issuance_field.extracted_value)
                if issuance_dt and issuance_dt > application.submission_timestamp:
                    finding = Finding(
                        id=f"fnd-{uuid.uuid4().hex[:8]}",
                        application_id=application.id,
                        document_id=document.id,
                        check_id="CHK_DATE_ORDER",
                        category="Consistency",
                        severity="medium",
                        title="Possible date inconsistency",
                        explanation=(
                            f"The registration date on the certificate ({issuance_field.extracted_value}) "
                            f"is later than the date stated in the form ({application.submission_timestamp.strftime('%d %b %Y')})."
                        ),
                        extracted_value=issuance_field.extracted_value,
                        expected_value=application.submission_timestamp.strftime("%d %b %Y"),
                        evidence_snippet=issuance_field.evidence_snippet,
                        page_number=issuance_field.page_number,
                        source="rule",
                        confidence="medium",
                        review_state="needs_review",
                        created_at=now,
                    )
                    new_findings.append(finding)

            # Check 3: Certificate Expiration
            expiry_field = field_map.get("expiry_date")
            if expiry_field and expiry_field.extracted_value:
                expiry_dt = _parse_approx_date(expiry_field.extracted_value)
                if expiry_dt:
                    if expiry_dt < now:
                        finding = Finding(
                            id=f"fnd-{uuid.uuid4().hex[:8]}",
                            application_id=application.id,
                            document_id=document.id,
                            check_id="CHK_EXPIRY_PAST",
                            category="Validity",
                            severity="high",
                            title="Expired compliance certificate",
                            explanation=(
                                f"The document validity expired on {expiry_field.extracted_value}. "
                                "An active, re-certified compliance document is required for processing."
                            ),
                            extracted_value=expiry_field.extracted_value,
                            expected_value="Valid beyond current approval cycle",
                            evidence_snippet=expiry_field.evidence_snippet,
                            page_number=expiry_field.page_number,
                            source="rule",
                            confidence="high",
                            review_state="needs_review",
                            created_at=now,
                        )
                        new_findings.append(finding)
                    elif (expiry_dt - now).days <= 60:
                        finding = Finding(
                            id=f"fnd-{uuid.uuid4().hex[:8]}",
                            application_id=application.id,
                            document_id=document.id,
                            check_id="CHK_EXPIRY_SOON",
                            category="Validity",
                            severity="medium",
                            title="Expiring compliance certificate",
                            explanation=(
                                f"The certificate expires within {(expiry_dt - now).days} days ({expiry_field.extracted_value}). "
                                "Renewal confirmation will be required prior to terminal decision."
                            ),
                            extracted_value=expiry_field.extracted_value,
                            expected_value="Valid throughout academic year",
                            evidence_snippet=expiry_field.evidence_snippet,
                            page_number=expiry_field.page_number,
                            source="rule",
                            confidence="medium",
                            review_state="needs_review",
                            created_at=now,
                        )
                        new_findings.append(finding)

            # Check 4: Mandatory Field Missing in Category
            doc_cat = document.category or ""
            if "Land" in doc_cat:
                survey_field = field_map.get("land_survey_number")
                if not survey_field or survey_field.state == "not_found":
                    finding = Finding(
                        id=f"fnd-{uuid.uuid4().hex[:8]}",
                        application_id=application.id,
                        document_id=document.id,
                        check_id="CHK_MISSING_SURVEY",
                        category="Completeness",
                        severity="medium",
                        title="Missing land survey or khasra number",
                        explanation="The uploaded land deed does not contain an identifiable survey or plot allocation reference.",
                        extracted_value="Not found",
                        expected_value="Survey or Khasra Number",
                        evidence_snippet=None,
                        page_number=None,
                        source="rule",
                        confidence="medium",
                        review_state="needs_review",
                        created_at=now,
                    )
                    new_findings.append(finding)

            if "Safety" in doc_cat:
                id_field = field_map.get("document_identifier")
                if not id_field or id_field.state == "not_found":
                    finding = Finding(
                        id=f"fnd-{uuid.uuid4().hex[:8]}",
                        application_id=application.id,
                        document_id=document.id,
                        check_id="CHK_MISSING_CERT_NO",
                        category="Completeness",
                        severity="medium",
                        title="Missing certificate reference identifier",
                        explanation="The safety compliance certificate lacks a verified certificate or registration number.",
                        extracted_value="Not found",
                        expected_value="Certificate Reference No.",
                        evidence_snippet=None,
                        page_number=None,
                        source="rule",
                        confidence="medium",
                        review_state="needs_review",
                        created_at=now,
                    )
                    new_findings.append(finding)

        elif extraction_res.status == "empty":
            finding = Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                application_id=application.id,
                document_id=document.id,
                check_id="CHK_EMPTY_DOC",
                category="Completeness",
                severity="high",
                title="Empty document file",
                explanation="The uploaded document contains zero bytes or no renderable content.",
                extracted_value="0 bytes",
                expected_value="Valid document payload",
                evidence_snippet=None,
                page_number=None,
                source="rule",
                confidence="high",
                review_state="needs_review",
                created_at=now,
            )
            new_findings.append(finding)

        elif extraction_res.status == "failed":
            finding = Finding(
                id=f"fnd-{uuid.uuid4().hex[:8]}",
                application_id=application.id,
                document_id=document.id,
                check_id="CHK_CORRUPT_DOC",
                category="Completeness",
                severity="high",
                title="Unreadable or corrupt document",
                explanation=f"Text extraction failed: {extraction_res.error_message}",
                extracted_value="Corrupt file",
                expected_value="Valid uncorrupted PDF/image",
                evidence_snippet=None,
                page_number=None,
                source="rule",
                confidence="high",
                review_state="needs_review",
                created_at=now,
            )
            new_findings.append(finding)

        # Persist new findings
        for f in new_findings:
            db.add(f)

        # Update application status to needs_attention if high severity findings detected
        has_high_severity = any(f.severity == "high" for f in new_findings)
        if has_high_severity and application.current_status not in ["overdue"]:
            application.current_status = "needs_attention"
            db.add(application)

        # Record audit event
        audit = AuditEvent(
            id=f"evt-{uuid.uuid4().hex[:8]}",
            actor_id=actor.id,
            actor_name=actor.display_name,
            actor_role=actor.role,
            action="Document verification run completed",
            entity_type="document",
            entity_id=document.id,
            timestamp=now,
            detail=json.dumps({
                "document_id": document.id,
                "filename": document.original_filename,
                "extraction_status": extraction_res.status,
                "findings_generated": len(new_findings),
            }),
        )
        db.add(audit)
        db.commit()

        return extraction_record, new_findings
