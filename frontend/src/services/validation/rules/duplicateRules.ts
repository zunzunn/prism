import { StudentRecordDetail } from "@/types/students";
import { ValidationFinding } from "@/types/validation";
import { normalizeApaar } from "./apaarRules";

/**
 * Category 2: Duplicate Enrolment Detection Rules
 */
export const evaluateDuplicateRules = (
  student: StudentRecordDetail,
  allStudents: StudentRecordDetail[]
): ValidationFinding[] => {
  const findings: ValidationFinding[] = [];
  const now = new Date().toISOString();
  const normalizedApaar = normalizeApaar(student.apaarId);

  // RULE-DUP-004: Repeated institution-specific student identifiers (Roll No) within the same institution
  const duplicateRollNos = allStudents.filter(
    (s) =>
      s.id !== student.id &&
      s.institutionCode === student.institutionCode &&
      s.institutionStudentId.trim().toLowerCase() ===
        student.institutionStudentId.trim().toLowerCase()
  );

  if (duplicateRollNos.length > 0) {
    const dup = duplicateRollNos[0];
    if (dup) {
      findings.push({
        id: `FND-DUP-004-${student.id}-${dup.id}`,
        ruleId: "RULE-DUP-004",
        ruleName: "Intra-Institutional Roll Number Collision",
        category: "Duplicate Detection",
        severity: "Warning",
        affectedRecordReferences: [student.id, dup.id],
        studentName: `${student.fullName} / ${dup.fullName}`,
        institutionCode: student.institutionCode,
        institutionName: student.institutionName,
        academicYear: student.academicYear,
        explanation: `Roll Number '${student.institutionStudentId}' is assigned to two different enrollment records at ${student.institutionName} (${student.fullName} and ${dup.fullName}). Note: This may indicate an administrative indexing error rather than fraudulent intent.`,
        evidence: [
          {
            matchedField: "institutionStudentId",
            sourceValue: student.institutionStudentId,
            conflictingValue: dup.institutionStudentId,
            ruleContext: "Uniqueness constraint for roll numbers per academic department",
          },
        ],
        suggestedAction:
          "Notify institution registrar to reconcile student internal registration index and verify identity proof.",
        reviewStatus: "Open",
        createdAt: now,
        updatedAt: now,
        auditTrail: [
          {
            id: `AUD-INIT-${Date.now()}-dup4`,
            findingId: `FND-DUP-004-${student.id}-${dup.id}`,
            actor: "Automated Rule Engine",
            action: "Finding Detected",
            previousStatus: "Open",
            newStatus: "Open",
            reason: "Internal student roll number collision detected within institution.",
            timestamp: now,
          },
        ],
      });
    }
  }

  // RULE-DUP-003: Cross-Institution Enrolment Conflicts (Concurrent Active Enrolment)
  if (normalizedApaar.length === 12) {
    const crossInstConflicts = allStudents.filter(
      (s) =>
        s.id !== student.id &&
        s.institutionCode !== student.institutionCode &&
        normalizeApaar(s.apaarId) === normalizedApaar &&
        s.enrolmentStatus === "Active Enrolment" &&
        student.enrolmentStatus === "Active Enrolment"
    );

    if (crossInstConflicts.length > 0) {
      const conflict = crossInstConflicts[0];
      if (conflict) {
        findings.push({
          id: `FND-DUP-003-${student.id}-${conflict.id}`,
          ruleId: "RULE-DUP-003",
          ruleName: "Potential Cross-Institutional Enrolment Conflict",
          category: "Duplicate Detection",
          severity: "Critical",
          affectedRecordReferences: [student.id, conflict.id],
          studentName: student.fullName,
          institutionCode: student.institutionCode,
          institutionName: `${student.institutionName} vs ${conflict.institutionName}`,
          academicYear: student.academicYear,
          explanation: `Simultaneous active regular enrollment detected across ${student.institutionName} and ${conflict.institutionName} under APAAR ${student.apaarId}. Per AICTE policy, concurrent full-time degree programs are subject to migration clearance review.`,
          evidence: [
            {
              matchedField: "apaarId",
              sourceValue: `${student.institutionName} (${student.programme})`,
              conflictingValue: `${conflict.institutionName} (${conflict.programme})`,
              normalizedToken: normalizedApaar,
              ruleContext: "Cross-institutional concurrent active enrollment check",
            },
          ],
          suggestedAction:
            "Request official seat cancellation / migration certificates from both universities before finalizing national state allocation.",
          reviewStatus: "Open",
          createdAt: now,
          updatedAt: now,
          auditTrail: [
            {
              id: `AUD-INIT-${Date.now()}-dup3`,
              findingId: `FND-DUP-003-${student.id}-${conflict.id}`,
              actor: "Automated Rule Engine",
              action: "Finding Detected",
              previousStatus: "Open",
              newStatus: "Open",
              reason: "Active concurrent enrolment overlap detected across different institutions.",
              timestamp: now,
            },
          ],
        });
      }
    }
  }

  return findings;
};
