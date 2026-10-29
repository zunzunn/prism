export type UserRole =
  | "AICTE Admin"
  | "Institution Admin"
  | "Student"
  | "Authorized Verifier";

export type AcademicYear = "2026-27" | "2025-26" | "2024-25";

export type StateUT =
  | "All States / UTs"
  | "Maharashtra"
  | "Karnataka"
  | "Tamil Nadu"
  | "Delhi"
  | "Uttar Pradesh"
  | "Gujarat"
  | "West Bengal";

export interface GovernanceMetrics {
  totalInstitutions: number;
  totalStudentRecords: number;
  submittedThisMonth: number;
  apaarValidationPassRate: number; // percentage
  pendingSubmissions: number;
  potentialDuplicateEnrolments: number;
  intakeComplianceAlerts: number;
  recordsRequiringReview: number;
}

export interface IntakeUtilizationSummary {
  enrolled: number;
  approvedCapacity: number;
  utilizationRate: number; // percentage
  sanctionedSeatsRemaining: number;
  supernumeraryApproved: number;
  supernumeraryEnrolled: number;
}

export interface InstitutionIntakeComparison {
  name: string;
  code: string;
  state: StateUT;
  approvedIntake: number;
  reportedEnrolment: number;
  utilizationRate: number;
  overIntakeFlag: boolean;
}

export interface ValidationHealthDistribution {
  validRecords: number;
  requiringReview: number;
  invalidRecords: number;
}

export interface RecentSubmissionRecord {
  id: string;
  batchReference: string;
  institutionName: string;
  institutionCode: string;
  state: StateUT;
  recordsCount: number;
  apaarVerifiedCount: number;
  status: "Completed" | "Processing" | "Needs Review" | "Failed";
  submittedAt: string;
}

export interface DuplicateAlertRecord {
  id: string;
  studentName: string;
  apaarId: string;
  primaryInstitution: string;
  conflictingInstitution: string;
  state: StateUT;
  program: string;
  overlapPeriod: string;
  confidenceScore: number; // 0 - 100
  severity: "Critical" | "Warning" | "Review";
  detectedAt: string;
  explanation: string;
  status: "Unresolved" | "Investigating" | "Resolved" | "False Positive";
}

export interface AuditActivityRecord {
  id: string;
  action: string;
  actor: string;
  role: string;
  details: string;
  timestamp: string;
  hash: string;
}
