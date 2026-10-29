export type VerifierRole = "public" | "employer" | "institution";

export type VerificationStatus =
  | "Verified Authentic"
  | "Awaiting Institutional Review"
  | "Corrected & Cleared"
  | "Invalid / Revoked"
  | "Expired Reference";

export type StudentLifecycleStage =
  | "Institution-submitted"
  | "Format-validated"
  | "Externally verified"
  | "Under review"
  | "Rejected"
  | "Corrected";

export interface VerificationResult {
  reference: string;
  status: VerificationStatus;
  isValid: boolean;
  isExpired: boolean;
  studentName: string;
  institutionName: string;
  institutionCode: string;
  programmeName: string;
  degreeLevel: string;
  academicYear: string;
  verificationDate: string;
  expiresAt?: string;
  cryptographicProofHash: string;
  issuingAuthority: string;
  verifierRole: VerifierRole;
  permittedFields: Record<string, any>;
  demoDisclaimer: string;
}

export interface VerificationReceipt {
  receiptId: string;
  reference: string;
  status: VerificationStatus;
  studentName: string;
  institutionName: string;
  programmeName: string;
  degreeLevel: string;
  academicYear: string;
  verifiedAt: string;
  issuedBy: string;
  digitalSignatureHash: string;
  verificationUrl: string;
  disclaimer: string;
}

export interface VerificationAuditEntry {
  id: string;
  reference: string;
  verifierRole: string;
  verifierOrganization: string;
  purpose: string;
  status: string;
  accessedAt: string;
  ipAddressHash: string;
}

export interface StudentCorrectionIssue {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  severity: "Critical" | "Warning" | "Informational";
  resolved: boolean;
  resolvedAt?: string;
}

export interface StudentVerifierHistoryItem {
  id: string;
  verifierOrganization: string;
  verifierRole: VerifierRole;
  purpose: string;
  accessedAt: string;
  status: string;
  fieldsDisclosed: string[];
}

export interface StudentPortalRecord {
  studentId: string;
  fullName: string;
  maskedApaarId: string; // e.g., "98••-••••-9011"
  institutionStudentId: string;
  institutionName: string;
  institutionCode: string;
  state: string;
  programme: string;
  degreeLevel: string;
  academicYear: string;
  admissionDate: string;
  enrolmentStatus: string;
  lifecycleStage: StudentLifecycleStage;
  verificationReference: string;
  verificationStatus: VerificationStatus;
  credentialExpiresAt: string;
  cryptographicHash: string;
  validationIssues: StudentCorrectionIssue[];
  verifierHistory: StudentVerifierHistoryItem[];
}
