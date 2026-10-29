import {
  VerificationResult,
  StudentPortalRecord,
} from "@/types/verification";

export const DEMO_VERIFICATION_RECORDS: Record<string, VerificationResult> = {
  // 1. Valid Example
  "VRF-2026-V8892": {
    reference: "VRF-2026-V8892",
    status: "Verified Authentic",
    isValid: true,
    isExpired: false,
    studentName: "Aarav Sharma",
    institutionName: "College of Engineering, Pune (COEP)",
    institutionCode: "1-332901124",
    programmeName: "Computer Science & Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    verificationDate: "2026-10-29T08:35:10Z",
    expiresAt: "2027-10-29T23:59:59Z",
    cryptographicProofHash:
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    issuingAuthority: "AICTE Central Governance & Verification Service",
    verifierRole: "public",
    permittedFields: {
      candidate_name: "Aarav Sharma",
      institution_name: "College of Engineering, Pune (COEP)",
      institution_code: "1-332901124",
      programme_name: "Computer Science & Engineering",
      degree_level: "Undergraduate (B.Tech)",
      academic_year: "2026-27",
      verification_status: "Verified Authentic",
      verified_on: "2026-10-29T08:35:10Z",
    },
    demoDisclaimer:
      "DEMONSTRATION ONLY: Synthetic test record generated for evaluation environment. Does not constitute an official statutory degree verification under Indian Law.",
  },

  // 2. Record Awaiting Review
  "VRF-2026-R4109": {
    reference: "VRF-2026-R4109",
    status: "Awaiting Institutional Review",
    isValid: false,
    isExpired: false,
    studentName: "Priya Patel",
    institutionName: "Delhi Technological University (DTU)",
    institutionCode: "1-882910344",
    programmeName: "Information Technology",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    verificationDate: "2026-10-28T14:20:00Z",
    expiresAt: "2027-10-28T23:59:59Z",
    cryptographicProofHash:
      "4a7d1ed414474e4033ac29ccb8653d9b002c62356c403697dbcb8f862f43714c",
    issuingAuthority: "AICTE Central Governance & Verification Service",
    verifierRole: "public",
    permittedFields: {
      candidate_name: "Priya Patel",
      institution_name: "Delhi Technological University (DTU)",
      institution_code: "1-882910344",
      programme_name: "Information Technology",
      degree_level: "Undergraduate (B.Tech)",
      academic_year: "2026-27",
      verification_status: "Awaiting Institutional Review",
      verified_on: "2026-10-28T14:20:00Z",
    },
    demoDisclaimer:
      "DEMONSTRATION ONLY: Synthetic test record under review. Enrollment documentation pending institutional university confirmation.",
  },

  // 3. Resolved Duplicate Conflict Example
  "VRF-2026-D9901": {
    reference: "VRF-2026-D9901",
    status: "Corrected & Cleared",
    isValid: true,
    isExpired: false,
    studentName: "Rohan Verma",
    institutionName: "College of Engineering, Pune (COEP)",
    institutionCode: "1-332901124",
    programmeName: "Mechanical Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    verificationDate: "2026-10-27T11:15:30Z",
    expiresAt: "2027-10-27T23:59:59Z",
    cryptographicProofHash:
      "6f7c2d1b098192849e71d37a288937ef12b48a1c90471203b8791038e21947ac",
    issuingAuthority: "AICTE Central Governance & Verification Service",
    verifierRole: "public",
    permittedFields: {
      candidate_name: "Rohan Verma",
      institution_name: "College of Engineering, Pune (COEP)",
      institution_code: "1-332901124",
      programme_name: "Mechanical Engineering",
      degree_level: "Undergraduate (B.Tech)",
      academic_year: "2026-27",
      verification_status: "Corrected & Cleared",
      verified_on: "2026-10-27T11:15:30Z",
    },
    demoDisclaimer:
      "DEMONSTRATION ONLY: Synthetic test record previously cleared of dual-counseling token conflict via state DTE certificate.",
  },

  // 4. Invalid / Revoked Record Example
  "VRF-2026-X0012": {
    reference: "VRF-2026-X0012",
    status: "Invalid / Revoked",
    isValid: false,
    isExpired: false,
    studentName: "Sneha Nair",
    institutionName: "Unaccredited Technical Institute",
    institutionCode: "1-000000000",
    programmeName: "Unapproved Computer Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    verificationDate: "2026-10-26T09:00:00Z",
    expiresAt: "2027-10-26T09:00:00Z",
    cryptographicProofHash:
      "8c4e0981f9a2b347109283740192837401928374019283740192837401928374",
    issuingAuthority: "AICTE Central Governance & Verification Service",
    verifierRole: "public",
    permittedFields: {
      candidate_name: "Sneha Nair",
      institution_name: "Unaccredited Technical Institute",
      institution_code: "1-000000000",
      programme_name: "Unapproved Computer Engineering",
      degree_level: "Undergraduate (B.Tech)",
      academic_year: "2026-27",
      verification_status: "Invalid / Revoked",
      verified_on: "2026-10-26T09:00:00Z",
    },
    demoDisclaimer:
      "DEMONSTRATION ONLY: Synthetic invalid test record. Quota breach detected; credential reference revoked by central registry.",
  },

  // 5. Expired Reference Example
  "VRF-2025-EXP99": {
    reference: "VRF-2025-EXP99",
    status: "Expired Reference",
    isValid: false,
    isExpired: true,
    studentName: "Aditya Joshi",
    institutionName: "PSG College of Technology, Coimbatore",
    institutionCode: "1-558291023",
    programmeName: "Electrical & Electronics Engg",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2024-25",
    verificationDate: "2024-10-15T10:00:00Z",
    expiresAt: "2025-10-15T23:59:59Z",
    cryptographicProofHash:
      "99a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef",
    issuingAuthority: "AICTE Central Governance & Verification Service",
    verifierRole: "public",
    permittedFields: {
      candidate_name: "Aditya Joshi",
      institution_name: "PSG College of Technology, Coimbatore",
      institution_code: "1-558291023",
      programme_name: "Electrical & Electronics Engg",
      degree_level: "Undergraduate (B.Tech)",
      academic_year: "2024-25",
      verification_status: "Expired Reference",
      verified_on: "2024-10-15T10:00:00Z",
    },
    demoDisclaimer:
      "DEMONSTRATION ONLY: Synthetic expired test credential reference. Verification window expired; candidate must issue refreshed pass.",
  },
};

export const DEMO_STUDENT_PORTAL_RECORDS: StudentPortalRecord[] = [
  // Student 1: Valid & Verified (Aarav Sharma)
  {
    studentId: "STU-001",
    fullName: "Aarav Sharma",
    maskedApaarId: "98••-••••-9011",
    institutionStudentId: "COEP/2026/CS/042",
    institutionName: "College of Engineering, Pune (COEP)",
    institutionCode: "1-332901124",
    state: "Maharashtra",
    programme: "Computer Science & Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-14",
    enrolmentStatus: "Active Enrolment",
    lifecycleStage: "Externally verified",
    verificationReference: "VRF-2026-V8892",
    verificationStatus: "Verified Authentic",
    credentialExpiresAt: "2027-10-29T23:59:59Z",
    cryptographicHash:
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    validationIssues: [],
    verifierHistory: [
      {
        id: "VH-101",
        verifierOrganization: "Microsoft India Recruiting",
        verifierRole: "employer",
        purpose: "Pre-Employment Academic Screening",
        accessedAt: "2026-10-29T09:12:00Z",
        status: "Verified Authentic",
        fieldsDisclosed: [
          "Candidate Name",
          "Institution",
          "Programme",
          "Degree Status",
          "Conferred Date",
          "SHA-256 Digest",
        ],
      },
      {
        id: "VH-102",
        verifierOrganization: "State Scholarship Board",
        verifierRole: "institution",
        purpose: "National Merit Fee Reimbursement Verification",
        accessedAt: "2026-10-28T16:30:00Z",
        status: "Verified Authentic",
        fieldsDisclosed: [
          "Candidate Name",
          "Institution",
          "Programme",
          "Admission Category",
          "Migration Clearance",
        ],
      },
      {
        id: "VH-103",
        verifierOrganization: "TCS Global HR Background Checks",
        verifierRole: "employer",
        purpose: "Background Verification",
        accessedAt: "2026-10-25T11:05:00Z",
        status: "Verified Authentic",
        fieldsDisclosed: [
          "Candidate Name",
          "Institution",
          "Programme",
          "Verification Status",
        ],
      },
    ],
  },

  // Student 2: Awaiting Review (Priya Patel)
  {
    studentId: "STU-002",
    fullName: "Priya Patel",
    maskedApaarId: "98••-••••-3401",
    institutionStudentId: "DTU/2026/IT/108",
    institutionName: "Delhi Technological University (DTU)",
    institutionCode: "1-882910344",
    state: "Delhi",
    programme: "Information Technology",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-16",
    enrolmentStatus: "Active Enrolment",
    lifecycleStage: "Under review",
    verificationReference: "VRF-2026-R4109",
    verificationStatus: "Awaiting Institutional Review",
    credentialExpiresAt: "2027-10-28T23:59:59Z",
    cryptographicHash:
      "4a7d1ed414474e4033ac29ccb8653d9b002c62356c403697dbcb8f862f43714c",
    validationIssues: [
      {
        id: "ISSUE-DTU-01",
        title: "Inter-University Transfer Certificate Required",
        description:
          "AICTE heuristic engine identified concurrent counseling allotment at DTU and NSUT. Submit formal migration release from State CET Cell.",
        actionLabel: "Upload Transfer Clearance PDF",
        severity: "Critical",
        resolved: false,
      },
      {
        id: "ISSUE-DTU-02",
        title: "DigiLocker Consent Re-authorization",
        description:
          "DigiLocker biometric link authorization expires in 14 days. Re-link via student DigiLocker portal.",
        actionLabel: "Renew DigiLocker Token",
        severity: "Warning",
        resolved: false,
      },
    ],
    verifierHistory: [
      {
        id: "VH-201",
        verifierOrganization: "Goldman Sachs Campus Recruitment",
        verifierRole: "employer",
        purpose: "Internship Offer Credential Review",
        accessedAt: "2026-10-28T14:20:00Z",
        status: "Awaiting Institutional Review",
        fieldsDisclosed: [
          "Candidate Name",
          "Institution",
          "Programme",
          "Verification Status",
        ],
      },
    ],
  },

  // Student 3: Corrected Duplicate (Rohan Verma)
  {
    studentId: "STU-003",
    fullName: "Rohan Verma",
    maskedApaarId: "98••-••••-2044",
    institutionStudentId: "COEP/2026/ME/018",
    institutionName: "College of Engineering, Pune (COEP)",
    institutionCode: "1-332901124",
    state: "Maharashtra",
    programme: "Mechanical Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-10",
    enrolmentStatus: "Active Enrolment",
    lifecycleStage: "Corrected",
    verificationReference: "VRF-2026-D9901",
    verificationStatus: "Corrected & Cleared",
    credentialExpiresAt: "2027-10-27T23:59:59Z",
    cryptographicHash:
      "6f7c2d1b098192849e71d37a288937ef12b48a1c90471203b8791038e21947ac",
    validationIssues: [
      {
        id: "ISSUE-COEP-01",
        title: "Dual Counseling Seat Conflict",
        description:
          "Previously detected roll number collision in State Round 1 reconciled. Maharashtra DTE cancellation certificate accepted.",
        actionLabel: "Resolution Archived",
        severity: "Informational",
        resolved: true,
        resolvedAt: "2026-10-27T11:15:00Z",
      },
    ],
    verifierHistory: [
      {
        id: "VH-301",
        verifierOrganization: "Larsen & Toubro Graduate Engineering Trainee Board",
        verifierRole: "employer",
        purpose: "Joining Eligibility Clearance",
        accessedAt: "2026-10-27T11:15:30Z",
        status: "Corrected & Cleared",
        fieldsDisclosed: [
          "Candidate Name",
          "Institution",
          "Programme",
          "Verification Status",
          "SHA-256 Digest",
        ],
      },
    ],
  },

  // Student 4: Invalid / Revoked (Sneha Nair)
  {
    studentId: "STU-004",
    fullName: "Sneha Nair",
    maskedApaarId: "98••-••••-0000",
    institutionStudentId: "UAI/2026/CS/999",
    institutionName: "Unaccredited Technical Institute",
    institutionCode: "1-000000000",
    state: "Kerala",
    programme: "Unapproved Computer Engineering",
    degreeLevel: "Undergraduate (B.Tech)",
    academicYear: "2026-27",
    admissionDate: "2026-08-01",
    enrolmentStatus: "Revoked / Quota Breach",
    lifecycleStage: "Rejected",
    verificationReference: "VRF-2026-X0012",
    verificationStatus: "Invalid / Revoked",
    credentialExpiresAt: "2027-10-26T09:00:00Z",
    cryptographicHash:
      "8c4e0981f9a2b347109283740192837401928374019283740192837401928374",
    validationIssues: [
      {
        id: "ISSUE-REV-01",
        title: "Statutory Approval Revocation Notice",
        description:
          "Institution admitted candidates exceeding approved AICTE intake ceiling without statutory approval letter (EOA). Student credential reference invalidated.",
        actionLabel: "Contact State Higher Education Grievance Nodal",
        severity: "Critical",
        resolved: false,
      },
    ],
    verifierHistory: [
      {
        id: "VH-401",
        verifierOrganization: "FirstScreen Background Check Services",
        verifierRole: "employer",
        purpose: "Employment Screening",
        accessedAt: "2026-10-26T09:00:00Z",
        status: "Invalid / Revoked",
        fieldsDisclosed: [
          "Candidate Name",
          "Institution",
          "Programme",
          "Verification Status",
        ],
      },
    ],
  },
];
