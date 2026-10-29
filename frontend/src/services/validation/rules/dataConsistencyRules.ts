import { StudentRecordDetail } from "@/types/students";
import { ValidationFinding } from "@/types/validation";
import { MOCK_INSTITUTIONS } from "@/data/institutionsData";

const VALID_ADMISSION_CATEGORIES = [
  "General / Open",
  "OBC-NCL",
  "SC",
  "ST",
  "EWS",
];

const VALID_ENROLMENT_STATUSES = [
  "Active Enrolment",
  "Graduated",
  "On Leave",
  "Transferred",
  "Withdrawn",
];

/**
 * Category 4: Deterministic Data Consistency Rules
 */
export const evaluateDataConsistencyRules = (
  student: StudentRecordDetail
): ValidationFinding[] => {
  const findings: ValidationFinding[] = [];
  const now = new Date().toISOString();

  // RULE-DATA-001: Missing required fields
  const missingFields: string[] = [];
  if (!student.fullName?.trim()) missingFields.push("fullName");
  if (!student.programme?.trim()) missingFields.push("programme");
  if (!student.institutionStudentId?.trim()) missingFields.push("institutionStudentId");
  if (!student.academicYear?.trim()) missingFields.push("academicYear");
  if (!student.admissionDate?.trim()) missingFields.push("admissionDate");

  if (missingFields.length > 0) {
    findings.push({
      id: `FND-DATA-001-${student.id}`,
      ruleId: "RULE-DATA-001",
      ruleName: "Missing Mandatory Lifecycle Fields",
      category: "Data Consistency",
      severity: "Critical",
      affectedRecordReferences: [student.id],
      studentName: student.fullName || "<Unnamed>",
      institutionCode: student.institutionCode,
      institutionName: student.institutionName,
      academicYear: student.academicYear,
      explanation: `Student record is missing mandatory schema attributes: ${missingFields.join(", ")}.`,
      evidence: [
        {
          matchedField: missingFields.join(", "),
          sourceValue: "<NULL / EMPTY>",
          ruleContext: "Mandatory student schema integrity enforcement",
        },
      ],
      suggestedAction: "Complete all missing biographical and enrollment fields before submitting for state clearance.",
      reviewStatus: "Open",
      createdAt: now,
      updatedAt: now,
      auditTrail: [
        {
          id: `AUD-INIT-${Date.now()}-data1`,
          findingId: `FND-DATA-001-${student.id}`,
          actor: "Automated Rule Engine",
          action: "Finding Detected",
          previousStatus: "Open",
          newStatus: "Open",
          reason: `Missing mandatory schema attributes: ${missingFields.join(", ")}`,
          timestamp: now,
        },
      ],
    });
  }

  // RULE-DATA-002: Invalid date formats (Expected: YYYY-MM-DD or standard parseable ISO)
  if (student.admissionDate) {
    const isIsoFormat = /^\d{4}-\d{2}-\d{2}/.test(student.admissionDate);
    const parsedDate = Date.parse(student.admissionDate);
    if (!isIsoFormat || isNaN(parsedDate)) {
      findings.push({
        id: `FND-DATA-002-${student.id}`,
        ruleId: "RULE-DATA-002",
        ruleName: "Malformed Admission Date Format",
        category: "Data Consistency",
        severity: "Warning",
        affectedRecordReferences: [student.id],
        studentName: student.fullName,
        institutionCode: student.institutionCode,
        institutionName: student.institutionName,
        academicYear: student.academicYear,
        explanation: `Admission date '${student.admissionDate}' does not comply with the ISO-8601 YYYY-MM-DD standard format.`,
        evidence: [
          {
            matchedField: "admissionDate",
            sourceValue: student.admissionDate,
            ruleContext: "Expected ISO-8601 (YYYY-MM-DD)",
          },
        ],
        suggestedAction: "Re-format admission date string to standard YYYY-MM-DD timestamp.",
        reviewStatus: "Open",
        createdAt: now,
        updatedAt: now,
        auditTrail: [
          {
            id: `AUD-INIT-${Date.now()}-data2`,
            findingId: `FND-DATA-002-${student.id}`,
            actor: "Automated Rule Engine",
            action: "Finding Detected",
            previousStatus: "Open",
            newStatus: "Open",
            reason: "ISO-8601 date parse validation failed.",
            timestamp: now,
          },
        ],
      });
    }
  }

  // RULE-DATA-004: Invalid admission-category values
  if (student.admissionCategory && !VALID_ADMISSION_CATEGORIES.includes(student.admissionCategory)) {
    findings.push({
      id: `FND-DATA-004-${student.id}`,
      ruleId: "RULE-DATA-004",
      ruleName: "Unrecognized Admission Quota Category",
      category: "Data Consistency",
      severity: "Warning",
      affectedRecordReferences: [student.id],
      studentName: student.fullName,
      institutionCode: student.institutionCode,
      institutionName: student.institutionName,
      academicYear: student.academicYear,
      explanation: `Category '${student.admissionCategory}' is not recognized in AICTE centralized admission taxonomy.`,
      evidence: [
        {
          matchedField: "admissionCategory",
          sourceValue: student.admissionCategory,
          ruleContext: `Allowed categories: ${VALID_ADMISSION_CATEGORIES.join(", ")}`,
        },
      ],
      suggestedAction: "Remap institutional category code to standardized AICTE reservation taxonomy.",
      reviewStatus: "Open",
      createdAt: now,
      updatedAt: now,
      auditTrail: [
        {
          id: `AUD-INIT-${Date.now()}-data4`,
          findingId: `FND-DATA-004-${student.id}`,
          actor: "Automated Rule Engine",
          action: "Finding Detected",
          previousStatus: "Open",
          newStatus: "Open",
          reason: "Taxonomy vocabulary check failed.",
          timestamp: now,
        },
      ],
    });
  }

  // RULE-DATA-005: Unsupported enrolment statuses
  if (student.enrolmentStatus && !VALID_ENROLMENT_STATUSES.includes(student.enrolmentStatus)) {
    findings.push({
      id: `FND-DATA-005-${student.id}`,
      ruleId: "RULE-DATA-005",
      ruleName: "Invalid Enrolment Lifecycle Status",
      category: "Data Consistency",
      severity: "Warning",
      affectedRecordReferences: [student.id],
      studentName: student.fullName,
      institutionCode: student.institutionCode,
      institutionName: student.institutionName,
      academicYear: student.academicYear,
      explanation: `Status '${student.enrolmentStatus}' is not a permitted student lifecycle state.`,
      evidence: [
        {
          matchedField: "enrolmentStatus",
          sourceValue: student.enrolmentStatus,
          ruleContext: `Permitted states: ${VALID_ENROLMENT_STATUSES.join(", ")}`,
        },
      ],
      suggestedAction: "Select valid lifecycle status (Active Enrolment, Graduated, On Leave, Transferred, Withdrawn).",
      reviewStatus: "Open",
      createdAt: now,
      updatedAt: now,
      auditTrail: [
        {
          id: `AUD-INIT-${Date.now()}-data5`,
          findingId: `FND-DATA-005-${student.id}`,
          actor: "Automated Rule Engine",
          action: "Finding Detected",
          previousStatus: "Open",
          newStatus: "Open",
          reason: "Enrolment lifecycle state verification failed.",
          timestamp: now,
        },
      ],
    });
  }

  // RULE-DATA-006: Invalid relationships between records and institutions
  const institutionExists = MOCK_INSTITUTIONS.some(
    (inst) => inst.code === student.institutionCode
  );

  if (!institutionExists) {
    findings.push({
      id: `FND-DATA-006-${student.id}`,
      ruleId: "RULE-DATA-006",
      ruleName: "Orphaned Student Record / Unrecognized Institution Code",
      category: "Data Consistency",
      severity: "Critical",
      affectedRecordReferences: [student.id, student.institutionCode],
      studentName: student.fullName,
      institutionCode: student.institutionCode,
      institutionName: student.institutionName,
      academicYear: student.academicYear,
      explanation: `Institution code '${student.institutionCode}' does not resolve to any approved AICTE technical institute in the national database.`,
      evidence: [
        {
          matchedField: "institutionCode",
          sourceValue: student.institutionCode,
          ruleContext: "Foreign key / relational reference validation against national institute registry",
        },
      ],
      suggestedAction: "Reconcile institutional affiliation or register campus under AICTE portal.",
      reviewStatus: "Open",
      createdAt: now,
      updatedAt: now,
      auditTrail: [
        {
          id: `AUD-INIT-${Date.now()}-data6`,
          findingId: `FND-DATA-006-${student.id}`,
          actor: "Automated Rule Engine",
          action: "Finding Detected",
          previousStatus: "Open",
          newStatus: "Open",
          reason: "Institution code foreign key resolution failed.",
          timestamp: now,
        },
      ],
    });
  }

  return findings;
};
