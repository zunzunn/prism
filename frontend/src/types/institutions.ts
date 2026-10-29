import { StateUT, AcademicYear } from "./governance";

export type InstitutionStatus =
  | "Approved"
  | "Under Review"
  | "Quota Exceeded"
  | "Conditional Approval";

export interface ProgrammeIntake {
  id: string;
  programmeName: string;
  degreeLevel: "Undergraduate (B.Tech)" | "Postgraduate (M.Tech)" | "Diploma" | "MCA" | "MBA";
  approvedIntake: number;
  reportedEnrolment: number;
  supernumeraryApproved: number;
  supernumeraryEnrolled: number;
  utilizationRate: number;
  isOverIntake: boolean;
}

export interface InstitutionSubmission {
  id: string;
  batchReference: string;
  academicYear: AcademicYear;
  recordsSubmitted: number;
  apaarPassCount: number;
  discrepanciesCount: number;
  submittedAt: string;
  status: "Validated" | "Needs Reconciliation" | "Processing" | "Rejected";
}

export interface InstitutionDataQualityIssue {
  id: string;
  category: "APAAR Mismatch" | "Intake Threshold Breach" | "Duplicate Roll No" | "Biometric Token Expired";
  description: string;
  affectedRecords: number;
  severity: "Critical" | "Warning" | "Informational";
  detectedAt: string;
  status: "Open" | "Investigating" | "Resolved";
}

export interface InstitutionDetailRecord {
  id: string; // e.g., "1-332901124"
  code: string;
  name: string;
  state: StateUT;
  district: string;
  institutionType: "State Autonomous" | "Private Autonomous" | "Deemed University" | "Affiliated Engineering College";
  accreditation: string;
  status: InstitutionStatus;
  nodalOfficerName: string;
  nodalOfficerEmail: string;
  nodalOfficerPhone: string;
  establishedYear: number;
  totalApprovedProgrammes: number;
  approvedIntakeTotal: number;
  reportedEnrolmentTotal: number;
  lastSubmissionDate: string;
  programmes: ProgrammeIntake[];
  submissions: InstitutionSubmission[];
  qualityIssues: InstitutionDataQualityIssue[];
  supernumeraryPermitted: {
    ews10Percent: number;
    tfw5Percent: number;
    pmsss: number;
    nriPio: number;
  };
}

export interface InstitutionFilterParams {
  search?: string;
  state?: StateUT | "All";
  status?: InstitutionStatus | "All";
  academicYear?: AcademicYear;
  page?: number;
  pageSize?: number;
}
