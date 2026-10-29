export type VerificationStatus = "Verified" | "Pending" | "Flagged" | "Discrepancy" | "In Review";

export interface StudentRecord {
  id: number;
  apaarId: string;
  enrollmentNumber: string;
  fullName: string;
  email: string;
  institutionName: string;
  aicteInstituteId: string;
  program: string;
  batchYear: number;
  cgpa: number;
  verificationStatus: VerificationStatus;
  documentHash: string;
  updatedAt: string;
}

export interface InstitutionRecord {
  id: number;
  aicteId: string;
  name: string;
  state: string;
  district: string;
  institutionType: string;
  accreditationStatus: string;
  activeStudentsCount: number;
  complianceScore: number;
}

export interface VerificationAuditRecord {
  id: string;
  requestId: string;
  studentName: string;
  apaarId: string;
  institution: string;
  requestedBy: string;
  verifierRole: "Employer" | "Higher Education" | "State Board" | "AICTE Auditor";
  status: VerificationStatus;
  timestamp: string;
  integrityHash: string;
}

export interface SystemMetrics {
  totalStudents: number;
  verifiedCredentials: number;
  pendingVerifications: number;
  flaggedDiscrepancies: number;
  activeInstitutions: number;
  verificationSuccessRate: number;
}
