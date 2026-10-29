from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class StudentCsvRowResult(BaseModel):
    row_number: int
    student_id: str
    apaar_id: str
    status: str  # "Valid", "Warning", "Rejected"
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    data: Dict[str, str] = Field(default_factory=dict)


class StudentCsvUploadSummary(BaseModel):
    file_name: str
    batch_reference: str
    total_rows: int
    valid_rows_count: int
    warning_rows_count: int
    rejected_rows_count: int
    column_mapping_issues: List[str] = Field(default_factory=list)
    row_results: List[StudentCsvRowResult] = Field(default_factory=list)
    timestamp: str
    engine: str = "AICTE Deterministic Ingestion Engine v2.4 (Server-side)"


class StudentRecordSummary(BaseModel):
    id: str
    apaar_masked: str
    enrollment_number: str
    full_name: str
    institution_id: Optional[int] = None
    institution_name: Optional[str] = None
    institution_code: Optional[str] = None
    program: str
    batch_year: int
    cgpa: Optional[float] = None
    verification_status: str
