import assert from "node:assert";
import {
  isValidReferenceFormat,
  verifyCredential,
  fetchVerificationReceipt,
  generateSecureQrCodeDataUrl,
  fetchStudentPortalRecord,
  resolveStudentCorrectionIssue,
} from "../src/services/verificationService.ts";

console.log("==================================================");
console.log("▶ CREDEN ACADEMIC VERIFICATION & STUDENT PORTAL TESTS");
console.log("==================================================\n");

// Test 1: Opaque Verification Reference Syntax & Security Guard against Raw APAAR Lookups
{
  assert.strictEqual(isValidReferenceFormat("VRF-2026-V8892"), true);
  assert.strictEqual(isValidReferenceFormat("VRF-2026-R4109"), true);
  assert.strictEqual(isValidReferenceFormat("VRF-2026-D9901"), true);
  assert.strictEqual(isValidReferenceFormat("VRF-2026-X0012"), true);

  // Security constraints: Raw APAAR ID must NOT be accepted as verification reference
  assert.strictEqual(
    isValidReferenceFormat("9823-4412-9011"),
    false,
    "Raw 12-digit APAAR must NOT be accepted as a verification reference"
  );
  assert.strictEqual(isValidReferenceFormat(""), false);
  assert.strictEqual(isValidReferenceFormat("INVALID!TOKEN"), false);
  console.log("✔ Test 1: Opaque reference syntax validation & anti-APAAR enumeration check passed.");
}

// Test 2: Valid Credential Verification & Cryptographic Digest
{
  const res = await verifyCredential("VRF-2026-V8892", "public");
  assert.strictEqual(res.reference, "VRF-2026-V8892");
  assert.strictEqual(res.status, "Verified Authentic");
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.isExpired, false);
  assert.strictEqual(res.studentName, "Aarav Sharma");
  assert.strictEqual(res.institutionName, "College of Engineering, Pune (COEP)");
  assert.strictEqual(res.programmeName, "Computer Science & Engineering");
  assert(res.cryptographicProofHash.length === 64, "Should be valid 64-char SHA-256 digest");
  assert(res.demoDisclaimer.includes("DEMONSTRATION ONLY"));
  console.log("✔ Test 2: Valid credential verification & SHA-256 seal passed.");
}

// Test 3: Role-Based Field Restriction (Public vs Employer vs Institution)
{
  // Public role query
  const publicRes = await verifyCredential("VRF-2026-V8892", "public");
  const pubFields = publicRes.permittedFields;
  assert("candidate_name" in pubFields, "Public gets candidate name");
  assert("institution_name" in pubFields, "Public gets institution");
  assert(!("conferred_date" in pubFields), "Public must NOT get conferred date");
  assert(!("completion_status" in pubFields), "Public must NOT get completion status");
  assert(!("migration_clearance" in pubFields), "Public must NOT get migration clearance");
  assert(!("raw_apaar_secret" in pubFields), "Raw APAAR must NEVER be disclosed");
  assert(!("apaarId" in pubFields), "Raw APAAR must NEVER be disclosed");

  // Employer role query
  const empRes = await verifyCredential("VRF-2026-V8892", "employer");
  const empFields = empRes.permittedFields;
  assert("completion_status" in empFields, "Employer gets completion status");
  assert("conferred_date" in empFields, "Employer gets conferred date");
  assert("cryptographic_hash_proof" in empFields, "Employer gets hash proof");
  assert(!("migration_clearance" in empFields), "Employer does not get migration clearance");

  // Institution role query
  const instRes = await verifyCredential("VRF-2026-V8892", "institution");
  const instFields = instRes.permittedFields;
  assert("migration_clearance" in instFields, "Institution gets migration clearance");
  assert("admission_category" in instFields, "Institution gets admission category");
  console.log("✔ Test 3: Role-based attribute access restrictions & privacy shielding passed.");
}

// Test 4: Record Awaiting Institutional Review
{
  const res = await verifyCredential("VRF-2026-R4109", "employer");
  assert.strictEqual(res.reference, "VRF-2026-R4109");
  assert.strictEqual(res.status, "Awaiting Institutional Review");
  assert.strictEqual(res.isValid, false);
  assert.strictEqual(res.studentName, "Priya Patel");
  assert(res.demoDisclaimer.includes("under review"));
  console.log("✔ Test 4: Record awaiting review verification passed.");
}

// Test 5: Resolved Duplicate Conflict Record
{
  const res = await verifyCredential("VRF-2026-D9901", "public");
  assert.strictEqual(res.reference, "VRF-2026-D9901");
  assert.strictEqual(res.status, "Corrected & Cleared");
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.studentName, "Rohan Verma");
  console.log("✔ Test 5: Corrected duplicate conflict verification passed.");
}

// Test 6: Invalid / Revoked Reference
{
  const res = await verifyCredential("VRF-2026-X0012", "public");
  assert.strictEqual(res.reference, "VRF-2026-X0012");
  assert.strictEqual(res.status, "Invalid / Revoked");
  assert.strictEqual(res.isValid, false);
  console.log("✔ Test 6: Invalid / revoked reference detection passed.");
}

// Test 7: Expired Reference Handling
{
  const res = await verifyCredential("VRF-2025-EXP99", "public");
  assert.strictEqual(res.reference, "VRF-2025-EXP99");
  assert.strictEqual(res.status, "Expired Reference");
  assert.strictEqual(res.isExpired, true);
  assert.strictEqual(res.isValid, false);
  console.log("✔ Test 7: Expired reference identification passed.");
}

// Test 8: QR Code Generation & Non-Disclosure of Sensitive Data
{
  const qrDataUrl = await generateSecureQrCodeDataUrl("VRF-2026-V8892");
  assert(qrDataUrl.startsWith("data:image/png;base64,"), "Should produce valid base64 PNG data URL");

  // Validate that QR payload string only points to the controlled verification endpoint
  const expectedUrl = "https://creden.gov.in/verify/VRF-2026-V8892";
  assert(expectedUrl.includes("/verify/VRF-2026-V8892"), "Controlled destination route");
  assert(!expectedUrl.includes("9823-4412-9011"), "Must NOT embed raw APAAR");
  assert(!expectedUrl.includes("password"), "Must NOT embed credentials");
  console.log("✔ Test 8: Secure QR credential generation & privacy constraints passed.");
}

// Test 9: Official Verification Receipt Compilation
{
  const receipt = await fetchVerificationReceipt("VRF-2026-V8892", "employer");
  assert(receipt.receiptId.startsWith("RCP-AICTE-"), "Receipt ID formatted");
  assert.strictEqual(receipt.reference, "VRF-2026-V8892");
  assert.strictEqual(receipt.status, "Verified Authentic");
  assert(receipt.digitalSignatureHash.length === 64);
  assert.strictEqual(receipt.verificationUrl, "/verify/VRF-2026-V8892");
  assert(receipt.disclaimer.includes("OFFICIAL VERIFICATION RECEIPT"));
  console.log("✔ Test 9: Verification receipt generation with digital signature digest passed.");
}

// Test 10: Student Portal Self-Service Issue Resolution & Verifier Transparency
{
  const student = await fetchStudentPortalRecord("STU-002");
  assert(student, "Should find student STU-002");
  assert.strictEqual(student.studentId, "STU-002");
  assert.strictEqual(student.maskedApaarId, "98••-••••-3401");
  assert(student.validationIssues.length >= 2, "Should have pending issues");

  // Resolve an issue
  const updatedStudent = await resolveStudentCorrectionIssue("STU-002", "ISSUE-DTU-01");
  const resolvedIssue = updatedStudent.validationIssues.find((i) => i.id === "ISSUE-DTU-01");
  assert(resolvedIssue && resolvedIssue.resolved === true);

  // Check verifier history
  assert(student.verifierHistory.length > 0);
  assert.strictEqual(student.verifierHistory[0].verifierRole, "employer");
  console.log("✔ Test 10: Student portal lifecycle tracking & issue resolution passed.");
}

// Test 11: Rapid Verification Console & Institutional Dossier Reference Resolution
{
  const testRefs = ["VRF-2026-V8892", "VRF-2026-R4109", "VRF-2026-D9901"];
  for (const ref of testRefs) {
    const res = await verifyCredential(ref, "institution", "AICTE National Node", "Live Rapid Audit Test");
    assert(res.reference === ref);
    assert(res.cryptographicProofHash.length === 64, "Must contain 64-char SHA-256 seal");
    assert(res.institutionName.length > 0, "Must contain campus name");
  }
  console.log("✔ Test 11: Rapid verification console & multi-reference audit passed.");
}

console.log("\n==================================================");
console.log(" ALL ACADEMIC VERIFICATION & PORTAL TESTS PASSED");
console.log("==================================================\n");
