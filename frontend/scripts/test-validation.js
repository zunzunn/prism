import assert from "node:assert";
import { validateParsedCsvRows, maskApaarId } from "../src/services/studentService.ts";

console.log("▶ Running CREDEN Student & CSV Validation Tests...\n");

// Test 1: APAAR ID Masking
{
  const masked1 = maskApaarId("9823-4412-9011");
  assert.strictEqual(masked1, "98••-••••-9011", "Masked format should be 98••-••••-9011");

  const maskedShort = maskApaarId("123");
  assert.strictEqual(maskedShort, "••••-••••-••••", "Short APAAR should be fully masked");

  const emptyMasked = maskApaarId("");
  assert.strictEqual(emptyMasked, "••••-••••-••••", "Empty APAAR should be fully masked");
  console.log("✔ APAAR ID masking tests passed.");
}

// Test 2: CSV Parsing & Validation - Valid Rows
{
  const headers = ["apaar_id", "student_id", "full_name", "programme", "academic_year"];
  const rows = [
    {
      apaar_id: "9823-4412-9011",
      student_id: "COEP/CS/001",
      full_name: "Test Student 1",
      programme: "Computer Science",
      academic_year: "2026-27",
    },
  ];
  const summary = validateParsedCsvRows(headers, rows, "test_valid.csv");
  assert.strictEqual(summary.totalRows, 1);
  assert.strictEqual(summary.validRowsCount, 1);
  assert.strictEqual(summary.rejectedRowsCount, 0);
  assert.strictEqual(summary.columnMappingIssues.length, 0);
  console.log("✔ CSV valid rows test passed.");
}

// Test 3: CSV Parsing - Missing Columns
{
  const headers = ["student_id", "full_name"]; // Missing apaar_id, programme, academic_year
  const rows = [{ student_id: "001", full_name: "Incomplete Row" }];
  const summary = validateParsedCsvRows(headers, rows, "test_missing.csv");
  assert.strictEqual(summary.columnMappingIssues.length, 3);
  assert(summary.columnMappingIssues.includes("apaar_id"));
  assert(summary.columnMappingIssues.includes("programme"));
  assert(summary.columnMappingIssues.includes("academic_year"));
  console.log("✔ Missing column mapping detection test passed.");
}

// Test 4: CSV Parsing - Invalid APAAR format
{
  const headers = ["apaar_id", "student_id", "full_name", "programme", "academic_year"];
  const rows = [
    {
      apaar_id: "INVALID_APAAR_123", // Letters and invalid length
      student_id: "COEP/CS/002",
      full_name: "Invalid Student",
      programme: "Mechanical",
      academic_year: "2026-27",
    },
  ];
  const summary = validateParsedCsvRows(headers, rows, "test_invalid.csv");
  assert.strictEqual(summary.rejectedRowsCount, 1);
  assert.strictEqual(summary.validRowsCount, 0);
  assert(summary.rowResults[0].errors[0].includes("Invalid APAAR format"));
  console.log("✔ Invalid APAAR format rejection test passed.");
}

console.log("\n All Student & CSV Validation tests executed successfully!");
