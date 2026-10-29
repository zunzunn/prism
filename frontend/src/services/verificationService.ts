import axios from "axios";
import QRCode from "qrcode";
import {
  VerifierRole,
  VerificationResult,
  VerificationReceipt,
  StudentPortalRecord,
  VerificationAuditEntry,
} from "@/types/verification";
import {
  DEMO_VERIFICATION_RECORDS,
  DEMO_STUDENT_PORTAL_RECORDS,
} from "@/data/verificationData";

const API_BASE = "/api/verification";

// In-memory store of active student portal records for interactive demo
let studentRecordsStore: StudentPortalRecord[] = [
  ...DEMO_STUDENT_PORTAL_RECORDS,
];

// In-memory verification audit log
let clientAuditLogs: VerificationAuditEntry[] = [];

/**
 * Validates opaque verification reference format.
 * Prevents raw APAAR or malformed tokens from querying verification endpoints.
 */
export const isValidReferenceFormat = (ref: string): boolean => {
  if (!ref || ref.trim().length < 6 || ref.trim().length > 32) return false;
  return /^VRF-[A-Z0-9-]+$/i.test(ref.trim());
};

/**
 * Verifies an academic credential reference.
 * Enforces role-based attribute filtering on client and backend.
 */
export const verifyCredential = async (
  reference: string,
  role: VerifierRole = "public",
  organization: string = "Authorized Verifier",
  purpose: string = "Academic Credential Verification"
): Promise<VerificationResult> => {
  const cleanRef = reference.trim().toUpperCase();

  if (!isValidReferenceFormat(cleanRef)) {
    throw new Error(
      `Invalid verification reference format: "${reference}". Verification references must be opaque identifiers (e.g. VRF-2026-V8892).`
    );
  }

  // Try real backend endpoint first
  try {
    const res = await axios.post<VerificationResult>(
      `${API_BASE}/verify`,
      {
        reference: cleanRef,
        verifier_role: role,
        verifier_organization: organization,
        purpose,
      },
      {
        headers: { "X-Verifier-Role": role },
        timeout: 2500,
      }
    );
    return res.data;
  } catch (err: any) {
    // If backend returns a 400 or 404 error, rethrow its detail message
    if (err.response?.status === 404) {
      throw new Error(
        err.response.data?.detail ||
          `Reference "${cleanRef}" not found in AICTE national academic registry.`
      );
    }
    if (err.response?.status === 400) {
      throw new Error(
        err.response.data?.detail ||
          `Malformed reference format: "${cleanRef}".`
      );
    }

    // Fallback to local deterministic demo records (e.g. offline dev mode)
    const mock = DEMO_VERIFICATION_RECORDS[cleanRef];
    if (!mock) {
      throw new Error(
        `Reference "${cleanRef}" not found in AICTE national academic registry. Check the reference code or request an updated QR pass from the candidate.`
      );
    }

    // Apply role-based restricted fields
    const permittedFields: Record<string, any> = {
      candidate_name: mock.studentName,
      institution_name: mock.institutionName,
      institution_code: mock.institutionCode,
      programme_name: mock.programmeName,
      degree_level: mock.degreeLevel,
      academic_year: mock.academicYear,
      verification_status: mock.status,
      verified_on: mock.verificationDate,
    };

    if (role === "employer" || role === "institution") {
      permittedFields["completion_status"] = mock.permittedFields?.completion_status || "Completed with Distinction";
      permittedFields["conferred_date"] = mock.permittedFields?.conferred_date || "2026-06-15";
      permittedFields["cryptographic_hash_proof"] = mock.cryptographicProofHash;
    }

    if (role === "institution") {
      permittedFields["migration_clearance"] = mock.permittedFields?.migration_clearance || "Verified by State Higher Education CET Cell";
      permittedFields["admission_category"] = mock.permittedFields?.admission_category || "General / Open";
    }

    // Log client audit entry
    const auditEntry: VerificationAuditEntry = {
      id: `AUD-CLIENT-${Date.now()}`,
      reference: cleanRef,
      verifierRole: role,
      verifierOrganization: organization,
      purpose,
      status: mock.status,
      accessedAt: new Date().toISOString(),
      ipAddressHash: "e3b0c44298fc1c149afbf4c8",
    };
    clientAuditLogs.unshift(auditEntry);

    return {
      ...mock,
      verifierRole: role,
      permittedFields,
    };
  }
};

/**
 * Fetches official verification receipt.
 */
export const fetchVerificationReceipt = async (
  reference: string,
  role: VerifierRole = "employer"
): Promise<VerificationReceipt> => {
  const cleanRef = reference.trim().toUpperCase();

  try {
    const res = await axios.get<VerificationReceipt>(
      `${API_BASE}/receipt/${cleanRef}?role=${role}`,
      { timeout: 2000 }
    );
    return res.data;
  } catch (err) {
    // Fallback receipt compiler
    const res = await verifyCredential(cleanRef, role);
    return {
      receiptId: `RCP-AICTE-${cleanRef.replace("VRF-", "")}-${Date.now().toString().slice(-6)}`,
      reference: cleanRef,
      status: res.status,
      studentName: res.studentName,
      institutionName: res.institutionName,
      programmeName: res.programmeName,
      degreeLevel: res.degreeLevel,
      academicYear: res.academicYear,
      verifiedAt: new Date().toISOString(),
      issuedBy: "AICTE National Academic Credential Verification Authority",
      digitalSignatureHash: res.cryptographicProofHash,
      verificationUrl: `/verify/${cleanRef}`,
      disclaimer:
        "OFFICIAL VERIFICATION RECEIPT (DEMONSTRATION SANDBOX). Verifiable via AICTE digital node signature.",
    };
  }
};

/**
 * Generates an SVG or PNG data URL QR Code.
 * SECURITY CONSTRAINT: Contains ONLY the controlled URL endpoint, NO raw APAAR ID, NO passwords!
 */
export const generateSecureQrCodeDataUrl = async (
  reference: string
): Promise<string> => {
  const cleanRef = reference.trim().toUpperCase();
  // Safe URL payload: Controlled verification route only
  const payloadUrl = `https://creden.gov.in/verify/${cleanRef}`;

  return await QRCode.toDataURL(payloadUrl, {
    width: 280,
    margin: 1.5,
    color: {
      dark: "#05080e",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
};

/**
 * Fetches Student Portal record.
 */
export const fetchStudentPortalRecord = async (
  studentId: string = "STU-001"
): Promise<StudentPortalRecord | null> => {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const found = studentRecordsStore.find((s) => s.studentId === studentId);
  return found || studentRecordsStore[0] || null;
};

/**
 * Retrieves all synthetic student demo accounts.
 */
export const getAllStudentDemoAccounts = (): Array<{
  studentId: string;
  fullName: string;
  scenario: string;
  reference: string;
  status: string;
}> => {
  return [
    {
      studentId: "STU-001",
      fullName: "Aarav Sharma",
      scenario: "Valid & Verified Candidate",
      reference: "VRF-2026-V8892",
      status: "Verified Authentic",
    },
    {
      studentId: "STU-002",
      fullName: "Priya Patel",
      scenario: "Record Awaiting University Review",
      reference: "VRF-2026-R4109",
      status: "Awaiting Institutional Review",
    },
    {
      studentId: "STU-003",
      fullName: "Rohan Verma",
      scenario: "Resolved Duplicate Conflict Cleared",
      reference: "VRF-2026-D9901",
      status: "Corrected & Cleared",
    },
    {
      studentId: "STU-004",
      fullName: "Sneha Nair",
      scenario: "Invalid / Revoked Reference (Over-Quota)",
      reference: "VRF-2026-X0012",
      status: "Invalid / Revoked",
    },
  ];
};

/**
 * Resolves a student correction issue (simulated).
 */
export const resolveStudentCorrectionIssue = async (
  studentId: string,
  issueId: string
): Promise<StudentPortalRecord> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const idx = studentRecordsStore.findIndex((s) => s.studentId === studentId);
  if (idx === -1) throw new Error("Student not found");

  const stu = studentRecordsStore[idx]!;
  const updatedIssues = stu.validationIssues.map((issue) =>
    issue.id === issueId
      ? { ...issue, resolved: true, resolvedAt: new Date().toISOString() }
      : issue
  );

  const updatedStu: StudentPortalRecord = {
    ...stu,
    validationIssues: updatedIssues,
    lifecycleStage: updatedIssues.every((i) => i.resolved)
      ? "Externally verified"
      : stu.lifecycleStage,
  };

  studentRecordsStore[idx] = updatedStu;
  return updatedStu;
};
