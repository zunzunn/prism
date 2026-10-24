"""Deterministic and idempotent demo seed data generator with relative dates."""

from datetime import datetime, timedelta, timezone
from pathlib import Path
import pymupdf as fitz
from sqlmodel import Session, select
from app.config import settings
from app.models import (
    Application,
    AssignmentHistory,
    AuditEvent,
    ClarificationRequest,
    ClarificationResponse,
    ComplianceObligation,
    DecisionRecord,
    Document,
    DocumentExtraction,
    Finding,
    Institution,
    RegulatoryRule,
    RuleEvaluation,
    StageConfig,
    User,
)

from app.services.rules_engine import RulesEngine
from app.services.verification_pipeline import VerificationPipeline



def create_sample_file(storage_dir: Path, filename: str, content: bytes, overwrite: bool = False) -> str:
    """Create a sample file in local storage if not already present or if replacement is needed."""
    storage_dir.mkdir(parents=True, exist_ok=True)
    file_path = storage_dir / filename
    if not file_path.exists() or overwrite or file_path.stat().st_size <= 350:
        file_path.write_bytes(content)
    return filename


def create_sample_pdf(lines: list[str]) -> bytes:
    """Generate a clean PDF with selectable text lines using PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page()
    y = 60
    for line in lines:
        page.insert_text((50, y), line, fontsize=11)
        y += 24
    b = doc.tobytes()
    doc.close()
    return b


def seed_database(session: Session, force: bool = False) -> None:
    """Seed the database with realistic, deterministic sample data."""
    existing_stage = session.exec(select(StageConfig)).first()
    if existing_stage and not force:
        # Check if rules and obligations already seeded
        RulesEngine.ensure_default_rules(session)
        existing_oblg = session.exec(select(ComplianceObligation)).first()
        if not existing_oblg:
            user_off = session.exec(select(User).where(User.role == "officer")).first()
            apps = session.exec(select(Application)).all()
            for app in apps[:3]:
                RulesEngine.evaluate_application(app, session, user_off, trigger="seed_init")
        return

    if force:
        # Clean existing tables in dependency order
        for model in [
            DecisionRecord,
            ClarificationResponse,
            ClarificationRequest,
            AssignmentHistory,
            RuleEvaluation,
            ComplianceObligation,
            RegulatoryRule,
            AuditEvent,
            Finding,
            DocumentExtraction,
            Document,
            Application,
            StageConfig,
            User,
            Institution,
        ]:
            records = session.exec(select(model)).all()
            for r in records:
                session.delete(r)
        session.commit()



    now = datetime.now(timezone.utc)

    # 1. Institutions
    institutions = [
        Institution(
            id="inst-01",
            name="Apex Institute of Technology",
            code="INST-APEX-01",
            region="Western Region (Mumbai)",
            created_at=now - timedelta(days=90),
        ),
        Institution(
            id="inst-02",
            name="Horizon College of Engineering",
            code="INST-HORIZON-02",
            region="Northern Region (New Delhi)",
            created_at=now - timedelta(days=85),
        ),
        Institution(
            id="inst-03",
            name="Vanguard Polytechnic Institute",
            code="INST-VANGUARD-03",
            region="Southern Region (Bengaluru)",
            created_at=now - timedelta(days=70),
        ),
    ]
    for inst in institutions:
        session.add(inst)

    # 2. Users
    users = [
        User(
            id="usr-inst-01",
            display_name="Dr. Ramesh Gupta",
            email="r.gupta@apextech.example.test",
            role="institution_user",
            institution_id="inst-01",
            is_active=True,
            created_at=now - timedelta(days=90),
        ),
        User(
            id="usr-inst-02",
            display_name="Prof. Ananya Roy",
            email="a.roy@horizon.example.test",
            role="institution_user",
            institution_id="inst-02",
            is_active=True,
            created_at=now - timedelta(days=85),
        ),
        User(
            id="usr-off-01",
            display_name="Priya Sharma",
            email="p.sharma@regulatory.example.test",
            role="officer",
            institution_id=None,
            is_active=True,
            created_at=now - timedelta(days=120),
        ),
        User(
            id="usr-off-02",
            display_name="Rajesh Verma",
            email="r.verma@regulatory.example.test",
            role="officer",
            institution_id=None,
            is_active=True,
            created_at=now - timedelta(days=110),
        ),
        User(
            id="usr-adm-01",
            display_name="Vikramaditya Nair",
            email="admin@regulatory.example.test",
            role="admin",
            institution_id=None,
            is_active=True,
            created_at=now - timedelta(days=180),
        ),
    ]
    for user in users:
        session.add(user)

    # 3. Stage Configurations (Standard 8 regulatory approval stages)
    stages = [
        StageConfig(
            id="stage-draft",
            name="Draft",
            order=1,
            description="Application initiation and preliminary document collation by applicant institution",
            responsible_role="institution_user",
            requires_decision=False,
            allow_clarifications=False,
            is_terminal=False,
        ),
        StageConfig(
            id="stage-submitted",
            name="Submitted",
            order=2,
            description="Formal intake and intake queue processing upon institutional filing",
            responsible_role="officer",
            requires_decision=False,
            allow_clarifications=False,
            is_terminal=False,
        ),
        StageConfig(
            id="stage-doc-check",
            name="Document check",
            order=3,
            description="Primary scrutiny of mandatory statutory clearances, registrations, and formats",
            responsible_role="officer",
            requires_decision=False,
            allow_clarifications=True,
            is_terminal=False,
        ),
        StageConfig(
            id="stage-desk-review",
            name="Desk review",
            order=4,
            description="In-depth evaluation of evidence against APH compliance rules and institutional norms",
            responsible_role="officer",
            requires_decision=False,
            allow_clarifications=True,
            is_terminal=False,
        ),
        StageConfig(
            id="stage-clarification",
            name="Clarification",
            order=5,
            description="Interlocutory clarification exchange between scrutiny officers and institution",
            responsible_role="officer",
            requires_decision=False,
            allow_clarifications=True,
            is_terminal=False,
        ),
        StageConfig(
            id="stage-committee",
            name="Committee review",
            order=6,
            description="Scrutiny committee assessment and recommendation synthesis",
            responsible_role="officer",
            requires_decision=False,
            allow_clarifications=True,
            is_terminal=False,
        ),
        StageConfig(
            id="stage-decision",
            name="Decision pending",
            order=7,
            description="Final regulatory disposition pending authoritative officer sign-off",
            responsible_role="officer",
            requires_decision=True,
            allow_clarifications=False,
            is_terminal=False,
        ),
        StageConfig(
            id="stage-closed",
            name="Closed",
            order=8,
            description="Concluded approval cycle with immutable statutory determination record",
            responsible_role="officer",
            requires_decision=False,
            allow_clarifications=False,
            is_terminal=True,
        ),
    ]

    for stage in stages:
        session.add(stage)

    # 4. Applications (12 diverse items across stages, owners, and relative deadlines)
    applications = [
        Application(
            id="app-0001",
            ref="DEMO-APP-0001",
            institution_id="inst-01",
            application_type="Extension of Approval (EoA)",
            academic_year="2026-2027",
            current_stage_id="stage-doc-check",
            current_status="needs_attention",
            assigned_owner_id="usr-off-01",
            submission_timestamp=now - timedelta(days=5),
            due_date=now + timedelta(days=6),
            created_at=now - timedelta(days=12),
            updated_at=now - timedelta(hours=4),
        ),
        Application(
            id="app-0002",
            ref="DEMO-APP-0002",
            institution_id="inst-01",
            application_type="Increase in Intake / New Course",
            academic_year="2026-2027",
            current_stage_id="stage-clarification",
            current_status="overdue",
            assigned_owner_id="usr-off-01",
            submission_timestamp=now - timedelta(days=18),
            due_date=now - timedelta(days=3),  # Overdue
            created_at=now - timedelta(days=25),
            updated_at=now - timedelta(days=1),
        ),
        Application(
            id="app-0003",
            ref="DEMO-APP-0003",
            institution_id="inst-01",
            application_type="Extension of Approval (EoA)",
            academic_year="2026-2027",
            current_stage_id="stage-draft",
            current_status="draft",
            assigned_owner_id=None,
            submission_timestamp=None,
            due_date=now + timedelta(days=14),
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(hours=2),
        ),
        Application(
            id="app-0004",
            ref="DEMO-APP-0004",
            institution_id="inst-01",
            application_type="Closure of Course / Division",
            academic_year="2026-2027",
            current_stage_id="stage-desk-review",
            current_status="in_progress",
            assigned_owner_id="usr-off-02",
            submission_timestamp=now - timedelta(days=14),
            due_date=now + timedelta(days=8),
            created_at=now - timedelta(days=20),
            updated_at=now - timedelta(days=2),
        ),
        Application(
            id="app-0005",
            ref="DEMO-APP-0005",
            institution_id="inst-02",
            application_type="Extension of Approval (EoA)",
            academic_year="2026-2027",
            current_stage_id="stage-submitted",
            current_status="in_progress",
            assigned_owner_id="usr-off-01",
            submission_timestamp=now - timedelta(days=2),
            due_date=now + timedelta(days=10),
            created_at=now - timedelta(days=8),
            updated_at=now - timedelta(days=2),
        ),
        Application(
            id="app-0006",
            ref="DEMO-APP-0006",
            institution_id="inst-02",
            application_type="Introduction of Supernumerary Seats",
            academic_year="2026-2027",
            current_stage_id="stage-committee",
            current_status="in_progress",
            assigned_owner_id="usr-off-02",
            submission_timestamp=now - timedelta(days=22),
            due_date=now + timedelta(days=4),
            created_at=now - timedelta(days=30),
            updated_at=now - timedelta(days=1),
        ),
        Application(
            id="app-0007",
            ref="DEMO-APP-0007",
            institution_id="inst-02",
            application_type="Change of Site / Location",
            academic_year="2026-2027",
            current_stage_id="stage-desk-review",
            current_status="needs_attention",
            assigned_owner_id="usr-off-01",
            submission_timestamp=now - timedelta(days=15),
            due_date=now + timedelta(days=2),
            created_at=now - timedelta(days=21),
            updated_at=now - timedelta(hours=10),
        ),
        Application(
            id="app-0008",
            ref="DEMO-APP-0008",
            institution_id="inst-02",
            application_type="Extension of Approval (EoA)",
            academic_year="2026-2027",
            current_stage_id="stage-decision",
            current_status="in_progress",
            assigned_owner_id="usr-off-02",
            submission_timestamp=now - timedelta(days=28),
            due_date=now + timedelta(days=12),
            created_at=now - timedelta(days=35),
            updated_at=now - timedelta(days=3),
        ),
        Application(
            id="app-0009",
            ref="DEMO-APP-0009",
            institution_id="inst-03",
            application_type="New Technical Institution Establishment",
            academic_year="2026-2027",
            current_stage_id="stage-doc-check",
            current_status="overdue",
            assigned_owner_id="usr-off-01",
            submission_timestamp=now - timedelta(days=12),
            due_date=now - timedelta(days=1),  # Overdue
            created_at=now - timedelta(days=18),
            updated_at=now - timedelta(days=1),
        ),
        Application(
            id="app-0010",
            ref="DEMO-APP-0010",
            institution_id="inst-03",
            application_type="Extension of Approval (EoA)",
            academic_year="2026-2027",
            current_stage_id="stage-closed",
            current_status="approved",
            assigned_owner_id="usr-off-02",
            submission_timestamp=now - timedelta(days=40),
            due_date=now - timedelta(days=20),
            created_at=now - timedelta(days=50),
            updated_at=now - timedelta(days=15),
        ),
        Application(
            id="app-0011",
            ref="DEMO-APP-0011",
            institution_id="inst-03",
            application_type="Conversion of Diploma to Degree",
            academic_year="2026-2027",
            current_stage_id="stage-clarification",
            current_status="awaiting_reply",
            assigned_owner_id="usr-off-01",
            submission_timestamp=now - timedelta(days=10),
            due_date=now + timedelta(days=5),
            created_at=now - timedelta(days=16),
            updated_at=now - timedelta(hours=6),
        ),
        Application(
            id="app-0012",
            ref="DEMO-APP-0012",
            institution_id="inst-01",
            application_type="Extension of Approval (EoA)",
            academic_year="2025-2026",
            current_stage_id="stage-closed",
            current_status="closed",
            assigned_owner_id="usr-off-02",
            submission_timestamp=now - timedelta(days=120),
            due_date=now - timedelta(days=90),
            created_at=now - timedelta(days=130),
            updated_at=now - timedelta(days=80),
        ),
    ]
    for app in applications:
        session.add(app)

    # 5. Seed Real Dummy Files with extractable text and Document Records
    post_sub_date = (now + timedelta(days=12)).strftime("%d %b %Y")
    land_deed_pdf = create_sample_pdf([
        "GOVERNMENT REVENUE & LAND REGISTRATION RECORD",
        "==================================================",
        "Institution Name: Apex Institute of Technology",
        "Registration Deed No: DEED-MAH-2026-8841",
        f"Date of Registration: {post_sub_date}",
        "Plot Allocation: Western Educational Enclave",
        "Title Status: Verified and Free from Encumbrances",
    ])

    # Mandatory disclosure: Apex Institute of Technology, valid dates
    disclosure_pdf = create_sample_pdf([
        "AICTE MANDATORY DISCLOSURE 2026-2027",
        "==================================================",
        "Institution Name: Apex Institute of Technology",
        "Document Ref No: DISC-2026-AIT-09",
        "Date of Issuance: 12 Jan 2026",
        "Principal / Director: Dr. Ramesh Gupta",
        "Approved Academic Year: 2026-2027",
        "Total Approved Intake: 480 Seats",
    ])

    # Building safety: Apex Technical Academy (inconsistent), expired validity 15 Jan 2024
    safety_cert_pdf = create_sample_pdf([
        "FIRE & STRUCTURAL SAFETY COMPLIANCE CERTIFICATE",
        "==================================================",
        "Institution Name: Apex Technical Academy",
        "Certificate No: STR-CERT-2023-110",
        "Date of Issue: 15 Jan 2023",
        "Expiry date: 15 Jan 2024",
        "Issuing Authority: Municipal Fire & Safety Directorate",
    ])

    png_sample = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"

    file1 = create_sample_file(settings.storage_dir, "seed_land_deed.pdf", land_deed_pdf, overwrite=True)
    file2 = create_sample_file(settings.storage_dir, "seed_mandatory_disclosure.pdf", disclosure_pdf, overwrite=True)
    file3 = create_sample_file(settings.storage_dir, "seed_building_safety.pdf", safety_cert_pdf, overwrite=True)
    file4 = create_sample_file(settings.storage_dir, "seed_campus_layout.png", png_sample)

    documents = [
        Document(
            id="doc-0001",
            application_id="app-0001",
            original_filename="Land_Registration_Deed_2026.pdf",
            storage_filename=file1,
            mime_type="application/pdf",
            file_size=len(land_deed_pdf),
            uploaded_by_id="usr-inst-01",
            uploaded_at=now - timedelta(days=5),
            category="Land & Infrastructure",
        ),
        Document(
            id="doc-0002",
            application_id="app-0001",
            original_filename="AICTE_Mandatory_Disclosure_2026.pdf",
            storage_filename=file2,
            mime_type="application/pdf",
            file_size=len(disclosure_pdf),
            uploaded_by_id="usr-inst-01",
            uploaded_at=now - timedelta(days=5),
            category="Institutional Disclosure",
        ),
        Document(
            id="doc-0003",
            application_id="app-0002",
            original_filename="Building_Safety_Certificate.pdf",
            storage_filename=file3,
            mime_type="application/pdf",
            file_size=len(safety_cert_pdf),
            uploaded_by_id="usr-inst-01",
            uploaded_at=now - timedelta(days=18),
            category="Safety Compliance",
        ),
        Document(
            id="doc-0004",
            application_id="app-0005",
            original_filename="Campus_Layout_Plan_Approved.png",
            storage_filename=file4,
            mime_type="image/png",
            file_size=len(png_sample),
            uploaded_by_id="usr-inst-02",
            uploaded_at=now - timedelta(days=2),
            category="Architectural Blueprint",
        ),
    ]
    for doc in documents:
        session.add(doc)

    # 6. Audit Events
    audit_events = [
        AuditEvent(
            id="evt-0001",
            actor_id="usr-inst-01",
            actor_name="Dr. Ramesh Gupta",
            actor_role="institution_user",
            action="Application draft initiated",
            entity_type="application",
            entity_id="app-0001",
            timestamp=now - timedelta(days=12),
            detail='{"academic_year": "2026-2027", "type": "Extension of Approval (EoA)"}',
        ),
        AuditEvent(
            id="evt-0002",
            actor_id="usr-inst-01",
            actor_name="Dr. Ramesh Gupta",
            actor_role="institution_user",
            action="Document uploaded",
            entity_type="document",
            entity_id="doc-0001",
            timestamp=now - timedelta(days=5, hours=2),
            detail='{"filename": "Land_Registration_Deed_2026.pdf", "category": "Land & Infrastructure"}',
        ),
        AuditEvent(
            id="evt-0003",
            actor_id="usr-inst-01",
            actor_name="Dr. Ramesh Gupta",
            actor_role="institution_user",
            action="Application submitted for regulatory review",
            entity_type="application",
            entity_id="app-0001",
            timestamp=now - timedelta(days=5),
            detail='{"stage_entered": "stage-doc-check"}',
        ),
        AuditEvent(
            id="evt-0004",
            actor_id="usr-adm-01",
            actor_name="Vikramaditya Nair",
            actor_role="admin",
            action="Assigned review officer",
            entity_type="application",
            entity_id="app-0001",
            timestamp=now - timedelta(days=4),
            detail='{"assigned_officer": "Priya Sharma"}',
        ),
    ]
    for evt in audit_events:
        session.add(evt)

    session.commit()

    # 7. Run initial deterministic verification on seeded documents so findings exist for review
    officer_user = users[2]  # Priya Sharma (usr-off-01)
    inst_apex = institutions[0]
    inst_horizon = institutions[1]

    doc_meta = [
        (documents[0], applications[0], inst_apex),
        (documents[1], applications[0], inst_apex),
        (documents[2], applications[1], inst_apex),
        (documents[3], applications[4], inst_horizon),
    ]

    for doc, app, inst in doc_meta:
        VerificationPipeline.process_document(
            document=doc,
            application=app,
            institution=inst,
            actor=officer_user,
            db=session,
        )

    # 8. Seed regulatory rules and run deterministic compliance evaluation
    RulesEngine.ensure_default_rules(session)
    for app in [applications[0], applications[1], applications[4]]:
        RulesEngine.evaluate_application(
            application=app,
            db=session,
            actor=officer_user,
            trigger="seed_init",
        )

    # Seed one confirmed review on app-0001 for demonstration
    oblg_affi = session.get(ComplianceObligation, f"oblg_{applications[0].id}_RULE-AFFI-01")
    if oblg_affi:
        RulesEngine.record_obligation_review(
            obligation=oblg_affi,
            review_status="confirmed",
            decision="satisfied",
            notes="Affidavit on non-judicial stamp paper verified against AICTE Model Format. Notary registration valid.",
            actor=officer_user,
            db=session,
        )

    # 9. Seed Workflow Automation Entities (Assignments, Clarifications, Decisions)
    # Assignment history for app-0001

    assign_01 = AssignmentHistory(
        id="asgn-0001",
        application_id=applications[0].id,
        assigned_by_id=users[4].id,  # Vikramaditya Nair (admin)
        assigned_by_name=users[4].display_name,
        previous_owner_id=None,
        previous_owner_name=None,
        new_owner_id=users[2].id,  # Priya Sharma (officer)
        new_owner_name=users[2].display_name,
        reason="Initial application intake and primary scrutiny allocation",
        assigned_at=now - timedelta(days=4),
    )
    session.add(assign_01)

    # Clarification for app-0002 (Building Safety expiry)
    clr_01 = ClarificationRequest(
        id="clr-0001",
        application_id=applications[1].id,
        finding_id=None,
        rule_code="RULE-SAFE-01",
        title="Clarification on Expired Fire & Structural Safety Certificate",
        description=(
            "The submitted Building_Safety_Certificate.pdf (STR-CERT-2023-110) expired on 15 Jan 2024. "
            "Please submit a currently valid Structural Stability Certificate issued by the Municipal Fire & Safety Directorate "
            "covering the 2026-2027 academic cycle."
        ),
        requested_by_id=users[2].id,
        requested_by_name=users[2].display_name,
        status="open",
        due_date=now + timedelta(days=5),
        created_at=now - timedelta(days=3),
        updated_at=now - timedelta(days=3),
    )
    session.add(clr_01)

    # Clarification for app-0011 (Responded by institution)
    clr_02 = ClarificationRequest(
        id="clr-0002",
        application_id=applications[10].id,
        finding_id=None,
        rule_code="RULE-AFFI-01",
        title="Discrepancy in Faculty Roster and AICTE Pay Scales",
        description="Please provide attested Form 16 statements and board approval resolutions for newly appointed faculty in the Mechanical Engineering department.",
        requested_by_id=users[2].id,
        requested_by_name=users[2].display_name,
        status="responded",
        due_date=now + timedelta(days=2),
        created_at=now - timedelta(days=4),
        updated_at=now - timedelta(days=1),
    )
    session.add(clr_02)

    resp_01 = ClarificationResponse(
        id="clr-resp-0001",
        clarification_id=clr_02.id,
        sender_id=users[0].id,  # Dr. Ramesh Gupta
        sender_name=users[0].display_name,
        sender_role="institution_user",
        message="We have collated the attested Form 16 statements and governing body resolutions. The verified documents confirm 7th CPC compliance.",
        document_id=None,
        created_at=now - timedelta(days=1),
    )
    session.add(resp_01)

    # Authorized decision record for app-0012 (Closed application)
    dec_01 = DecisionRecord(
        id="dec-0001",
        application_id=applications[11].id,
        decided_by_id=users[3].id,  # Rajesh Verma
        decided_by_name=users[3].display_name,
        decision="approved",
        decision_reason="All statutory clearances, land deeds, and municipal approvals verified compliant under AICTE APH 2025-2026 guidelines.",
        conditions_or_remarks="Annual compliance report to be submitted by 30 June 2026.",
        reference_findings_json="[]",
        decided_at=now - timedelta(days=80),
    )
    session.add(dec_01)

    session.commit()


