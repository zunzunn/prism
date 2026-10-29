import { InstitutionDetailRecord } from "@/types/institutions";
import { ValidationFinding, IntakePolicyRule } from "@/types/validation";

/**
 * Category 3: Deterministic Intake Validation Rules
 */
export const evaluateIntakeRules = (
  institution: InstitutionDetailRecord,
  configuredPolicies: IntakePolicyRule[]
): ValidationFinding[] => {
  const findings: ValidationFinding[] = [];
  const now = new Date().toISOString();

  institution.programmes.forEach((prg) => {
    // Lookup configurable policy rule
    const policy = configuredPolicies.find(
      (p) =>
        p.institutionCode === institution.code &&
        p.programmeName.toLowerCase().trim() === prg.programmeName.toLowerCase().trim()
    );

    // RULE-INTAKE-002: If policy rule or approved capacity configuration is missing, return "Needs Review"
    if (!policy) {
      findings.push({
        id: `FND-INTK-002-${institution.code}-${prg.id}`,
        ruleId: "RULE-INTAKE-002",
        ruleName: "Missing Regulatory Intake Policy Mapping",
        category: "Intake Validation",
        severity: "Warning",
        affectedRecordReferences: [institution.code, prg.id],
        institutionCode: institution.code,
        institutionName: institution.name,
        academicYear: "2026-27",
        explanation: `Explicit AICTE intake approval policy or supernumerary allocation data is unconfigured for programme '${prg.programmeName}'. Cannot ascertain sanctioned limits without regulatory parameters.`,
        evidence: [
          {
            matchedField: "programmeName",
            sourceValue: prg.programmeName,
            ruleContext: "Intake policy mapping lookup in central regulatory configuration database",
          },
        ],
        suggestedAction:
          "AICTE regional office must configure or upload the official approval letter (EOA) quota matrix for this branch.",
        reviewStatus: "Under Review",
        createdAt: now,
        updatedAt: now,
        auditTrail: [
          {
            id: `AUD-INIT-${Date.now()}-intk2`,
            findingId: `FND-INTK-002-${institution.code}-${prg.id}`,
            actor: "Automated Rule Engine",
            action: "Finding Detected",
            previousStatus: "Under Review",
            newStatus: "Under Review",
            reason: "Policy configuration missing; flagged as 'Under Review' per standard procedure.",
            timestamp: now,
          },
        ],
      });
      return;
    }

    // RULE-INTAKE-001: Compare reported enrolment with approved intake including supernumerary quotas
    const totalAllowedCapacity =
      policy.baseApprovedIntake +
      policy.permittedEwsQuota +
      policy.permittedTfwQuota +
      policy.permittedSupernumeraryOther;

    const reportedTotal = prg.reportedEnrolment;

    if (reportedTotal > totalAllowedCapacity) {
      const excess = reportedTotal - totalAllowedCapacity;
      findings.push({
        id: `FND-INTK-001-${institution.code}-${prg.id}`,
        ruleId: "RULE-INTAKE-001",
        ruleName: "Approved Intake Capacity Breach",
        category: "Intake Validation",
        severity: "Critical",
        affectedRecordReferences: [institution.code, prg.id],
        institutionCode: institution.code,
        institutionName: institution.name,
        academicYear: policy.academicYear,
        explanation: `Reported enrollment of ${reportedTotal} students in '${prg.programmeName}' exceeds total permissible capacity of ${totalAllowedCapacity} (Base sanctioned: ${policy.baseApprovedIntake}, EWS: ${policy.permittedEwsQuota}, TFW: ${policy.permittedTfwQuota}, other: ${policy.permittedSupernumeraryOther}) by ${excess} students.`,
        evidence: [
          {
            matchedField: "reportedEnrolment",
            sourceValue: `${reportedTotal} enrolled`,
            conflictingValue: `${totalAllowedCapacity} max capacity (exceeded by ${excess})`,
            ruleContext: "AICTE Approval Process Handbook (APH) sanctioned intake threshold audit",
          },
        ],
        suggestedAction:
          "Issue formal clarification inquiry to institution regarding supernumerary seat justification or over-admission regularization.",
        reviewStatus: "Open",
        createdAt: now,
        updatedAt: now,
        auditTrail: [
          {
            id: `AUD-INIT-${Date.now()}-intk1`,
            findingId: `FND-INTK-001-${institution.code}-${prg.id}`,
            actor: "Automated Rule Engine",
            action: "Finding Detected",
            previousStatus: "Open",
            newStatus: "Open",
            reason: "Reported admissions exceeded composite base and supernumerary caps.",
            timestamp: now,
          },
        ],
      });
    }
  });

  return findings;
};
