import { IntakePolicyRule, ValidationFinding } from "@/types/validation";
import { MOCK_STUDENTS } from "./studentsData";
import { MOCK_INSTITUTIONS } from "./institutionsData";
import { runDeterministicValidationEngine } from "@/services/validation/validationEngine";

export const MOCK_INTAKE_POLICIES: IntakePolicyRule[] = [
  {
    institutionCode: "1-332901124",
    programmeName: "Computer Science & Engineering",
    academicYear: "2026-27",
    baseApprovedIntake: 240,
    permittedEwsQuota: 24,
    permittedTfwQuota: 12,
    permittedSupernumeraryOther: 5,
    isPolicyRuleActive: true,
  },
  {
    institutionCode: "1-332901124",
    programmeName: "Mechanical Engineering",
    academicYear: "2026-27",
    baseApprovedIntake: 240,
    permittedEwsQuota: 24,
    permittedTfwQuota: 12,
    permittedSupernumeraryOther: 5,
    isPolicyRuleActive: true,
  },
  {
    institutionCode: "1-882910344", // DTU - Base 480, Supernumerary 72 => Max 552, but reported 490 in base alone, over-quota rule test
    programmeName: "Computer Engineering",
    academicYear: "2026-27",
    baseApprovedIntake: 480,
    permittedEwsQuota: 0, // Zero EWS allowance configured in policy to trigger breach test
    permittedTfwQuota: 0,
    permittedSupernumeraryOther: 0,
    isPolicyRuleActive: true,
  },
  {
    institutionCode: "1-558291023",
    programmeName: "Computer Science & Engineering",
    academicYear: "2026-27",
    baseApprovedIntake: 240,
    permittedEwsQuota: 24,
    permittedTfwQuota: 12,
    permittedSupernumeraryOther: 4,
    isPolicyRuleActive: true,
  },
  {
    institutionCode: "1-449102871",
    programmeName: "Computer Science & Engineering",
    academicYear: "2026-27",
    baseApprovedIntake: 240,
    permittedEwsQuota: 24,
    permittedTfwQuota: 12,
    permittedSupernumeraryOther: 3,
    isPolicyRuleActive: true,
  },
];

// Execute deterministic engine on system startup to generate base findings
const initialRun = runDeterministicValidationEngine(
  MOCK_STUDENTS,
  MOCK_INSTITUTIONS,
  MOCK_INTAKE_POLICIES
);

export const INITIAL_VALIDATION_FINDINGS: ValidationFinding[] = initialRun.findings;
export const INITIAL_VALIDATION_METRICS = initialRun.metrics;
