import { StateUT, AcademicYear } from "./governance";

export type IntakeComplianceStatus =
  | "Compliant"
  | "Under Capacity"
  | "Near Capacity"
  | "Over Capacity Breach"
  | "Requires Review";

export interface SupernumeraryBreakdown {
  ews10Percent: number;
  tfw5Percent: number;
  pmsss: number;
  nriPio: number;
  otherApproved: number;
  totalSupernumeraryApproved: number;
  totalSupernumeraryEnrolled: number;
}

export interface ProgrammeIntakeRow {
  id: string; // e.g. "PRG-COEP-01"
  institutionCode: string;
  institutionName: string;
  state: StateUT;
  programmeName: string;
  degreeLevel: string;
  academicYear: AcademicYear;
  baseApprovedIntake: number;
  reportedEnrolment: number;
  supernumerary: SupernumeraryBreakdown;
  totalPermissibleCapacity: number; // Base + Supernumerary
  regularUtilizationRate: number; // (reported / base) * 100
  effectiveUtilizationRate: number; // (reported / totalPermissibleCapacity) * 100
  remainingCapacity: number;
  complianceStatus: IntakeComplianceStatus;
  statusReason: string;
  isPolicyMissing: boolean;
  approvalLetterRef: string;
  lastUpdated: string;
}

export interface IntakeOverviewMetrics {
  totalApprovedIntake: number; // Sum of base regular intake
  totalReportedEnrolment: number;
  overallRegularUtilizationRate: number;
  totalSupernumeraryApproved: number;
  totalSupernumeraryEnrolled: number;
  totalRemainingCapacity: number;
  institutionsRequiringReviewCount: number;
  programmesWithViolationsCount: number;
  totalProgrammesMonitored: number;
}

export interface IntakeFilterParams {
  search?: string;
  academicYear?: AcademicYear | "All";
  state?: StateUT | "All";
  institutionCode?: string | "All";
  programmeName?: string | "All";
  admissionCategory?: string | "All";
  complianceStatus?: IntakeComplianceStatus | "All";
  page?: number;
  pageSize?: number;
}

export interface IntakeUtilizationResult {
  baseApprovedIntake: number;
  totalPermissibleCapacity: number;
  reportedEnrolment: number;
  regularUtilizationRate: number;
  effectiveUtilizationRate: number;
  remainingCapacity: number;
  complianceStatus: IntakeComplianceStatus;
  statusReason: string;
  isPolicyMissing: boolean;
}
