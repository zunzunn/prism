from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    request_reference: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    student_id: Mapped[int] = mapped_column(Integer, ForeignKey("students.id"), nullable=False)
    verifier_name: Mapped[str] = mapped_column(String(255), nullable=False)
    verifier_type: Mapped[str] = mapped_column(String(100), default="Employer")  # Employer, University, Government
    status: Mapped[str] = mapped_column(
        String(50), default="Pending", index=True
    )  # Pending, Verified, Discrepancy, Revoked
    document_hash: Mapped[str] = mapped_column(String(128), nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    student = relationship("Student", back_populates="verifications")
