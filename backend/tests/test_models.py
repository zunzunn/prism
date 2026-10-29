from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.institution import Institution
from app.models.student import Student
from app.models.verification import VerificationRequest


def test_model_definitions():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()

    inst = Institution(
        aicte_id="1-0000001",
        name="Test Institute of Technology",
        state="Karnataka",
        district="Bengaluru",
    )
    session.add(inst)
    session.commit()
    session.refresh(inst)

    assert inst.name == "Test Institute of Technology"
    assert inst.aicte_id == "1-0000001"
    assert inst.is_active is True

    student = Student(
        apaar_id="1234-5678-9012",
        enrollment_number="ENR-2026-001",
        full_name="Aarav Sharma",
        program="B.Tech Computer Science",
        batch_year=2026,
        institution_id=inst.id,
    )
    session.add(student)
    session.commit()
    session.refresh(student)

    assert student.full_name == "Aarav Sharma"
    assert student.verification_status == "Pending"

    req = VerificationRequest(
        request_reference="REQ-001",
        student_id=student.id,
        verifier_name="Enterprise Corp",
    )
    session.add(req)
    session.commit()
    session.refresh(req)

    assert req.request_reference == "REQ-001"
    assert req.verifier_type == "Employer"
    assert req.status == "Pending"

    session.close()
