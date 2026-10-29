import { AcademicYear, StateUT } from "./governance";

export type ReportType =
  | "institutional_enrolment"
  | "intake_utilization"
  | "validation_findings"
  | "duplicate_conflicts"
  | "submission_history"
  | "audit_events";

export interface ReportDefinition {
  type: ReportType;
  title: string;
  category: "Intake & Enrolment" | "Validation & Compliance" | "Audit & Governance";
  description: string;
  expectedColumns: string[];
  filenamePrefix: string;
  complianceNotice: string;
}

export interface GeneratedReportRecord {
  id: string;
  reportType: ReportType;
  title: string;
  filename: string;
  rowCount: number;
  fileSizeBytes: number;
  generatedAt: string;
  generatedBy: string;
  appliedFilters: {
    academicYear?: AcademicYear | "All";
    state?: StateUT | "All";
    institutionCode?: string | "All";
    severity?: string | "All";
  };
}

export interface ReportFilterOptions {
  reportType: ReportType;
  academicYear?: AcademicYear | "All";
  state?: StateUT | "All";
  institutionCode?: string | "All";
}
