import {
  ValidationFinding,
  ValidationMetrics,
  ValidationFilterParams,
  FindingReviewStatus,
  ValidationAuditEvent,
} from "@/types/validation";
import {
  INITIAL_VALIDATION_FINDINGS,
  INITIAL_VALIDATION_METRICS,
} from "@/data/validationData";

// In-memory store initialized with deterministic findings
let findingsStore: ValidationFinding[] = [...INITIAL_VALIDATION_FINDINGS];

export interface PaginatedFindingsResult {
  findings: ValidationFinding[];
  metrics: ValidationMetrics;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const fetchValidationDashboard = async (
  params: ValidationFilterParams = {}
): Promise<PaginatedFindingsResult> => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  let filtered = [...findingsStore];

  // Search filter
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (f) =>
        f.ruleName.toLowerCase().includes(q) ||
        f.ruleId.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q) ||
        f.institutionName.toLowerCase().includes(q) ||
        f.affectedRecordReferences.some((ref) => ref.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (params.category && params.category !== "All") {
    filtered = filtered.filter((f) => f.category === params.category);
  }

  // Severity filter
  if (params.severity && params.severity !== "All") {
    filtered = filtered.filter((f) => f.severity === params.severity);
  }

  // Review status filter
  if (params.reviewStatus && params.reviewStatus !== "All") {
    filtered = filtered.filter((f) => f.reviewStatus === params.reviewStatus);
  }

  // Academic year filter
  if (params.academicYear && params.academicYear !== "All") {
    filtered = filtered.filter((f) => f.academicYear === params.academicYear);
  }

  // Institution code filter
  if (params.institutionCode && params.institutionCode !== "All") {
    filtered = filtered.filter((f) => f.institutionCode === params.institutionCode);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  // Recalculate dynamic metrics
  const activeCritical = findingsStore.filter((f) => f.severity === "Critical" && f.reviewStatus !== "Resolved" && f.reviewStatus !== "Dismissed False Positive").length;
  const activeDuplicates = findingsStore.filter((f) => f.category === "Duplicate Detection" && f.reviewStatus !== "Resolved" && f.reviewStatus !== "Dismissed False Positive").length;
  const activeIntake = findingsStore.filter((f) => f.category === "Intake Validation" && f.reviewStatus !== "Resolved" && f.reviewStatus !== "Dismissed False Positive").length;
  const activeReviews = findingsStore.filter((f) => f.reviewStatus === "Open" || f.reviewStatus === "Under Review" || f.reviewStatus === "Explanation Requested").length;

  const metrics: ValidationMetrics = {
    totalRecordsEvaluated: INITIAL_VALIDATION_METRICS.totalRecordsEvaluated,
    validRecords: Math.max(0, INITIAL_VALIDATION_METRICS.totalRecordsEvaluated - activeCritical),
    invalidRecords: activeCritical,
    recordsRequiringReview: activeReviews,
    potentialDuplicateEnrolments: activeDuplicates,
    intakeComplianceAlerts: activeIntake,
  };

  return {
    findings: paginated,
    metrics,
    total,
    page,
    pageSize,
    totalPages,
  };
};

export const fetchFindingById = async (
  id: string
): Promise<ValidationFinding | null> => {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const found = findingsStore.find((f) => f.id === id);
  return found || null;
};

/**
 * Updates review status and records an immutable audit event.
 * Silent deletion of findings is strictly prohibited.
 */
export const updateFindingStatus = async (
  findingId: string,
  newStatus: FindingReviewStatus,
  reason: string,
  actor: string = "AICTE Compliance Officer"
): Promise<ValidationFinding> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const findingIndex = findingsStore.findIndex((f) => f.id === findingId);
  if (findingIndex === -1) {
    throw new Error(`Finding ${findingId} not found`);
  }

  const finding = findingsStore[findingIndex]!;
  const prevStatus = finding.reviewStatus;
  const now = new Date().toISOString();

  const auditEvent: ValidationAuditEvent = {
    id: `AUD-${Date.now()}`,
    findingId,
    actor,
    action: `Status Updated to ${newStatus}`,
    previousStatus: prevStatus,
    newStatus,
    reason: reason.trim() || "Administrative status transition",
    timestamp: now,
  };

  const updatedFinding: ValidationFinding = {
    ...finding,
    reviewStatus: newStatus,
    updatedAt: now,
    auditTrail: [auditEvent, ...finding.auditTrail],
  };

  if (newStatus === "Dismissed False Positive") {
    updatedFinding.dismissalReason = reason;
  } else if (newStatus === "Resolved") {
    updatedFinding.resolutionNotes = reason;
  }

  findingsStore[findingIndex] = updatedFinding;
  return updatedFinding;
};
