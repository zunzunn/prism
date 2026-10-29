import {
  ReportDefinition,
  GeneratedReportRecord,
  ReportFilterOptions,
} from "@/types/reports";
import { MOCK_INSTITUTIONS } from "@/data/institutionsData";
import { buildAllProgrammeIntakeRows } from "./intakeService";
import { INITIAL_VALIDATION_FINDINGS } from "@/data/validationData";

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    type: "institutional_enrolment",
    title: "Institutional Student Enrolment Ledger",
    category: "Intake & Enrolment",
    description:
      "Comprehensive institution-level student admissions, aggregate sanctioned capacity, reported enrollment, and accreditation profile.",
    expectedColumns: [
      "Institution Code",
      "Institution Name",
      "State",
      "District",
      "Institution Type",
      "Accreditation",
      "Approved Programmes",
      "Approved Intake Total",
      "Reported Enrolment Total",
      "Utilization Rate (%)",
      "Governance Status",
      "Last Submission Timestamp",
    ],
    filenamePrefix: "creden-institutional-enrolment",
    complianceNotice:
      "DEMONSTRATION DATA ONLY. Official enrollment submissions require state DTE verification.",
  },
  {
    type: "intake_utilization",
    title: "Intake Utilization & Supernumerary Quota Audit",
    category: "Intake & Enrolment",
    description:
      "Programme-wise sanctioned capacity, supernumerary allowances (EWS, TFW, PMSSS), reported admissions, and compliance thresholds.",
    expectedColumns: [
      "Institution Code",
      "Institution Name",
      "State",
      "Programme Name",
      "Degree Level",
      "Academic Year",
      "Base Approved Intake",
      "EWS Quota (10%)",
      "TFW Quota (5%)",
      "Other Supernumerary",
      "Total Permissible Capacity",
      "Reported Enrolment",
      "Utilization Rate (%)",
      "Compliance Status",
      "Compliance Justification",
      "Approval Order Ref",
    ],
    filenamePrefix: "creden-intake-capacity-audit",
    complianceNotice:
      "DEMONSTRATION DATA ONLY. Capacity limits derived from AICTE Approval Process Handbook (APH) guidelines.",
  },
  {
    type: "validation_findings",
    title: "National Academic Validation Findings Ledger",
    category: "Validation & Compliance",
    description:
      "Explainable anomalies detected by the deterministic validation engine across APAAR syntax, duplicate records, and capacity limits.",
    expectedColumns: [
      "Finding ID",
      "Rule ID",
      "Rule Name",
      "Validation Category",
      "Severity",
      "Review Status",
      "Institution Code",
      "Institution Name",
      "Academic Year",
      "Affected Record References",
      "Heuristic Explanation",
      "Suggested Governance Action",
      "Logged Timestamp",
      "Last Updated",
    ],
    filenamePrefix: "creden-validation-findings",
    complianceNotice:
      "DEMONSTRATION DATA ONLY. Anomaly indicators reflect heuristic rules evaluation.",
  },
  {
    type: "duplicate_conflicts",
    title: "Cross-Institutional Duplicate Enrolment Ledger",
    category: "Validation & Compliance",
    description:
      "Identified concurrent active enrolments and roll number collisions across universities requiring migration certificate reconciliation.",
    expectedColumns: [
      "Finding ID",
      "Rule Ref",
      "Student / Candidate Reference",
      "Primary Institution",
      "Conflicting Institution",
      "Matched Field",
      "Primary Value",
      "Conflicting Value",
      "Investigation Status",
      "Detection Timestamp",
    ],
    filenamePrefix: "creden-duplicate-conflicts",
    complianceNotice:
      "DEMONSTRATION DATA ONLY. Duplicates require inter-institutional verification before administrative action.",
  },
  {
    type: "submission_history",
    title: "Institutional Batch Ingestion & Timeliness Ledger",
    category: "Audit & Governance",
    description:
      "Batch submission audit trail, APAAR parsing success rate, discrepancy counts, and submission timeliness status.",
    expectedColumns: [
      "Submission ID",
      "Batch Reference",
      "Institution Code",
      "Institution Name",
      "Academic Year",
      "Records Submitted",
      "APAAR Pass Count",
      "Discrepancies Count",
      "Ingestion Status",
      "Submitted Timestamp",
    ],
    filenamePrefix: "creden-submission-history",
    complianceNotice:
      "DEMONSTRATION DATA ONLY. Ingestion logs reflect sandbox batch transmissions.",
  },
  {
    type: "audit_events",
    title: "AICTE Regulatory Action & Audit Trail Ledger",
    category: "Audit & Governance",
    description:
      "Immutable log of compliance officer determinations, status modifications, explanation requests, and justified false-positive dismissals.",
    expectedColumns: [
      "Audit Event ID",
      "Dossier / Finding ID",
      "Compliance Officer / Actor",
      "Action Executed",
      "Previous Review Status",
      "New Review Status",
      "Mandatory Justification Reason",
      "Timestamp",
    ],
    filenamePrefix: "creden-regulatory-audit-events",
    complianceNotice:
      "DEMONSTRATION DATA ONLY. Audit records are cryptographically indexed under sandbox governance protocols.",
  },
];

// Session history store of generated reports
let sessionGeneratedReports: GeneratedReportRecord[] = [];

/**
 * Escapes CSV field according to RFC-4180 standard.
 */
export const escapeCsvField = (field: string | number | undefined | null): string => {
  if (field === undefined || field === null) return '""';
  const str = String(field);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

/**
 * Builds formatted CSV string with metadata headers and disclaimer comments.
 */
export const buildCsvString = (
  headers: string[],
  rows: (string | number)[][],
  metadata: {
    title: string;
    generatedAt: string;
    generatedBy: string;
    filters: string;
    complianceNotice: string;
  }
): string => {
  const metadataComments = [
    `# ==============================================================================`,
    `# CREDEN - AICTE NATIONAL ACADEMIC GOVERNANCE PLATFORM`,
    `# REPORT: ${metadata.title.toUpperCase()}`,
    `# GENERATED AT (ISO): ${metadata.generatedAt}`,
    `# GENERATED BY: ${metadata.generatedBy}`,
    `# APPLIED CRITERIA: ${metadata.filters}`,
    `# ENVIRONMENT: DEMONSTRATION SANDBOX (NON-PRODUCTION)`,
    `# NOTICE: ${metadata.complianceNotice}`,
    `# ==============================================================================`,
  ].join("\n");

  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map((r) => r.map(escapeCsvField).join(","));

  return `${metadataComments}\n${headerLine}\n${dataLines.join("\n")}`;
};

/**
 * Generates and triggers browser file download for requested report type.
 */
export const generateAndDownloadReport = async (
  options: ReportFilterOptions,
  actor: string = "AICTE Compliance Officer (Demo)"
): Promise<GeneratedReportRecord> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const def = REPORT_DEFINITIONS.find((d) => d.type === options.reportType);
  if (!def) {
    throw new Error(`Unrecognized report definition: ${options.reportType}`);
  }

  const generatedAt = new Date().toISOString();
  const filterDesc = `Academic Year=${options.academicYear || "All"}, State=${options.state || "All"}, Institution=${options.institutionCode || "All"}`;

  let headers: string[] = def.expectedColumns;
  let rows: (string | number)[][] = [];

  // Generate data rows based on report type
  switch (options.reportType) {
    case "institutional_enrolment": {
      let insts = [...MOCK_INSTITUTIONS];
      if (options.state && options.state !== "All") {
        insts = insts.filter((i) => i.state === options.state);
      }
      if (options.institutionCode && options.institutionCode !== "All") {
        insts = insts.filter((i) => i.code === options.institutionCode);
      }

      rows = insts.map((i) => [
        i.code,
        i.name,
        i.state,
        i.district,
        i.institutionType,
        i.accreditation,
        i.totalApprovedProgrammes,
        i.approvedIntakeTotal,
        i.reportedEnrolmentTotal,
        i.approvedIntakeTotal > 0
          ? Number(((i.reportedEnrolmentTotal / i.approvedIntakeTotal) * 100).toFixed(1))
          : 0,
        i.status,
        i.lastSubmissionDate,
      ]);
      break;
    }

    case "intake_utilization": {
      let prgRows = buildAllProgrammeIntakeRows();
      if (options.academicYear && options.academicYear !== "All") {
        prgRows = prgRows.filter((r) => r.academicYear === options.academicYear);
      }
      if (options.state && options.state !== "All") {
        prgRows = prgRows.filter((r) => r.state === options.state);
      }
      if (options.institutionCode && options.institutionCode !== "All") {
        prgRows = prgRows.filter((r) => r.institutionCode === options.institutionCode);
      }

      rows = prgRows.map((r) => [
        r.institutionCode,
        r.institutionName,
        r.state,
        r.programmeName,
        r.degreeLevel,
        r.academicYear,
        r.baseApprovedIntake,
        r.supernumerary.ews10Percent,
        r.supernumerary.tfw5Percent,
        r.supernumerary.pmsss,
        r.totalPermissibleCapacity,
        r.reportedEnrolment,
        r.effectiveUtilizationRate,
        r.complianceStatus,
        r.statusReason,
        r.approvalLetterRef,
      ]);
      break;
    }

    case "validation_findings": {
      let findings = [...INITIAL_VALIDATION_FINDINGS];
      if (options.academicYear && options.academicYear !== "All") {
        findings = findings.filter((f) => f.academicYear === options.academicYear);
      }
      if (options.state && options.state !== "All") {
        findings = findings.filter((f) => f.state === options.state);
      }
      if (options.institutionCode && options.institutionCode !== "All") {
        findings = findings.filter((f) => f.institutionCode === options.institutionCode);
      }

      rows = findings.map((f) => [
        f.id,
        f.ruleId,
        f.ruleName,
        f.category,
        f.severity,
        f.reviewStatus,
        f.institutionCode,
        f.institutionName,
        f.academicYear,
        f.affectedRecordReferences.join("; "),
        f.explanation,
        f.suggestedAction,
        f.createdAt,
        f.updatedAt,
      ]);
      break;
    }

    case "duplicate_conflicts": {
      let dups = INITIAL_VALIDATION_FINDINGS.filter(
        (f) => f.category === "Duplicate Detection"
      );
      if (options.academicYear && options.academicYear !== "All") {
        dups = dups.filter((f) => f.academicYear === options.academicYear);
      }
      if (options.institutionCode && options.institutionCode !== "All") {
        dups = dups.filter((f) => f.institutionCode === options.institutionCode);
      }

      rows = dups.map((f) => {
        const ev = f.evidence[0];
        return [
          f.id,
          f.ruleId,
          f.affectedRecordReferences.join(" / "),
          f.institutionName,
          ev?.conflictingValue ? "Cross-Campus" : "Intra-Campus",
          ev?.matchedField || "APAAR / Student ID",
          ev?.sourceValue || "N/A",
          ev?.conflictingValue || "N/A",
          f.reviewStatus,
          f.createdAt,
        ];
      });
      break;
    }

    case "submission_history": {
      const submissions = MOCK_INSTITUTIONS.flatMap((inst) =>
        inst.submissions.map((sub) => ({
          ...sub,
          institutionCode: inst.code,
          institutionName: inst.name,
          state: inst.state,
        }))
      );

      let filteredSubs = submissions;
      if (options.academicYear && options.academicYear !== "All") {
        filteredSubs = filteredSubs.filter((s) => s.academicYear === options.academicYear);
      }
      if (options.state && options.state !== "All") {
        filteredSubs = filteredSubs.filter((s) => s.state === options.state);
      }
      if (options.institutionCode && options.institutionCode !== "All") {
        filteredSubs = filteredSubs.filter((s) => s.institutionCode === options.institutionCode);
      }

      rows = filteredSubs.map((s) => [
        s.id,
        s.batchReference,
        s.institutionCode,
        s.institutionName,
        s.academicYear,
        s.recordsSubmitted,
        s.apaarPassCount,
        s.discrepanciesCount,
        s.status,
        s.submittedAt,
      ]);
      break;
    }

    case "audit_events": {
      const allAuditEvents = INITIAL_VALIDATION_FINDINGS.flatMap((f) =>
        f.auditTrail.map((aud) => ({
          ...aud,
          findingId: f.id,
        }))
      );

      rows = allAuditEvents.map((a) => [
        a.id,
        a.findingId,
        a.actor,
        a.action,
        a.previousStatus,
        a.newStatus,
        a.reason,
        a.timestamp,
      ]);
      break;
    }
  }

  // Build CSV content
  const csvContent = buildCsvString(headers, rows, {
    title: def.title,
    generatedAt,
    generatedBy: actor,
    filters: filterDesc,
    complianceNotice: def.complianceNotice,
  });

  const filename = `${def.filenamePrefix}-${generatedAt.split("T")[0]}.csv`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Trigger browser download safely if DOM is available
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const record: GeneratedReportRecord = {
    id: `REP-${Date.now()}`,
    reportType: options.reportType,
    title: def.title,
    filename,
    rowCount: rows.length,
    fileSizeBytes: blob.size,
    generatedAt,
    generatedBy: actor,
    appliedFilters: {
      academicYear: options.academicYear,
      state: options.state,
      institutionCode: options.institutionCode,
    },
  };

  sessionGeneratedReports = [record, ...sessionGeneratedReports];
  return record;
};

/**
 * Retrieves the session history of generated reports.
 */
export const getSessionReportHistory = (): GeneratedReportRecord[] => {
  return sessionGeneratedReports;
};
