import {
  ProgrammeIntakeRow,
  IntakeOverviewMetrics,
  IntakeFilterParams,
  IntakeUtilizationResult,
  IntakeComplianceStatus,
  SupernumeraryBreakdown,
} from "@/types/intake";
import { IntakePolicyRule } from "@/types/validation";
import { MOCK_INSTITUTIONS } from "@/data/institutionsData";
import { MOCK_INTAKE_POLICIES } from "@/data/validationData";
import { MOCK_STUDENTS } from "@/data/studentsData";

/**
 * Centralized calculation service for academic intake monitoring.
 * Ensures transparent denominators, supernumerary quota adjustments,
 * and deterministic review flagging when policy parameters are missing.
 */

/**
 * Calculates utilization and compliance status using an explicitly defined denominator.
 *
 * Denominator Definition:
 * - When policy is available: Denominator = Base Approved Intake + Permitted Supernumerary Quotas (EWS 10% + TFW 5% + PMSSS/Other).
 * - When policy is missing: Returns "Requires Review" rather than assuming an unauthorized breach.
 */
export const calculateProgrammeUtilization = (
  reportedEnrolment: number,
  baseApprovedIntake: number,
  policy?: IntakePolicyRule
): IntakeUtilizationResult => {
  // Safe zero-handling for denominator
  const safeBase = Math.max(1, baseApprovedIntake);

  // If policy rule is missing, return "Requires Review"
  if (!policy || !policy.isPolicyRuleActive) {
    const regularRate = Number(((reportedEnrolment / safeBase) * 100).toFixed(1));
    return {
      baseApprovedIntake,
      totalPermissibleCapacity: baseApprovedIntake,
      reportedEnrolment,
      regularUtilizationRate: regularRate,
      effectiveUtilizationRate: regularRate,
      remainingCapacity: Math.max(0, baseApprovedIntake - reportedEnrolment),
      complianceStatus: "Requires Review",
      statusReason:
        "Approval Process Handbook (APH) policy or supernumerary allocation data unconfigured in registry; capacity cannot be determined.",
      isPolicyMissing: true,
    };
  }

  // Permitted Supernumerary Sum
  const totalSupernumerary =
    policy.permittedEwsQuota +
    policy.permittedTfwQuota +
    policy.permittedSupernumeraryOther;

  const totalPermissibleCapacity = policy.baseApprovedIntake + totalSupernumerary;
  const safeTotalCapacity = Math.max(1, totalPermissibleCapacity);

  const regularRate = Number(((reportedEnrolment / safeBase) * 100).toFixed(1));
  const effectiveRate = Number(
    ((reportedEnrolment / safeTotalCapacity) * 100).toFixed(1)
  );
  const remainingCapacity = Math.max(0, totalPermissibleCapacity - reportedEnrolment);

  let complianceStatus: IntakeComplianceStatus = "Compliant";
  let statusReason = "Enrolment within approved sanctioned capacity.";

  if (reportedEnrolment > totalPermissibleCapacity) {
    const excess = reportedEnrolment - totalPermissibleCapacity;
    complianceStatus = "Over Capacity Breach";
    statusReason = `Reported enrolment (${reportedEnrolment}) exceeds total permissible capacity (${totalPermissibleCapacity}) by ${excess} seats.`;
  } else if (reportedEnrolment > baseApprovedIntake) {
    complianceStatus = "Compliant";
    statusReason = `Admissions exceed base intake (${baseApprovedIntake}) but remain within approved supernumerary quota (max ${totalPermissibleCapacity}).`;
  } else if (effectiveRate >= 95) {
    complianceStatus = "Near Capacity";
    statusReason = `Programme has reached ${effectiveRate}% of permissible capacity (${remainingCapacity} seats remaining).`;
  } else if (effectiveRate < 75) {
    complianceStatus = "Under Capacity";
    statusReason = `Enrolment is below optimal threshold (${effectiveRate}% utilization).`;
  }

  return {
    baseApprovedIntake: policy.baseApprovedIntake,
    totalPermissibleCapacity,
    reportedEnrolment,
    regularUtilizationRate: regularRate,
    effectiveUtilizationRate: effectiveRate,
    remainingCapacity,
    complianceStatus,
    statusReason,
    isPolicyMissing: false,
  };
};

/**
 * Builds all monitored programme rows across approved institutions.
 */
export const buildAllProgrammeIntakeRows = (): ProgrammeIntakeRow[] => {
  const rows: ProgrammeIntakeRow[] = [];

  MOCK_INSTITUTIONS.forEach((inst) => {
    inst.programmes.forEach((prg) => {
      // Find configured policy for this programme
      const policy = MOCK_INTAKE_POLICIES.find(
        (p) =>
          p.institutionCode === inst.code &&
          p.programmeName.toLowerCase().trim() ===
            prg.programmeName.toLowerCase().trim()
      );

      const util = calculateProgrammeUtilization(
        prg.reportedEnrolment,
        prg.approvedIntake,
        policy
      );

      const supernumerary: SupernumeraryBreakdown = {
        ews10Percent: policy ? policy.permittedEwsQuota : Math.round(prg.approvedIntake * 0.1),
        tfw5Percent: policy ? policy.permittedTfwQuota : Math.round(prg.approvedIntake * 0.05),
        pmsss: policy ? policy.permittedSupernumeraryOther : prg.supernumeraryApproved > 0 ? 3 : 0,
        nriPio: prg.degreeLevel.includes("Undergraduate") ? 5 : 0,
        otherApproved: 0,
        totalSupernumeraryApproved: policy
          ? policy.permittedEwsQuota +
            policy.permittedTfwQuota +
            policy.permittedSupernumeraryOther
          : prg.supernumeraryApproved,
        totalSupernumeraryEnrolled: prg.supernumeraryEnrolled,
      };

      rows.push({
        id: prg.id,
        institutionCode: inst.code,
        institutionName: inst.name,
        state: inst.state,
        programmeName: prg.programmeName,
        degreeLevel: prg.degreeLevel,
        academicYear: policy ? policy.academicYear : "2026-27",
        baseApprovedIntake: prg.approvedIntake,
        reportedEnrolment: prg.reportedEnrolment,
        supernumerary,
        totalPermissibleCapacity: util.totalPermissibleCapacity,
        regularUtilizationRate: util.regularUtilizationRate,
        effectiveUtilizationRate: util.effectiveUtilizationRate,
        remainingCapacity: util.remainingCapacity,
        complianceStatus: util.complianceStatus,
        statusReason: util.statusReason,
        isPolicyMissing: util.isPolicyMissing,
        approvalLetterRef: `AICTE/APH/2026-27/${inst.code.slice(-4)}/${prg.id}`,
        lastUpdated: inst.lastSubmissionDate,
      });
    });
  });

  return rows;
};

export interface PaginatedIntakeResult {
  rows: ProgrammeIntakeRow[];
  metrics: IntakeOverviewMetrics;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Fetches filtered intake monitoring data with dynamic KPI aggregation.
 */
export const fetchIntakeMonitoringData = async (
  params: IntakeFilterParams = {}
): Promise<PaginatedIntakeResult> => {
  await new Promise((resolve) => setTimeout(resolve, 120));

  const allRows = buildAllProgrammeIntakeRows();
  let filtered = [...allRows];

  // Search filter
  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.programmeName.toLowerCase().includes(q) ||
        r.institutionName.toLowerCase().includes(q) ||
        r.institutionCode.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }

  // Academic Year filter
  if (params.academicYear && params.academicYear !== "All") {
    filtered = filtered.filter((r) => r.academicYear === params.academicYear);
  }

  // State filter
  if (params.state && params.state !== "All") {
    filtered = filtered.filter((r) => r.state === params.state);
  }

  // Institution filter
  if (params.institutionCode && params.institutionCode !== "All") {
    filtered = filtered.filter((r) => r.institutionCode === params.institutionCode);
  }

  // Programme name filter
  if (params.programmeName && params.programmeName !== "All") {
    filtered = filtered.filter((r) => r.programmeName === params.programmeName);
  }

  // Compliance status filter
  if (params.complianceStatus && params.complianceStatus !== "All") {
    filtered = filtered.filter((r) => r.complianceStatus === params.complianceStatus);
  }

  // Compute aggregated overview metrics across filtered dataset
  const totalApprovedIntake = filtered.reduce((acc, r) => acc + r.baseApprovedIntake, 0);
  const totalReportedEnrolment = filtered.reduce((acc, r) => acc + r.reportedEnrolment, 0);
  const totalSuperApproved = filtered.reduce(
    (acc, r) => acc + r.supernumerary.totalSupernumeraryApproved,
    0
  );
  const totalSuperEnrolled = filtered.reduce(
    (acc, r) => acc + r.supernumerary.totalSupernumeraryEnrolled,
    0
  );
  const totalRemaining = filtered.reduce((acc, r) => acc + r.remainingCapacity, 0);
  const overallRegularRate = totalApprovedIntake > 0
    ? Number(((totalReportedEnrolment / totalApprovedIntake) * 100).toFixed(1))
    : 0;

  // Count distinct institutions requiring review
  const instReviewSet = new Set<string>();
  filtered.forEach((r) => {
    if (r.complianceStatus === "Requires Review") {
      instReviewSet.add(r.institutionCode);
    }
  });

  const programmesWithViolationsCount = filtered.filter(
    (r) => r.complianceStatus === "Over Capacity Breach"
  ).length;

  const metrics: IntakeOverviewMetrics = {
    totalApprovedIntake,
    totalReportedEnrolment,
    overallRegularUtilizationRate: overallRegularRate,
    totalSupernumeraryApproved: totalSuperApproved,
    totalSupernumeraryEnrolled: totalSuperEnrolled,
    totalRemainingCapacity: totalRemaining,
    institutionsRequiringReviewCount: instReviewSet.size,
    programmesWithViolationsCount,
    totalProgrammesMonitored: filtered.length,
  };

  // Pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    rows: paginated,
    metrics,
    total,
    page,
    pageSize,
    totalPages,
  };
};

/**
 * Fetches single programme detail for deep drill-down.
 */
export const fetchProgrammeIntakeDetail = async (
  programmeId: string
): Promise<{
  row: ProgrammeIntakeRow | null;
  enrolledStudentsCount: number;
  sampleStudents: Array<{ id: string; name: string; apaarId: string; category: string }>;
}> => {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const allRows = buildAllProgrammeIntakeRows();
  const row = allRows.find((r) => r.id === programmeId) || null;

  if (!row) {
    return { row: null, enrolledStudentsCount: 0, sampleStudents: [] };
  }

  // Match sample students from MOCK_STUDENTS
  const matchingStudents = MOCK_STUDENTS.filter(
    (s) =>
      s.institutionCode === row.institutionCode &&
      s.programme.toLowerCase().includes(row.programmeName.toLowerCase())
  ).map((s) => ({
    id: s.id,
    name: s.fullName,
    apaarId: s.apaarId,
    category: s.admissionCategory,
  }));

  return {
    row,
    enrolledStudentsCount: row.reportedEnrolment,
    sampleStudents: matchingStudents,
  };
};
