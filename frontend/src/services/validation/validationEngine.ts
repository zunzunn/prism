import { StudentRecordDetail } from "@/types/students";
import { InstitutionDetailRecord } from "@/types/institutions";
import {
  ValidationFinding,
  ValidationMetrics,
  IntakePolicyRule,
} from "@/types/validation";
import { evaluateApaarRules } from "./rules/apaarRules";
import { evaluateDuplicateRules } from "./rules/duplicateRules";
import { evaluateIntakeRules } from "./rules/intakeRules";
import { evaluateDataConsistencyRules } from "./rules/dataConsistencyRules";

export interface ValidationEngineExecutionResult {
  findings: ValidationFinding[];
  metrics: ValidationMetrics;
  evaluatedAt: string;
}

/**
 * Deterministic Validation Engine that coordinates rules evaluation
 * across student records and institutional quotas.
 */
export const runDeterministicValidationEngine = (
  students: StudentRecordDetail[],
  institutions: InstitutionDetailRecord[],
  policies: IntakePolicyRule[]
): ValidationEngineExecutionResult => {
  const allFindings: ValidationFinding[] = [];

  // 1. Evaluate Student-Level Rules (APAAR, Duplicates, Consistency)
  students.forEach((student) => {
    // Category 1: APAAR Identifier Checks
    const apaarFindings = evaluateApaarRules(student, students);
    allFindings.push(...apaarFindings);

    // Category 2: Duplicate Detection
    const duplicateFindings = evaluateDuplicateRules(student, students);
    allFindings.push(...duplicateFindings);

    // Category 4: Data Consistency
    const consistencyFindings = evaluateDataConsistencyRules(student);
    allFindings.push(...consistencyFindings);
  });

  // 2. Evaluate Institution-Level Rules (Category 3: Intake Validation)
  institutions.forEach((institution) => {
    const intakeFindings = evaluateIntakeRules(institution, policies);
    allFindings.push(...intakeFindings);
  });

  // Deduplicate findings by id
  const uniqueFindingsMap = new Map<string, ValidationFinding>();
  allFindings.forEach((f) => {
    if (!uniqueFindingsMap.has(f.id)) {
      uniqueFindingsMap.set(f.id, f);
    }
  });
  const uniqueFindings = Array.from(uniqueFindingsMap.values());

  // 3. Compute Metrics
  const totalEvaluated = students.length;
  const criticalFindings = uniqueFindings.filter((f) => f.severity === "Critical");
  const duplicateFindings = uniqueFindings.filter((f) => f.category === "Duplicate Detection");
  const intakeFindings = uniqueFindings.filter((f) => f.category === "Intake Validation");
  const reviewFindings = uniqueFindings.filter((f) => f.reviewStatus === "Open" || f.reviewStatus === "Under Review");

  const invalidCount = criticalFindings.length;
  const validCount = Math.max(0, totalEvaluated - invalidCount);

  const metrics: ValidationMetrics = {
    totalRecordsEvaluated: totalEvaluated,
    validRecords: validCount,
    invalidRecords: invalidCount,
    recordsRequiringReview: reviewFindings.length,
    potentialDuplicateEnrolments: duplicateFindings.length,
    intakeComplianceAlerts: intakeFindings.length,
  };

  return {
    findings: uniqueFindings,
    metrics,
    evaluatedAt: new Date().toISOString(),
  };
};
