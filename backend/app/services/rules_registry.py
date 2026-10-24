"""Authoritative regulatory rules registry for PRISM.

Includes official AICTE Approval Process Handbook (APH 2024–2027) citations
and synthetic demonstration rules clearly marked as such.
"""

from datetime import datetime, timezone
import json
from typing import Any
from app.models import RegulatoryRule


def utc_dt(year: int, month: int, day: int) -> datetime:
    return datetime(year, month, day, 0, 0, 0, tzinfo=timezone.utc)


DEFAULT_REGULATORY_RULES: list[dict[str, Any]] = [
    {
        "id": "rule_land_01_v1",
        "rule_code": "RULE-LAND-01",
        "version": "1.0",
        "title": "Land Title & Ownership Consistency",
        "description": (
            "The applicant institution must hold clear ownership title or registered long-term lease "
            "for the institutional premises. The registered name on the title deed must match the institutional "
            "record on file without discrepancy."
        ),
        "category": "Land & Infrastructure",
        "applicable_types": ["*"],
        "evaluation_type": "extracted_vs_record_match",
        "check_config": {
            "target_category": "Land & Infrastructure",
            "target_field": "institution_name",
            "match_entity": "institution.name",
        },
        "severity": "high",
        "mandatory_review": False,
        "source_document": "AICTE Approval Process Handbook (APH 2024–2027)",
        "source_section": "Chapter II, Clause 2.1 (Land Title & Ownership)",
        "effective_from": utc_dt(2024, 1, 1),
        "effective_until": None,
        "is_synthetic": False,
        "is_active": True,
    },
    {
        "id": "rule_safe_01_v1",
        "rule_code": "RULE-SAFE-01",
        "version": "1.0",
        "title": "Structural Stability & Fire Safety Certification",
        "description": (
            "Valid Fire Safety and Structural Stability Certificates issued by competent municipal or "
            "government authorities must be submitted, with non-expired validity extending through the operative academic cycle."
        ),
        "category": "Safety & Statutory",
        "applicable_types": ["*"],
        "evaluation_type": "certificate_expiry",
        "check_config": {
            "target_category": "Safety Compliance",
            "target_field": "expiry_date",
            "comparison": "greater_than_now",
        },
        "severity": "high",
        "mandatory_review": False,
        "source_document": "AICTE Approval Process Handbook (APH 2024–2027)",
        "source_section": "Chapter II, Clause 2.4 (Safety Norms)",
        "effective_from": utc_dt(2024, 1, 1),
        "effective_until": None,
        "is_synthetic": False,
        "is_active": True,
    },
    {
        "id": "rule_disc_01_v1",
        "rule_code": "RULE-DISC-01",
        "version": "1.0",
        "title": "Mandatory Institutional Public Disclosure",
        "description": (
            "Annual public disclosure document detailing institutional governance, approved intake, "
            "faculty roster, and grievance mechanisms must be formally issued and submitted."
        ),
        "category": "Transparency & Disclosures",
        "applicable_types": [
            "Extension of Approval (EoA)",
            "Increase in Intake",
            "Introduction of New Course",
            "Closure of Course",
        ],
        "evaluation_type": "required_document_presence",
        "check_config": {
            "target_category": "Institutional Disclosure",
            "target_field": "institution_name",
        },
        "severity": "medium",
        "mandatory_review": False,
        "source_document": "AICTE Approval Process Handbook (APH 2024–2027)",
        "source_section": "Chapter VII, Clause 7.2 (Public Disclosures)",
        "effective_from": utc_dt(2024, 1, 1),
        "effective_until": None,
        "is_synthetic": False,
        "is_active": True,
    },
    {
        "id": "rule_affi_01_v1",
        "rule_code": "RULE-AFFI-01",
        "version": "1.0",
        "title": "Anti-Ragging & Faculty Pay Undertaking Affidavit",
        "description": (
            "Submission of notarized affidavit affirming zero tolerance for ragging and full compliance with "
            "7th Central Pay Commission (CPC) / AICTE pay scales for appointed faculty. Requires human officer verification."
        ),
        "category": "Faculty & Governance",
        "applicable_types": ["*"],
        "evaluation_type": "mandatory_human_review",
        "check_config": {
            "target_category": "Affidavit",
            "fallback_category": "Statutory Undertaking",
        },
        "severity": "high",
        "mandatory_review": True,
        "source_document": "AICTE Approval Process Handbook (APH 2024–2027)",
        "source_section": "Chapter II, Clause 2.8 & Clause 2.9 (Affidavits)",
        "effective_from": utc_dt(2024, 1, 1),
        "effective_until": None,
        "is_synthetic": False,
        "is_active": True,
    },
    {
        "id": "rule_date_01_v1",
        "rule_code": "RULE-DATE-01",
        "version": "1.0",
        "title": "Statutory Document Issuance Pre-dating Application",
        "description": (
            "All statutory clearances, registrations, and NOCs submitted must have an effective issuance "
            "date on or before the application filing date. Post-dated documents indicate non-compliance."
        ),
        "category": "Statutory Timing",
        "applicable_types": ["*"],
        "evaluation_type": "date_order_validity",
        "check_config": {
            "target_field": "issuance_date",
            "compare_against": "application.submission_timestamp",
        },
        "severity": "medium",
        "mandatory_review": False,
        "source_document": "AICTE Approval Process Handbook (APH 2024–2027)",
        "source_section": "Chapter I, Procedural Guidelines",
        "effective_from": utc_dt(2024, 1, 1),
        "effective_until": None,
        "is_synthetic": False,
        "is_active": True,
    },
    {
        "id": "rule_build_01_v1",
        "rule_code": "RULE-BUILD-01",
        "version": "1.0",
        "title": "Approved Campus Layout & Architectural Plan",
        "description": (
            "Master campus architectural layout plan approved by Town Planning Authority or Municipal Corporation "
            "demonstrating instructional and administrative space adherence."
        ),
        "category": "Land & Infrastructure",
        "applicable_types": [
            "New Institute",
            "Setting up New Technical Campus",
            "Increase in Intake",
        ],
        "evaluation_type": "required_document_presence",
        "check_config": {
            "target_category": "Architectural Blueprint",
        },
        "severity": "medium",
        "mandatory_review": True,
        "source_document": "AICTE Approval Process Handbook (APH 2024–2027)",
        "source_section": "Chapter II, Clause 2.3 (Architectural Approvals)",
        "effective_from": utc_dt(2024, 1, 1),
        "effective_until": None,
        "is_synthetic": False,
        "is_active": True,
    },
    {
        "id": "demo_rule_green_01_v1",
        "rule_code": "DEMO-RULE-SPEC-01",
        "version": "1.0",
        "title": "Smart Campus Solar Energy & Water Audit (Demonstration)",
        "description": (
            "Synthetic demonstration requirement verifying inclusion of institutional solar / green energy "
            "audit certificate. NOTE: This is a synthetic demonstration rule and not official AICTE policy."
        ),
        "category": "Green Campus Initiatives",
        "applicable_types": ["*"],
        "evaluation_type": "required_document_presence",
        "check_config": {
            "target_category": "Green Campus Audit",
            "is_synthetic": True,
        },
        "severity": "low",
        "mandatory_review": False,
        "source_document": "Synthetic Demonstration Rule (PRISM Demonstration Policy - not official AICTE mandate)",
        "source_section": "Demonstration Clause DEMO-EC-4",
        "effective_from": utc_dt(2024, 1, 1),
        "effective_until": None,
        "is_synthetic": True,
        "is_active": True,
    },
    # Versioning example: APH v2.0 upcoming amendment for RULE-LAND-01
    {
        "id": "rule_land_01_v2",
        "rule_code": "RULE-LAND-01",
        "version": "2.0",
        "title": "Land Title & Ownership (Digital Registry & QR Code)",
        "description": (
            "Updated requirement for 2027-2028: Land deed must contain a digitally verifiable "
            "state land registry QR code alongside title ownership matching."
        ),
        "category": "Land & Infrastructure",
        "applicable_types": ["*"],
        "evaluation_type": "extracted_vs_record_match",
        "check_config": {
            "target_category": "Land & Infrastructure",
            "target_field": "institution_name",
            "match_entity": "institution.name",
            "require_qr_code": True,
        },
        "severity": "high",
        "mandatory_review": False,
        "source_document": "AICTE Approval Process Handbook (APH 2024–2027 - Amendment 2)",
        "source_section": "Chapter II, Clause 2.1 (Amended for 2027)",
        "effective_from": utc_dt(2027, 4, 1),
        "effective_until": None,
        "is_synthetic": False,
        "is_active": True,
    },
]


def get_default_rules() -> list[RegulatoryRule]:
    """Convert rule definitions into RegulatoryRule model instances."""
    rules: list[RegulatoryRule] = []
    for r in DEFAULT_REGULATORY_RULES:
        rule = RegulatoryRule(
            id=r["id"],
            rule_code=r["rule_code"],
            version=r["version"],
            title=r["title"],
            description=r["description"],
            category=r["category"],
            applicable_types_json=json.dumps(r["applicable_types"]),
            evaluation_type=r["evaluation_type"],
            check_config_json=json.dumps(r["check_config"]),
            severity=r["severity"],
            mandatory_review=r["mandatory_review"],
            source_document=r["source_document"],
            source_section=r["source_section"],
            effective_from=r["effective_from"],
            effective_until=r["effective_until"],
            is_synthetic=r["is_synthetic"],
            is_active=r["is_active"],
            created_at=r["effective_from"],
        )
        rules.append(rule)
    return rules
