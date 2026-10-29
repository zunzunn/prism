import { AcademicYear, StateUT } from "./governance";

export type ValidationCategory =
  | "APAAR Identifier"
  | "Duplicate Detection"
  | "Intake Validation"
  | "Data Consistency";

export type ValidationSeverity = "Critical" | "Warning" | "Informational";

export type FindingReviewStatus =
  | "Open"
  | "Under Review"
  | "Explanation Requested"
  | "Resolved"
  | "Dismissed False Positive";

export interface FindingEvidence {
  matchedField: string;
  sourceValue: string;
  conflictingValue?: string;
  ruleContext: string;
  normalizedToken?: string;
}

export interface ValidationFinding {
  id: string; // e.g., "FND-2026-001"
  ruleId: string; // e.g., "RULE-APAAR-002"
  ruleName: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  affectedRecordReferences: string[]; // e.g., ["STU-001", "STU-004"]
  studentName?: string;
  institutionCode: string;
  institutionName: string;
  academicYear: AcademicYear;
  state?: StateUT;
  explanation: string;
  evidence: FindingEvidence[];
  suggestedAction: string;
  reviewStatus: FindingReviewStatus;
  dismissalReason?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  auditTrail: ValidationAuditEvent[];
}

export interface ValidationAuditEvent {
  id: string;
  findingId: string;
  actor: string;
  action: string;
  previousStatus: FindingReviewStatus;
  newStatus: FindingReviewStatus;
  reason: string;
  timestamp: string;
}

export interface ValidationMetrics {
  totalRecordsEvaluated: number;
  validRecords: number;
  invalidRecords: number;
  recordsRequiringReview: number;
  potentialDuplicateEnrolments: number;
  intakeComplianceAlerts: number;
}

export interface ValidationFilterParams {
  search?: string;
  academicYear?: AcademicYear | "All";
  institutionCode?: string | "All";
  category?: ValidationCategory | "All";
  severity?: ValidationSeverity | "All";
  reviewStatus?: FindingReviewStatus | "All";
  page?: number;
  pageSize?: number;
}

export interface IntakePolicyRule {
  institutionCode: string;
  programmeName: string;
  academicYear: AcademicYear;
  baseApprovedIntake: number;
  permittedEwsQuota: number; // 10%
  permittedTfwQuota: number; // 5%
  permittedSupernumeraryOther: number; // PMSSS, Kashmiri Migrant, etc.
  isPolicyRuleActive: boolean;
}
