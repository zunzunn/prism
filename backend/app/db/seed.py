"""
Deterministic database seed script for CREDEN demo environment.
Populates institutions, core student profiles, and verification requests.
Run via:
    python -m app.db.seed
    or
    python -m app.db.seed --reset
"""
import sys
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.institution import Institution
from app.models.student import Student
from app.models.verification import VerificationRequest


SEED_INSTITUTIONS = [
    {
        "aicte_id": "1-332901124",
        "name": "College of Engineering, Pune (COEP)",
        "state": "Maharashtra",
        "district": "Pune",
        "institution_type": "State Autonomous",
        "accreditation_status": "NBA Tier-1 / NAAC A++",
    },
    {
        "aicte_id": "1-482910441",
        "name": "Veermata Jijabai Technological Institute (VJTI)",
        "state": "Maharashtra",
        "district": "Mumbai City",
        "institution_type": "State Autonomous",
        "accreditation_status": "NBA Tier-1 / NAAC A+",
    },
    {
        "aicte_id": "1-772910382",
        "name": "RV College of Engineering (RVCE)",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "institution_type": "Private Autonomous",
        "accreditation_status": "NBA Tier-1 / NAAC A+",
    },
    {
        "aicte_id": "1-552910891",
        "name": "BMS College of Engineering (BMSCE)",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "institution_type": "Private Autonomous",
        "accreditation_status": "NBA Tier-1 / NAAC A++",
    },
    {
        "aicte_id": "1-882910344",
        "name": "Delhi Technological University (DTU)",
        "state": "Delhi",
        "district": "North West Delhi",
        "institution_type": "State University",
        "accreditation_status": "NAAC A / NIRF Top 35",
    },
    {
        "aicte_id": "1-882910129",
        "name": "Netaji Subhas University of Technology (NSUT)",
        "state": "Delhi",
        "district": "South West Delhi",
        "institution_type": "State University",
        "accreditation_status": "NAAC A / NIRF Top 50",
    },
    {
        "aicte_id": "1-558291023",
        "name": "PSG College of Technology",
        "state": "Tamil Nadu",
        "district": "Coimbatore",
        "institution_type": "Govt Aided Autonomous",
        "accreditation_status": "NBA Accredited / NAAC A+",
    },
    {
        "aicte_id": "1-112910443",
        "name": "Thiagarajar College of Engineering",
        "state": "Tamil Nadu",
        "district": "Madurai",
        "institution_type": "Govt Aided Autonomous",
        "accreditation_status": "NBA Tier-1 / NAAC A+",
    },
    {
        "aicte_id": "1-442910118",
        "name": "L.D. College of Engineering",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "institution_type": "Government",
        "accreditation_status": "NBA Accredited / NAAC A+",
    },
    {
        "aicte_id": "1-992910512",
        "name": "Jadavpur University Faculty of Engg",
        "state": "West Bengal",
        "district": "Kolkata",
        "institution_type": "State University",
        "accreditation_status": "NAAC A++ / NIRF Top 10",
    },
    {
        "aicte_id": "1-449102871",
        "name": "National Institute of Engineering (NIE), Mysuru",
        "state": "Karnataka",
        "district": "Mysuru",
        "institution_type": "Private Autonomous",
        "accreditation_status": "NBA Accredited / NAAC A",
    },
    {
        "aicte_id": "1-772910291",
        "name": "Institute of Engineering & Tech, Lucknow",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "institution_type": "State Autonomous",
        "accreditation_status": "NBA Accredited / NAAC A",
    },
]

SEED_STUDENTS = [
    {
        "apaar_id": "982344129011",
        "enrollment_number": "COEP/2026/CS/042",
        "full_name": "Aarav Sharma",
        "email": "aarav.sharma@coep.ac.in",
        "institution_aicte_id": "1-332901124",
        "program": "Computer Science & Engineering",
        "batch_year": 2026,
        "cgpa": 9.24,
        "verification_status": "Verified",
    },
    {
        "apaar_id": "982377213401",
        "enrollment_number": "DTU/2026/IT/108",
        "full_name": "Priya Patel",
        "email": "priya.patel@dtu.ac.in",
        "institution_aicte_id": "1-882910344",
        "program": "Information Technology",
        "batch_year": 2026,
        "cgpa": 8.45,
        "verification_status": "In Review",
    },
    {
        "apaar_id": "982388912044",
        "enrollment_number": "COEP/2026/ME/019",
        "full_name": "Rohan Verma",
        "email": "rohan.verma@coep.ac.in",
        "institution_aicte_id": "1-332901124",
        "program": "Mechanical Engineering",
        "batch_year": 2026,
        "cgpa": 8.75,
        "verification_status": "Verified",
    },
    {
        "apaar_id": "982399990000",
        "enrollment_number": "UNAC/2026/CS/999",
        "full_name": "Sneha Nair",
        "email": "sneha.nair@unaccredited.edu",
        "institution_aicte_id": "1-882910344",  # mapped fallback
        "program": "Unapproved Computer Engineering",
        "batch_year": 2026,
        "cgpa": 6.80,
        "verification_status": "Flagged",
    },
    {
        "apaar_id": "982311223344",
        "enrollment_number": "PSG/2024/EEE/055",
        "full_name": "Aditya Joshi",
        "email": "aditya.joshi@psgtech.ac.in",
        "institution_aicte_id": "1-558291023",
        "program": "Electrical & Electronics Engg",
        "batch_year": 2024,
        "cgpa": 8.90,
        "verification_status": "Verified",
    },
]

SEED_VERIFICATIONS = [
    {
        "request_reference": "VRF-2026-V8892",
        "student_apaar": "982344129011",
        "verifier_name": "Corporate Screening Partner",
        "verifier_type": "Employer",
        "status": "Verified",
        "document_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "notes": "Verified authentic degree credential against AICTE approved intake",
        "verified_at": datetime.now(timezone.utc),
    },
    {
        "request_reference": "VRF-2026-R4109",
        "student_apaar": "982377213401",
        "verifier_name": "TCS National Screening",
        "verifier_type": "Employer",
        "status": "In Review",
        "document_hash": "4a7d1ed414474e4033ac29ccb8653d9b002c62356c403697dbcb8f862f43714c",
        "notes": "Dual-enrolment reconciliation underway with state DTE",
        "verified_at": None,
    },
    {
        "request_reference": "VRF-2026-D9901",
        "student_apaar": "982388912044",
        "verifier_name": "Infosys Compliance",
        "verifier_type": "Employer",
        "status": "Verified",
        "document_hash": "6f7c2d1b098192849e71d37a288937ef12b48a1c90471203b8791038e21947ac",
        "notes": "Resolved duplicate conflict cleared by state counselling authority",
        "verified_at": datetime.now(timezone.utc),
    },
    {
        "request_reference": "VRF-2026-X0012",
        "student_apaar": "982399990000",
        "verifier_name": "Direct Public Verification",
        "verifier_type": "Public",
        "status": "Revoked",
        "document_hash": "b2c1d3e4f5a60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
        "notes": "Revoked: Programme intake exceeds approved AICTE statutory quota",
        "verified_at": None,
    },
    {
        "request_reference": "VRF-2025-EXP99",
        "student_apaar": "982311223344",
        "verifier_name": "Admissions Desk",
        "verifier_type": "University",
        "status": "Discrepancy",
        "document_hash": "99887766554433221100aabbccddeeff00112233445566778899aabbccddeeff",
        "notes": "Expired reference - verification window lapsed",
        "verified_at": None,
    },
]


def seed_database(reset: bool = False):
    """Deterministically populates database with synthetic records."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        if reset:
            print("[INFO] Resetting existing database tables...")
            db.query(VerificationRequest).delete()
            db.query(Student).delete()
            db.query(Institution).delete()
            db.commit()

        # 1. Institutions
        inst_map = {}
        for inst_data in SEED_INSTITUTIONS:
            existing = db.query(Institution).filter_by(aicte_id=inst_data["aicte_id"]).first()
            if not existing:
                inst = Institution(**inst_data)
                db.add(inst)
                db.flush()
                inst_map[inst_data["aicte_id"]] = inst.id
            else:
                inst_map[inst_data["aicte_id"]] = existing.id

        db.commit()
        print(f"[SUCCESS] Seeded {len(SEED_INSTITUTIONS)} institutions.")

        # 2. Students
        stu_map = {}
        for stu_data in SEED_STUDENTS:
            existing_stu = db.query(Student).filter_by(apaar_id=stu_data["apaar_id"]).first()
            if not existing_stu:
                inst_id = inst_map.get(stu_data["institution_aicte_id"])
                stu = Student(
                    apaar_id=stu_data["apaar_id"],
                    enrollment_number=stu_data["enrollment_number"],
                    full_name=stu_data["full_name"],
                    email=stu_data["email"],
                    institution_id=inst_id,
                    program=stu_data["program"],
                    batch_year=stu_data["batch_year"],
                    cgpa=stu_data["cgpa"],
                    verification_status=stu_data["verification_status"],
                )
                db.add(stu)
                db.flush()
                stu_map[stu_data["apaar_id"]] = stu.id
            else:
                stu_map[stu_data["apaar_id"]] = existing_stu.id

        db.commit()
        print(f"[SUCCESS] Seeded {len(SEED_STUDENTS)} core students.")

        # 3. Verification Requests
        for vrf_data in SEED_VERIFICATIONS:
            existing_vrf = db.query(VerificationRequest).filter_by(
                request_reference=vrf_data["request_reference"]
            ).first()
            if not existing_vrf:
                stu_id = stu_map.get(vrf_data["student_apaar"])
                if stu_id:
                    vrf = VerificationRequest(
                        request_reference=vrf_data["request_reference"],
                        student_id=stu_id,
                        verifier_name=vrf_data["verifier_name"],
                        verifier_type=vrf_data["verifier_type"],
                        status=vrf_data["status"],
                        document_hash=vrf_data["document_hash"],
                        notes=vrf_data["notes"],
                        verified_at=vrf_data["verified_at"],
                    )
                    db.add(vrf)

        db.commit()
        print(f"[SUCCESS] Seeded {len(SEED_VERIFICATIONS)} verification scenarios.")
        print("[DONE] CREDEN database seeding complete.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_flag = "--reset" in sys.argv
    seed_database(reset=reset_flag)
