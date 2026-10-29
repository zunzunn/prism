import assert from "node:assert";
import {
  calculateProgrammeUtilization,
  buildAllProgrammeIntakeRows,
  fetchIntakeMonitoringData,
} from "../src/services/intakeService.ts";
import {
  fetchAnalyticsData,
} from "../src/services/analyticsService.ts";
import {
  escapeCsvField,
  buildCsvString,
  generateAndDownloadReport,
  REPORT_DEFINITIONS,
  getSessionReportHistory,
} from "../src/services/reportService.ts";

console.log("==================================================");
console.log("▶ CREDEN INTAKE MONITORING, ANALYTICS & REPORTS TESTS");
console.log("==================================================\n");

// Test 1: Centralized Utilization Calculation - Within Base Sanctioned Intake
{
  const policy = {
    institutionCode: "TEST-001",
    programmeName: "Computer Science",
    academicYear: "2026-27",
    baseApprovedIntake: 120,
    permittedEwsQuota: 12,
    permittedTfwQuota: 6,
    permittedSupernumeraryOther: 2,
    isPolicyRuleActive: true,
  };

  // 100 students enrolled out of base 120 (total cap 140)
  const result = calculateProgrammeUtilization(100, 120, policy);
  assert.strictEqual(result.baseApprovedIntake, 120);
  assert.strictEqual(result.totalPermissibleCapacity, 140); // 120 + 12 + 6 + 2
  assert.strictEqual(result.reportedEnrolment, 100);
  assert.strictEqual(result.regularUtilizationRate, 83.3); // (100 / 120) * 100
  assert.strictEqual(result.effectiveUtilizationRate, 71.4); // (100 / 140) * 100
  assert.strictEqual(result.remainingCapacity, 40); // 140 - 100
  assert.strictEqual(result.complianceStatus, "Under Capacity"); // < 75% effective
  assert.strictEqual(result.isPolicyMissing, false);
  console.log("✔ Test 1: Standard intake utilization with defined denominator passed.");
}

// Test 2: Admissions Above Base Intake But Within Permissible Supernumerary Quota
{
  const policy = {
    institutionCode: "TEST-001",
    programmeName: "Computer Science",
    academicYear: "2026-27",
    baseApprovedIntake: 120,
    permittedEwsQuota: 12,
    permittedTfwQuota: 6,
    permittedSupernumeraryOther: 2,
    isPolicyRuleActive: true,
  };

  // 130 enrolled: Exceeds base 120, but within total permissible cap 140
  const result = calculateProgrammeUtilization(130, 120, policy);
  assert.strictEqual(result.reportedEnrolment, 130);
  assert.strictEqual(result.complianceStatus, "Compliant");
  assert(result.statusReason.includes("remain within approved supernumerary quota"));
  assert(result.regularUtilizationRate > 100); // 108.3%
  assert.strictEqual(result.effectiveUtilizationRate, 92.9); // (130 / 140) * 100
  assert.strictEqual(result.remainingCapacity, 10);
  console.log("✔ Test 2: Legitimate supernumerary admission not falsely flagged as violation passed.");
}

// Test 3: Total Permissible Capacity Breach (Over-Admission Violation)
{
  const policy = {
    institutionCode: "TEST-001",
    programmeName: "Computer Science",
    academicYear: "2026-27",
    baseApprovedIntake: 120,
    permittedEwsQuota: 12,
    permittedTfwQuota: 6,
    permittedSupernumeraryOther: 2,
    isPolicyRuleActive: true,
  };

  // 145 enrolled: Exceeds total permissible cap 140 by 5
  const result = calculateProgrammeUtilization(145, 120, policy);
  assert.strictEqual(result.complianceStatus, "Over Capacity Breach");
  assert(result.statusReason.includes("exceeds total permissible capacity (140) by 5 seats"));
  assert.strictEqual(result.remainingCapacity, 0);
  assert(result.effectiveUtilizationRate > 100);
  console.log("✔ Test 3: Over-capacity breach calculation & excess seat count passed.");
}

// Test 4: Missing Regulatory Approval Policy Defaults to "Requires Review"
{
  // No policy provided (or policy is missing in central database)
  const resultWithoutPolicy = calculateProgrammeUtilization(125, 120, undefined);
  assert.strictEqual(resultWithoutPolicy.complianceStatus, "Requires Review");
  assert.strictEqual(resultWithoutPolicy.isPolicyMissing, true);
  assert(resultWithoutPolicy.statusReason.includes("Approval Process Handbook (APH) policy"));
  assert(resultWithoutPolicy.statusReason.includes("capacity cannot be determined"));

  // Crucial test: It must NOT be flagged as Over Capacity Breach
  assert.notStrictEqual(resultWithoutPolicy.complianceStatus, "Over Capacity Breach");
  console.log("✔ Test 4: Missing regulatory policy gracefully marks 'Requires Review' without false violation passed.");
}

// Test 5: Near Capacity Threshold Calculation
{
  const policy = {
    institutionCode: "TEST-001",
    programmeName: "Mechanical",
    academicYear: "2026-27",
    baseApprovedIntake: 100,
    permittedEwsQuota: 0,
    permittedTfwQuota: 0,
    permittedSupernumeraryOther: 0,
    isPolicyRuleActive: true,
  };

  // 96 enrolled on 100 capacity => 96% utilization
  const result = calculateProgrammeUtilization(96, 100, policy);
  assert.strictEqual(result.complianceStatus, "Near Capacity");
  assert.strictEqual(result.remainingCapacity, 4);
  console.log("✔ Test 5: Near capacity threshold detection passed.");
}

// Test 6: Aggregated Intake Monitoring Dashboard Data & Multi-Filter Query
{
  const data = await fetchIntakeMonitoringData({
    state: "Maharashtra",
    academicYear: "2026-27",
  });

  assert(data.rows.length > 0, "Should return Maharashtra programmes");
  data.rows.forEach((r) => {
    assert.strictEqual(r.state, "Maharashtra");
  });
  assert(data.metrics.totalApprovedIntake > 0);
  assert(data.metrics.totalReportedEnrolment > 0);
  assert(data.metrics.overallRegularUtilizationRate > 0);
  console.log("✔ Test 6: Intake monitoring service filtering & KPI aggregation passed.");
}

// Test 7: Analytics Multi-Year Trajectory & Transparent Baseline CAGR Forecast
{
  const analytics = await fetchAnalyticsData("All");
  assert.strictEqual(analytics.yearlyTrends.length, 4); // 2023-24, 2024-25, 2025-26, 2026-27
  assert(analytics.institutionComparisons.length > 0);
  assert(analytics.stateSummaries.length > 0);

  // Verify Forecast Transparency
  assert(analytics.forecast.methodology.includes("CAGR"), "Methodology should include CAGR");
  assert(analytics.forecast.disclaimer.includes("Transparent heuristic estimate"), "Should contain transparent estimate label");
  assert(analytics.forecast.disclaimer.includes("official AICTE predictive forecast"), "Should disclaim official predictive forecast");

  // Check projected future points
  const projected = analytics.forecast.baselineData.filter((d) => d.isProjected);
  assert.strictEqual(projected.length, 2);
  assert(projected[0].academicYear.includes("2027-28"));
  assert(projected[1].academicYear.includes("2028-29"));
  console.log("✔ Test 7: Multi-year trend analytics & transparent CAGR forecast passed.");
}

// Test 8: CSV String Formatting & RFC-4180 Escaping
{
  // Test field escaping
  assert.strictEqual(escapeCsvField("Normal Text"), '"Normal Text"');
  assert.strictEqual(escapeCsvField('Field with "quotes"'), '"Field with ""quotes"""');
  assert.strictEqual(escapeCsvField("Field, with, commas"), '"Field, with, commas"');
  assert.strictEqual(escapeCsvField("Multi\nLine\nField"), '"Multi\nLine\nField"');
  assert.strictEqual(escapeCsvField(1234), '"1234"');

  const headers = ["ID", "Name", "Intake"];
  const rows = [
    ["1", "COEP, Pune", 1200],
    ["2", 'DTU "Main"', 2400],
  ];

  const csv = buildCsvString(headers, rows, {
    title: "Test Intake Ledger",
    generatedAt: "2026-10-29T10:00:00Z",
    generatedBy: "Inspector",
    filters: "All",
    complianceNotice: "Demonstration Data",
  });

  assert(csv.includes("# REPORT: TEST INTAKE LEDGER"));
  assert(csv.includes("# ENVIRONMENT: DEMONSTRATION SANDBOX (NON-PRODUCTION)"));
  assert(csv.includes('"ID","Name","Intake"'));
  assert(csv.includes('"COEP, Pune"'));
  assert(csv.includes('"DTU ""Main"""'));
  console.log("✔ Test 8: CSV RFC-4180 formatting & metadata header generation passed.");
}

// Test 9: Downloadable Report Generation for All 6 Standard Categories
{
  assert.strictEqual(REPORT_DEFINITIONS.length, 6);

  // Generate Institutional Enrolment report
  const rep1 = await generateAndDownloadReport({
    reportType: "institutional_enrolment",
    state: "Maharashtra",
  });
  assert(rep1.rowCount > 0);
  assert(rep1.filename.startsWith("creden-institutional-enrolment"));

  // Generate Intake Utilization report
  const rep2 = await generateAndDownloadReport({
    reportType: "intake_utilization",
    academicYear: "2026-27",
  });
  assert(rep2.rowCount > 0);
  assert(rep2.filename.startsWith("creden-intake-capacity-audit"));

  // Generate Validation Findings report
  const rep3 = await generateAndDownloadReport({
    reportType: "validation_findings",
  });
  assert(rep3.rowCount > 0);

  // Generate Duplicate Conflicts report
  const rep4 = await generateAndDownloadReport({
    reportType: "duplicate_conflicts",
  });
  assert(rep4.filename.startsWith("creden-duplicate-conflicts"));

  // Generate Submission History report
  const rep5 = await generateAndDownloadReport({
    reportType: "submission_history",
  });
  assert(rep5.rowCount > 0);

  // Generate Audit Events report
  const rep6 = await generateAndDownloadReport({
    reportType: "audit_events",
  });
  assert(rep6.rowCount > 0);

  // Check session history
  const history = getSessionReportHistory();
  assert.strictEqual(history.length, 6);
  console.log("✔ Test 9: All 6 statutory report generators & export manifests passed.");
}

console.log("\n==================================================");
console.log(" ALL INTAKE, ANALYTICS & REPORTS TESTS PASSED");
console.log("==================================================\n");
