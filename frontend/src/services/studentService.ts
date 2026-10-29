import {
  StudentRecordDetail,
  StudentFilterParams,
  CsvImportSummary,
  CsvRowValidationResult,
} from "../types/students";
import { MOCK_STUDENTS } from "../data/studentsData";

export interface PaginatedStudentsResult {
  students: StudentRecordDetail[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const maskApaarId = (apaar: string): string => {
  if (!apaar) return "••••-••••-••••";
  const cleaned = apaar.replace(/\s+/g, "");
  // Keep first 2 and last 4 characters, mask middle
  if (cleaned.length >= 10) {
    const parts = cleaned.split("-");
    if (parts.length === 3 && parts[0] && parts[2]) {
      return `${parts[0].slice(0, 2)}••-••••-${parts[2]}`;
    }
    return `${cleaned.slice(0, 2)}••••••${cleaned.slice(-4)}`;
  }
  return "••••-••••-••••";
};

export const fetchStudents = async (
  params: StudentFilterParams = {}
): Promise<PaginatedStudentsResult> => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  let filtered = [...MOCK_STUDENTS];

  // Search filter
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.institutionStudentId.toLowerCase().includes(q) ||
        s.institutionName.toLowerCase().includes(q) ||
        s.apaarId.includes(q)
    );
  }

  // Academic year filter
  if (params.academicYear && params.academicYear !== "All") {
    filtered = filtered.filter((s) => s.academicYear === params.academicYear);
  }

  // Institution code or alias filter
  if (params.institutionCode && params.institutionCode !== "All") {
    const instQuery = params.institutionCode.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.institutionCode.toLowerCase().includes(instQuery) ||
        s.institutionName.toLowerCase().includes(instQuery)
    );
  }

  // Category filter
  if (params.admissionCategory && params.admissionCategory !== "All") {
    filtered = filtered.filter((s) => s.admissionCategory === params.admissionCategory);
  }

  // Validation status filter
  if (params.validationStatus && params.validationStatus !== "All") {
    filtered = filtered.filter((s) => s.validationStatus === params.validationStatus);
  }

  // Sorting
  const sortBy = params.sortBy || "fullName";
  const sortOrder = params.sortOrder || "asc";
  filtered.sort((a, b) => {
    let comp = 0;
    if (sortBy === "fullName") {
      comp = a.fullName.localeCompare(b.fullName);
    } else if (sortBy === "admissionDate") {
      comp = a.admissionDate.localeCompare(b.admissionDate);
    } else if (sortBy === "institutionName") {
      comp = a.institutionName.localeCompare(b.institutionName);
    } else if (sortBy === "validationStatus") {
      comp = a.validationStatus.localeCompare(b.validationStatus);
    }
    return sortOrder === "asc" ? comp : -comp;
  });

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    students: paginated,
    total,
    page,
    pageSize,
    totalPages,
  };
};

export const fetchStudentById = async (
  idOrApaar: string
): Promise<StudentRecordDetail | null> => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const found = MOCK_STUDENTS.find(
    (s) => s.id === idOrApaar || s.apaarId === idOrApaar
  );
  return found || null;
};

import { apiClient } from "./api";

// Append newly imported students into in-memory store so UI updates immediately
export const addImportedStudents = (newStudents: StudentRecordDetail[]) => {
  MOCK_STUDENTS.unshift(...newStudents);
};

export const ingestValidRowsToRegistry = (
  validRows: CsvRowValidationResult[],
  institutionCode: string = "1-332901124",
  institutionName: string = "College of Engineering, Pune (COEP)"
): StudentRecordDetail[] => {
  const newRecords: StudentRecordDetail[] = validRows.map((r, idx) => {
    const rawApaar = r.data["apaar_id"] || `98234412${String(idx + 100).padStart(4, "0")}`;
    const cleanedApaar = rawApaar.replace(/[-\s]/g, "");
    const formattedApaar =
      cleanedApaar.length === 12
        ? `${cleanedApaar.slice(0, 4)}-${cleanedApaar.slice(4, 8)}-${cleanedApaar.slice(8)}`
        : rawApaar;

    return {
      id: `STU-IMP-${Date.now()}-${idx + 1}`,
      apaarId: formattedApaar,
      institutionStudentId: r.data["student_id"] || `COEP/2026/CS/${idx + 101}`,
      fullName: r.data["full_name"] || "Enrolled Student",
      institutionCode,
      institutionName,
      state: "Maharashtra",
      programme: r.data["programme"] || "Computer Science & Engineering",
      degreeLevel: "Undergraduate (B.Tech)",
      academicYear: (r.data["academic_year"] as any) || "2026-27",
      admissionDate: new Date().toISOString().split("T")[0] || "2026-08-15",
      approvedIntakeReference: "AICTE/INTK/2026/CS-240",
      admissionCategory: (r.data["admission_category"] as any) || "General / Open",
      supernumeraryCategory: "None",
      isNri: false,
      isOci: false,
      isForeignNational: false,
      enrolmentStatus: "Active Enrolment",
      validationStatus: r.status === "Warning" ? "Pending Validation" : "Verified",
      lastUpdated: new Date().toISOString(),
      integrityHash: `sha256-${Math.random().toString(36).substring(2, 15)}`,
      auditTrail: [
        {
          event: "Batch CSV Ingestion",
          timestamp: new Date().toISOString(),
          actor: "Institution Admin (COEP)",
        },
        {
          event: "APAAR Format Validation Passed",
          timestamp: new Date().toISOString(),
          actor: "AICTE Deterministic Validation Engine",
        },
      ],
    };
  });

  addImportedStudents(newRecords);
  return newRecords;
};

/**
 * Uploads student CSV file to backend API (/api/students/upload),
 * with automatic fallback to client-side validation if backend is offline.
 */
export const uploadStudentCsvToServer = async (
  file: File,
  parsedHeaders: string[],
  parsedRows: Record<string, string>[],
  institutionCode: string = "1-332901124"
): Promise<CsvImportSummary> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("institution_code", institutionCode);

  try {
    const response = await apiClient.post("/api/students/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 8000,
    });

    const data = response.data;
    const summary: CsvImportSummary = {
      fileName: data.file_name,
      totalRows: data.total_rows,
      validRowsCount: data.valid_rows_count,
      warningRowsCount: data.warning_rows_count,
      rejectedRowsCount: data.rejected_rows_count,
      columnMappingIssues: data.column_mapping_issues || [],
      batchReference: data.batch_reference,
      sourceEngine: "AICTE Server-Side Ingestion Engine v2.4 (FastAPI)",
      rowResults: (data.row_results || []).map((r: any) => ({
        rowNumber: r.row_number,
        data: r.data || {},
        status: r.status,
        errors: r.errors || [],
        warnings: r.warnings || [],
      })),
    };

    // If valid rows exist, ingest them into in-memory registry
    const validRows = summary.rowResults.filter((r) => r.status === "Valid" || r.status === "Warning");
    if (validRows.length > 0) {
      ingestValidRowsToRegistry(validRows, institutionCode);
    }

    return summary;
  } catch (err) {
    console.warn("Backend CSV upload failed or offline. Using local deterministic fallback.", err);
    // Offline local fallback
    const fallbackSummary = validateParsedCsvRows(parsedHeaders, parsedRows, file.name);
    fallbackSummary.sourceEngine = "Local Deterministic Fallback Engine (Demo Mode)";
    fallbackSummary.batchReference = `BATCH-LOCAL-${Date.now().toString(36).toUpperCase()}`;

    const validRows = fallbackSummary.rowResults.filter((r) => r.status === "Valid" || r.status === "Warning");
    if (validRows.length > 0) {
      ingestValidRowsToRegistry(validRows, institutionCode);
    }

    return fallbackSummary;
  }
};

// Client-side CSV Schema Validator
export const validateParsedCsvRows = (
  headers: string[],
  rows: Record<string, string>[],
  fileName: string
): CsvImportSummary => {
  const requiredHeaders = ["apaar_id", "student_id", "full_name", "programme", "academic_year"];
  const missingHeaders = requiredHeaders.filter(
    (req) => !headers.map((h) => h.toLowerCase().trim()).includes(req)
  );

  const rowResults: CsvRowValidationResult[] = [];
  let validCount = 0;
  let warningCount = 0;
  let rejectedCount = 0;

  rows.forEach((row, index) => {
    const rowNum = index + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    const apaar = row["apaar_id"]?.trim() || "";
    const studentId = row["student_id"]?.trim() || "";
    const name = row["full_name"]?.trim() || "";
    const programme = row["programme"]?.trim() || "";
    const category = row["admission_category"]?.trim() || "";

    // APAAR Format validation: Must be 12 digits or formatted with hyphens
    const cleanApaar = apaar.replace(/[-\s]/g, "");
    if (!apaar) {
      errors.push("Missing required APAAR ID");
    } else if (cleanApaar.length !== 12 || !/^\d+$/.test(cleanApaar)) {
      errors.push(`Invalid APAAR format: Expected 12 digits, received '${apaar}'`);
    }

    if (!studentId) {
      errors.push("Missing institutional student ID / Roll No");
    }

    if (!name) {
      errors.push("Missing student full name");
    }

    if (!programme) {
      errors.push("Missing academic programme");
    }

    // Warnings
    if (category && !["General", "OBC", "SC", "ST", "EWS"].includes(category)) {
      warnings.push(`Non-standard category '${category}', will default to Open quota`);
    }

    let status: "Valid" | "Warning" | "Rejected" = "Valid";
    if (errors.length > 0) {
      status = "Rejected";
      rejectedCount++;
    } else if (warnings.length > 0) {
      status = "Warning";
      warningCount++;
    } else {
      validCount++;
    }

    rowResults.push({
      rowNumber: rowNum,
      data: row,
      status,
      errors,
      warnings,
    });
  });

  return {
    fileName,
    totalRows: rows.length,
    validRowsCount: validCount,
    warningRowsCount: warningCount,
    rejectedRowsCount: rejectedCount,
    columnMappingIssues: missingHeaders,
    rowResults,
  };
};
