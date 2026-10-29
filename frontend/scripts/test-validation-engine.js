import assert from "node:assert";
import { evaluateApaarRules, normalizeApaar } from "../src/services/validation/rules/apaarRules.ts";
import { evaluateDuplicateRules } from "../src/services/validation/rules/duplicateRules.ts";
import { evaluateIntakeRules } from "../src/services/validation/rules/intakeRules.ts";
import { evaluateDataConsistencyRules } from "../src/services/validation/rules/dataConsistencyRules.ts";
import { runDeterministicValidationEngine } from "../src/services/validation/validationEngine.ts";
import { queryMockApaarAdapter } from "../src/services/validation/mockApaarAdapter.ts";
import { updateFindingStatus, fetchValidationDashboard } from "../src/services/validationService.ts";
import { INITIAL_VALIDATION_FINDINGS } from "../src/data/validationData.ts";

console.log("==================================================");
console.log("▶ CREDEN DETERMINISTIC VALIDATION ENGINE TESTS");
console.log("==================================================\n");

// Test 1: Category 1 - Missing APAAR Identifier (RULE-APAAR-001)
{
  const student = {
    id: "TEST-STU-001",
    apaarId: "", // Empty identifier
    institutionStudentId: "COEP/CS/101",
    fullName: "Rohan Verma",
    institutionCode: "MH-ENG-001",
    institutionName: "COEP Technological University",
    programme: "Computer Engineering",
    academicYear: "2026-27",
    admissionDate: "2026-08-01",
    approvedIntakeReference: "AICTE-2026-001",
    admissionCategory: "General / Open",
    enrolmentStatus: "Active Enrolment",
    verificationStatus: "Unverified",
  };

  const findings = evaluateApaarRules(student, [student]);
  assert.strictEqual(findings.length, 1);
  assert.strictEqual(findings[0].ruleId, "RULE-APAAR-001");
  assert.strictEqual(findings[0].severity, "Critical");
  assert.strictEqual(findings[0].category, "APAAR Identifier");
  assert(findings[0].explanation.includes("mandatory 12-digit APAAR"));
  console.log("✔ Test 1: Missing APAAR identifier check (RULE-APAAR-001) passed.");
}

// Test 2: Category 1 - Invalid APAAR Format (RULE-APAAR-002)
{
  const student = {
    id: "TEST-STU-002",
    apaarId: "9823-INVALID-44", // Contains non-digits and not 12 digits
    institutionStudentId: "COEP/CS/102",
    fullName: "Priya Sharma",
    institutionCode: "MH-ENG-001",
    institutionName: "COEP Technological University",
    programme: "Computer Engineering",
    academicYear: "2026-27",
    admissionDate: "2026-08-01",
    approvedIntakeReference: "AICTE-2026-001",
    admissionCategory: "General / Open",
    enrolmentStatus: "Active Enrolment",
    verificationStatus: "Unverified",
  };

  const findings = evaluateApaarRules(student, [student]);
  assert.strictEqual(findings.length, 1);
  assert.strictEqual(findings[0].ruleId, "RULE-APAAR-002");
  assert.strictEqual(findings[0].severity, "Critical");
  assert(findings[0].explanation.includes("national 12-digit numeric specification"));
  console.log("✔ Test 2: Invalid APAAR format check (RULE-APAAR-002) passed.");
}

// Test 3: Category 1 - Mock Authoritative Verification Adapter
{
  const validRes = await queryMockApaarAdapter("9823-4412-9011");
  assert.strictEqual(validRes.isSyntacticallyValid, true);
  assert.strictEqual(validRes.simulatedAuthoritativeStatus, "SIMULATED_VERIFIED_SANDBOX");
  assert(validRes.disclaimer.includes("DEMONSTRATION ONLY"));

  const invalidRes = await queryMockApaarAdapter("INVALID_123");
  assert.strictEqual(invalidRes.isSyntacticallyValid, false);
  assert.strictEqual(invalidRes.simulatedAuthoritativeStatus, "SIMULATED_NOT_FOUND_IN_SANDBOX");

  const unavailRes = await queryMockApaarAdapter("9823-0000-9011");
  assert.strictEqual(unavailRes.simulatedAuthoritativeStatus, "SIMULATED_GATEWAY_UNAVAILABLE");
  console.log("✔ Test 3: Mock APAAR sandbox adapter query & explicit disclaimers passed.");
}

// Test 4: Category 2 - Intra-Institutional Roll Number Collision (RULE-DUP-004)
{
  const studentA = {
    id: "TEST-STU-003",
    apaarId: "9823-4412-1001",
    institutionStudentId: "COEP/CS/DUP_ROLL",
    fullName: "Aarav Gupta",
    institutionCode: "MH-ENG-001",
    institutionName: "COEP Technological University",
    programme: "Computer Engineering",
    academicYear: "2026-27",
    admissionDate: "2026-08-01",
    approvedIntakeReference: "AICTE-2026-001",
    admissionCategory: "General / Open",
    enrolmentStatus: "Active Enrolment",
    verificationStatus: "Verified",
  };

  const studentB = {
    id: "TEST-STU-004",
    apaarId: "9823-4412-1002",
    institutionStudentId: "COEP/CS/DUP_ROLL", // Same roll number at same institution
    fullName: "Karan Patel",
    institutionCode: "MH-ENG-001",
    institutionName: "COEP Technological University",
    programme: "Computer Engineering",
    academicYear: "2026-27",
    admissionDate: "2026-08-01",
    approvedIntakeReference: "AICTE-2026-001",
    admissionCategory: "OBC-NCL",
    enrolmentStatus: "Active Enrolment",
    verificationStatus: "Verified",
  };

  const findings = evaluateDuplicateRules(studentA, [studentA, studentB]);
  assert.strictEqual(findings.length, 1);
  assert.strictEqual(findings[0].ruleId, "RULE-DUP-004");
  assert.strictEqual(findings[0].severity, "Warning");
  assert.strictEqual(findings[0].category, "Duplicate Detection");
  assert(findings[0].explanation.includes("administrative indexing error rather than fraudulent"));
  console.log("✔ Test 4: Intra-institutional roll number collision (RULE-DUP-004) passed.");
}

// Test 5: Category 2 - Cross-Institutional Concurrent Active Enrolment (RULE-DUP-003)
{
  const studentInstA = {
    id: "TEST-STU-005",
    apaarId: "9823-4412-9999",
    institutionStudentId: "COEP/CS/005",
    fullName: "Sneha Nair",
    institutionCode: "MH-ENG-001",
    institutionName: "COEP Technological University",
    programme: "Computer Engineering",
    academicYear: "2026-27",
    admissionDate: "2026-08-01",
    approvedIntakeReference: "AICTE-2026-001",
    admissionCategory: "General / Open",
    enrolmentStatus: "Active Enrolment",
    verificationStatus: "Verified",
  };

  const studentInstB = {
    id: "TEST-STU-006",
    apaarId: "9823-4412-9999", // Same APAAR ID
    institutionStudentId: "VJTI/IT/006",
    fullName: "Sneha Nair",
    institutionCode: "MH-ENG-002", // Different institution
    institutionName: "Veermata Jijabai Technological Institute",
    programme: "Information Technology",
    academicYear: "2026-27",
    admissionDate: "2026-08-05",
    approvedIntakeReference: "AICTE-2026-002",
    admissionCategory: "General / Open",
    enrolmentStatus: "Active Enrolment", // Both active!
    verificationStatus: "Verified",
  };

  const findings = evaluateDuplicateRules(studentInstA, [studentInstA, studentInstB]);
  const crossFinding = findings.find((f) => f.ruleId === "RULE-DUP-003");
  assert(crossFinding, "Should detect cross-institution concurrent enrolment");
  assert.strictEqual(crossFinding.severity, "Critical");
  assert.strictEqual(crossFinding.category, "Duplicate Detection");
  assert(crossFinding.affectedRecordReferences.includes("TEST-STU-005"));
  assert(crossFinding.affectedRecordReferences.includes("TEST-STU-006"));
  console.log("✔ Test 5: Cross-institutional concurrent active enrollment (RULE-DUP-003) passed.");
}

// Test 6: Category 3 - Intake Capacity Breach with Supernumerary Quotas (RULE-INTAKE-001)
{
  const institution = {
    id: "INST-TEST-001",
    code: "TEST-ENG-001",
    name: "Test Institute of Technology",
    state: "Maharashtra",
    programmes: [
      {
        id: "PRG-CS",
        programmeName: "Computer Science and Engineering",
        academicYear: "2026-27",
        approvedIntake: 120,
        reportedEnrolment: 150, // 150 enrolled
      },
    ],
  };

  // Policy: Base 120 + EWS 12 + TFW 6 + Supernumerary 2 = 140 max capacity
  const policies = [
    {
      institutionCode: "TEST-ENG-001",
      programmeName: "Computer Science and Engineering",
      academicYear: "2026-27",
      baseApprovedIntake: 120,
      permittedEwsQuota: 12,
      permittedTfwQuota: 6,
      permittedSupernumeraryOther: 2,
      isPolicyRuleActive: true,
    },
  ];

  const findings = evaluateIntakeRules(institution, policies);
  assert.strictEqual(findings.length, 1);
  assert.strictEqual(findings[0].ruleId, "RULE-INTAKE-001");
  assert.strictEqual(findings[0].severity, "Critical");
  assert(findings[0].explanation.includes("exceeds total permissible capacity of 140"));
  assert(findings[0].explanation.includes("by 10 students"));
  console.log("✔ Test 6: Intake capacity breach accounting for supernumerary seats (RULE-INTAKE-001) passed.");
}

// Test 7: Category 3 - Missing Regulatory Policy Rule Defaults to "Under Review" (RULE-INTAKE-002)
{
  const institution = {
    id: "INST-TEST-002",
    code: "TEST-ENG-002",
    name: "Unconfigured Regional Campus",
    state: "Karnataka",
    programmes: [
      {
        id: "PRG-MECH",
        programmeName: "Mechanical Engineering",
        academicYear: "2026-27",
        approvedIntake: 60,
        reportedEnrolment: 55,
      },
    ],
  };

  // No policy configured in policies array
  const findings = evaluateIntakeRules(institution, []);
  assert.strictEqual(findings.length, 1);
  assert.strictEqual(findings[0].ruleId, "RULE-INTAKE-002");
  assert.strictEqual(findings[0].severity, "Warning");
  assert.strictEqual(findings[0].reviewStatus, "Under Review");
  assert(findings[0].explanation.includes("Cannot ascertain sanctioned limits without regulatory parameters"));
  console.log("✔ Test 7: Missing policy rule defaults safely to 'Under Review' (RULE-INTAKE-002) passed.");
}

// Test 8: Category 4 - Data Consistency: Missing Lifecycle Fields & Invalid Dates
{
  const inconsistentStudent = {
    id: "TEST-STU-007",
    apaarId: "9823-4412-9011",
    institutionStudentId: "", // Missing mandatory roll number
    fullName: "", // Missing full name
    institutionCode: "MH-ENG-001",
    institutionName: "COEP Technological University",
    programme: "Computer Engineering",
    academicYear: "2026-27",
    admissionDate: "INVALID-DATE-STRING", // Invalid date
    approvedIntakeReference: "AICTE-2026-001",
    admissionCategory: "NonStandardCategory", // Invalid category
    enrolmentStatus: "InvalidStatus", // Invalid status
    verificationStatus: "Unverified",
  };

  const findings = evaluateDataConsistencyRules(inconsistentStudent);
  const ruleIds = findings.map((f) => f.ruleId);
  assert(ruleIds.includes("RULE-DATA-001"), "Should detect missing lifecycle fields");
  assert(ruleIds.includes("RULE-DATA-002"), "Should detect invalid ISO admission date");
  assert(ruleIds.includes("RULE-DATA-004"), "Should detect invalid admission category");
  assert(ruleIds.includes("RULE-DATA-005"), "Should detect invalid enrolment lifecycle status");
  console.log("✔ Test 8: Data consistency validation rules (RULE-DATA-001, 002, 004, 005) passed.");
}

// Test 9: Review Workflow - False-Positive Dismissal Enforces Mandatory Justification
{
  assert(INITIAL_VALIDATION_FINDINGS.length >= 2, "Should have initial findings from mock run");
  const targetId1 = INITIAL_VALIDATION_FINDINGS[0].id;
  const targetId2 = INITIAL_VALIDATION_FINDINGS[1].id;

  // Test valid update status
  const updated = await updateFindingStatus(
    targetId1,
    "Explanation Requested",
    "Nodal officer asked to provide biometric verification proof",
    "Compliance Inspector"
  );
  assert.strictEqual(updated.reviewStatus, "Explanation Requested");
  assert.strictEqual(updated.auditTrail[0].actor, "Compliance Inspector");
  assert.strictEqual(updated.auditTrail[0].action, "Status Updated to Explanation Requested");
  assert.strictEqual(updated.auditTrail[0].newStatus, "Explanation Requested");
  assert.strictEqual(updated.auditTrail[0].reason, "Nodal officer asked to provide biometric verification proof");

  // Verify dismissal update with justification
  const previousStatus = INITIAL_VALIDATION_FINDINGS[1].reviewStatus;
  const dismissed = await updateFindingStatus(
    targetId2,
    "Dismissed False Positive",
    "Verified legitimate transfer certificate issued on 2026-07-28 by Maharashtra DTE",
    "AICTE Chief Registrar"
  );
  assert.strictEqual(dismissed.reviewStatus, "Dismissed False Positive");
  assert.strictEqual(dismissed.dismissalReason, "Verified legitimate transfer certificate issued on 2026-07-28 by Maharashtra DTE");
  assert.strictEqual(dismissed.auditTrail[0].newStatus, "Dismissed False Positive");
  assert.strictEqual(dismissed.auditTrail[0].previousStatus, previousStatus);
  console.log("✔ Test 9: Review workflow & immutable audit trail generation passed.");
}

// Test 10: End-to-End Deterministic Validation Engine Execution
{
  const mockStudents = [
    {
      id: "MOCK-STU-1",
      apaarId: "9823-4412-1111",
      institutionStudentId: "COEP/CS/001",
      fullName: "Student One",
      institutionCode: "MH-ENG-001",
      institutionName: "COEP Technological University",
      programme: "Computer Engineering",
      academicYear: "2026-27",
      admissionDate: "2026-08-01",
      approvedIntakeReference: "AICTE-2026-001",
      admissionCategory: "General / Open",
      enrolmentStatus: "Active Enrolment",
      verificationStatus: "Verified",
    },
    {
      id: "MOCK-STU-2",
      apaarId: "", // Missing
      institutionStudentId: "COEP/CS/002",
      fullName: "Student Two",
      institutionCode: "MH-ENG-001",
      institutionName: "COEP Technological University",
      programme: "Computer Engineering",
      academicYear: "2026-27",
      admissionDate: "2026-08-01",
      approvedIntakeReference: "AICTE-2026-001",
      admissionCategory: "OBC-NCL",
      enrolmentStatus: "Active Enrolment",
      verificationStatus: "Unverified",
    },
  ];

  const mockInstitutions = [
    {
      id: "INST-1",
      code: "MH-ENG-001",
      name: "COEP Technological University",
      state: "Maharashtra",
      programmes: [
        {
          id: "PRG-1",
          programmeName: "Computer Engineering",
          academicYear: "2026-27",
          approvedIntake: 120,
          reportedEnrolment: 130,
        },
      ],
    },
  ];

  const mockPolicies = [
    {
      institutionCode: "MH-ENG-001",
      programmeName: "Computer Engineering",
      academicYear: "2026-27",
      baseApprovedIntake: 120,
      permittedEwsQuota: 12,
      permittedTfwQuota: 6,
      permittedSupernumeraryOther: 0,
      isPolicyRuleActive: true,
    },
  ];

  const res = runDeterministicValidationEngine(mockStudents, mockInstitutions, mockPolicies);
  assert(res.findings.length > 0);
  assert.strictEqual(res.metrics.totalRecordsEvaluated, 2);
  assert(res.metrics.recordsRequiringReview >= 1);
  console.log("✔ Test 10: End-to-end deterministic validation engine execution passed.");
}

console.log("\n==================================================");
console.log(" ALL 10 VALIDATION ENGINE TESTS PASSED SUCCESSFULLY");
console.log("==================================================\n");
