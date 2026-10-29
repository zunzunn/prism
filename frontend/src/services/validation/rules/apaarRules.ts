import { StudentRecordDetail } from "@/types/students";
import { ValidationFinding } from "@/types/validation";

/**
 * Normalizes an APAAR ID by stripping whitespace and dashes.
 */
export const normalizeApaar = (raw: string): string => {
  return (raw || "").replace(/[-\s]/g, "").trim();
};

/**
 * Category 1: Deterministic APAAR Identifier Checks
 */
export const evaluateApaarRules = (
  student: StudentRecordDetail,
  allStudents: StudentRecordDetail[]
): ValidationFinding[] => {
  const findings: ValidationFinding[] = [];
  const now = new Date().toISOString();
  const rawApaar = student.apaarId || "";
  const normalized = normalizeApaar(rawApaar);

  // RULE-APAAR-001: Missing required identifier
  if (!rawApaar.trim()) {
    findings.push({
      id: `FND-APAAR-001-${student.id}`,
      ruleId: "RULE-APAAR-001",
      ruleName: "Missing Mandatory APAAR Identifier",
      category: "APAAR Identifier",
      severity: "Critical",
      affectedRecordReferences: [student.id, student.institutionStudentId],
      studentName: student.fullName,
      institutionCode: student.institutionCode,
      institutionName: student.institutionName,
      academicYear: student.academicYear,
      explanation:
        "Student enrollment record was submitted without the mandatory 12-digit APAAR/ABC identifier required by AICTE regulations.",
      evidence: [
        {
          matchedField: "apaarId",
          sourceValue: "<EMPTY>",
          ruleContext: "National NEP-2020 student registry mandatory field check",
        },
      ],
      suggestedAction:
        "Request nodal officer to obtain and link student's 12-digit APAAR ID via DigiLocker student portal.",
      reviewStatus: "Open",
      createdAt: now,
      updatedAt: now,
      auditTrail: [
        {
          id: `AUD-INIT-${Date.now()}-1`,
          findingId: `FND-APAAR-001-${student.id}`,
          actor: "Automated Rule Engine",
          action: "Finding Detected",
          previousStatus: "Open",
          newStatus: "Open",
          reason: "Deterministic schema evaluation detected empty identifier.",
          timestamp: now,
        },
      ],
    });
    return findings; // Stop further APAAR evaluation if empty
  }

  // RULE-APAAR-002: Identifier format does not match configured specification (12 digits)
  if (normalized.length !== 12 || !/^\d+$/.test(normalized)) {
    findings.push({
      id: `FND-APAAR-002-${student.id}`,
      ruleId: "RULE-APAAR-002",
      ruleName: "APAAR Format Specification Violation",
      category: "APAAR Identifier",
      severity: "Critical",
      affectedRecordReferences: [student.id, student.institutionStudentId],
      studentName: student.fullName,
      institutionCode: student.institutionCode,
      institutionName: student.institutionName,
      academicYear: student.academicYear,
      explanation: `APAAR ID '${rawApaar}' does not conform to the national 12-digit numeric specification. Received ${normalized.length} characters with invalid characters.`,
      evidence: [
        {
          matchedField: "apaarId",
          sourceValue: rawApaar,
          normalizedToken: normalized,
          ruleContext: "Expected regex: ^\\d{12}$, got length: " + normalized.length,
        },
      ],
      suggestedAction:
        "Reject record from state ledger; request institution nodal officer re-submission with verified 12-digit number.",
      reviewStatus: "Open",
      createdAt: now,
      updatedAt: now,
      auditTrail: [
        {
          id: `AUD-INIT-${Date.now()}-2`,
          findingId: `FND-APAAR-002-${student.id}`,
          actor: "Automated Rule Engine",
          action: "Finding Detected",
          previousStatus: "Open",
          newStatus: "Open",
          reason: "Regex pattern match failed against national 12-digit standard.",
          timestamp: now,
        },
      ],
    });
  }

  // RULE-APAAR-003: Identifier conflicts with another record in the dataset
  const matchingStudents = allStudents.filter(
    (s) => s.id !== student.id && normalizeApaar(s.apaarId) === normalized
  );

  if (matchingStudents.length > 0 && normalized.length === 12) {
    const conflicting = matchingStudents[0];
    if (conflicting) {
      findings.push({
        id: `FND-APAAR-003-${student.id}-${conflicting.id}`,
        ruleId: "RULE-APAAR-003",
        ruleName: "Duplicate APAAR Identifier Collision",
        category: "APAAR Identifier",
        severity: "Critical",
        affectedRecordReferences: [student.id, conflicting.id],
        studentName: `${student.fullName} / ${conflicting.fullName}`,
        institutionCode: student.institutionCode,
        institutionName: student.institutionName,
        academicYear: student.academicYear,
        explanation: `Identical 12-digit APAAR ID '${rawApaar}' is simultaneously registered to record ${student.id} (${student.fullName}) and record ${conflicting.id} (${conflicting.fullName}).`,
        evidence: [
          {
            matchedField: "apaarId",
            sourceValue: `${student.institutionName} [${student.institutionStudentId}]`,
            conflictingValue: `${conflicting.institutionName} [${conflicting.institutionStudentId}]`,
            normalizedToken: normalized,
            ruleContext: "Deterministic exact-token uniqueness constraint across active registries",
          },
        ],
        suggestedAction:
          "Open Duplicate Detail Investigation; issue clarification notice to both campus nodal officers.",
        reviewStatus: "Open",
        createdAt: now,
        updatedAt: now,
        auditTrail: [
          {
            id: `AUD-INIT-${Date.now()}-3`,
            findingId: `FND-APAAR-003-${student.id}-${conflicting.id}`,
            actor: "Automated Rule Engine",
            action: "Finding Detected",
            previousStatus: "Open",
            newStatus: "Open",
            reason: "Exact token collision detected across enrollment nodes.",
            timestamp: now,
          },
        ],
      });
    }
  }

  return findings;
};
