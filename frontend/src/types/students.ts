import { AcademicYear } from "./governance";

export type AdmissionCategory =
  | "General / Open"
  | "OBC-NCL"
  | "SC"
  | "ST"
  | "EWS";

export type SupernumeraryCategory =
  | "None"
  | "EWS (10%)"
  | "Tuition Fee Waiver (TFW 5%)"
  | "PMSSS (J&K / Ladakh)"
  | "Defense Personnel Ward"
  | "Sports Quota"
  | "Kashmiri Migrant";

export type StudentEnrolmentStatus =
  | "Active Enrolment"
  | "Graduated"
  | "On Leave"
  | "Transferred"
  | "Withdrawn";

export type StudentValidationStatus =
  | "Verified"
  | "Pending Validation"
  | "Flagged Duplicate"
  | "Intake Over-Quota"
  | "Format Error";

export interface StudentRecordDetail {
  id: string; // Internal system UUID or ID
  apaarId: string; // 12-digit APAAR format: "9823-4412-9011"
  institutionStudentId: string; // e.g. "COEP/2026/CS/042"
  fullName: string;
  institutionCode: string;
  institutionName: string;
  state: string;
  programme: string;
  degreeLevel: string;
  academicYear: AcademicYear;
  admissionDate: string; // "2026-08-15"
  approvedIntakeReference: string; // e.g., "AICTE/INTK/2026/CS-60"
  admissionCategory: AdmissionCategory;
  supernumeraryCategory: SupernumeraryCategory;
  isNri: boolean;
  isOci: boolean;
  isForeignNational: boolean;
  enrolmentStatus: StudentEnrolmentStatus;
  validationStatus: StudentValidationStatus;
  lastUpdated: string;
  integrityHash: string;
  auditTrail: {
    event: string;
    timestamp: string;
    actor: string;
  }[];
}

export interface StudentFilterParams {
  search?: string;
  institutionCode?: string;
  academicYear?: AcademicYear | "All";
  programme?: string;
  admissionCategory?: AdmissionCategory | "All";
  validationStatus?: StudentValidationStatus | "All";
  sortBy?: "fullName" | "admissionDate" | "institutionName" | "validationStatus";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface CsvRowValidationResult {
  rowNumber: number;
  data: Record<string, string>;
  status: "Valid" | "Warning" | "Rejected";
  errors: string[];
  warnings: string[];
}

export interface CsvImportSummary {
  fileName: string;
  totalRows: number;
  validRowsCount: number;
  warningRowsCount: number;
  rejectedRowsCount: number;
  columnMappingIssues: string[];
  rowResults: CsvRowValidationResult[];
}
