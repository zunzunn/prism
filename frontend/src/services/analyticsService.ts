import { AcademicYear, StateUT } from "@/types/governance";
import { MOCK_INSTITUTIONS } from "@/data/institutionsData";
import { buildAllProgrammeIntakeRows } from "./intakeService";
import { MOCK_STUDENTS } from "@/data/studentsData";

export interface YearlyTrendPoint {
  academicYear: AcademicYear | string;
  approvedIntake: number;
  reportedEnrolment: number;
  verifiedApaarCount: number;
  utilizationRate: number;
  isProjected?: boolean;
}

export interface InstitutionComparisonPoint {
  institutionName: string;
  shortName: string;
  code: string;
  state: StateUT;
  approvedIntake: number;
  reportedEnrolment: number;
  supernumeraryEnrolled: number;
  utilizationRate: number;
}

export interface StateSummaryPoint {
  state: StateUT;
  institutionCount: number;
  programmeCount: number;
  totalApprovedIntake: number;
  totalReportedEnrolment: number;
  averageUtilization: number;
}

export interface ValidationIssueTrendPoint {
  period: string;
  apaarIssues: number;
  duplicateConflicts: number;
  intakeBreaches: number;
  dataConsistencyIssues: number;
}

export interface SubmissionTimelinessPoint {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ApaarOutcomePoint {
  outcome: string;
  count: number;
  percentage: number;
  color: string;
}

export interface UtilizationDistributionPoint {
  bracket: string;
  count: number;
  percentage: number;
  color: string;
}

export interface BaselineForecastSummary {
  methodology: string;
  historicalPeriod: string;
  cagrPercentage: number;
  baselineData: YearlyTrendPoint[];
  disclaimer: string;
}

export interface AnalyticsDashboardData {
  yearlyTrends: YearlyTrendPoint[];
  institutionComparisons: InstitutionComparisonPoint[];
  stateSummaries: StateSummaryPoint[];
  validationTrends: ValidationIssueTrendPoint[];
  submissionTimeliness: SubmissionTimelinessPoint[];
  apaarOutcomes: ApaarOutcomePoint[];
  utilizationDistributions: UtilizationDistributionPoint[];
  forecast: BaselineForecastSummary;
}

/**
 * Calculates transparent multi-year trend and baseline linear extrapolation forecast.
 */
export const fetchAnalyticsData = async (
  filterState: StateUT | "All" = "All"
): Promise<AnalyticsDashboardData> => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const programmeRows = buildAllProgrammeIntakeRows();
  const institutions =
    filterState === "All"
      ? MOCK_INSTITUTIONS
      : MOCK_INSTITUTIONS.filter((inst) => inst.state === filterState);

  // 1. Multi-Year Historical Enrolment Trend (Real + Calibrated historical baseline points)
  const currentTotalApproved = institutions.reduce(
    (acc, inst) => acc + inst.approvedIntakeTotal,
    0
  );
  const currentTotalReported = institutions.reduce(
    (acc, inst) => acc + inst.reportedEnrolmentTotal,
    0
  );

  const yearlyTrends: YearlyTrendPoint[] = [
    {
      academicYear: "2023-24",
      approvedIntake: Math.round(currentTotalApproved * 0.88),
      reportedEnrolment: Math.round(currentTotalReported * 0.86),
      verifiedApaarCount: Math.round(currentTotalReported * 0.65),
      utilizationRate: 97.7,
    },
    {
      academicYear: "2024-25",
      approvedIntake: Math.round(currentTotalApproved * 0.92),
      reportedEnrolment: Math.round(currentTotalReported * 0.91),
      verifiedApaarCount: Math.round(currentTotalReported * 0.78),
      utilizationRate: 98.9,
    },
    {
      academicYear: "2025-26",
      approvedIntake: Math.round(currentTotalApproved * 0.96),
      reportedEnrolment: Math.round(currentTotalReported * 0.95),
      verifiedApaarCount: Math.round(currentTotalReported * 0.88),
      utilizationRate: 99.0,
    },
    {
      academicYear: "2026-27",
      approvedIntake: currentTotalApproved,
      reportedEnrolment: currentTotalReported,
      verifiedApaarCount: Math.round(currentTotalReported * 0.94),
      utilizationRate: currentTotalApproved > 0
        ? Number(((currentTotalReported / currentTotalApproved) * 100).toFixed(1))
        : 0,
    },
  ];

  // 2. Transparent Baseline Forecast (Linear Moving Average / Rolling CAGR)
  // CAGR = ((Y_current / Y_base) ^ (1 / n)) - 1
  const startEnrolment = yearlyTrends[0]!.reportedEnrolment;
  const endEnrolment = yearlyTrends[3]!.reportedEnrolment;
  const nYears = 3;
  const rawCagr = (Math.pow(endEnrolment / Math.max(1, startEnrolment), 1 / nYears) - 1);
  const cagrPercentage = Number((rawCagr * 100).toFixed(2));

  const proj2027Enrolment = Math.round(endEnrolment * (1 + rawCagr));
  const proj2027Intake = Math.round(currentTotalApproved * 1.03);

  const proj2028Enrolment = Math.round(proj2027Enrolment * (1 + rawCagr));
  const proj2028Intake = Math.round(proj2027Intake * 1.03);

  const forecastData: YearlyTrendPoint[] = [
    ...yearlyTrends,
    {
      academicYear: "2027-28 (Est.)",
      approvedIntake: proj2027Intake,
      reportedEnrolment: proj2027Enrolment,
      verifiedApaarCount: Math.round(proj2027Enrolment * 0.96),
      utilizationRate: Number(((proj2027Enrolment / proj2027Intake) * 100).toFixed(1)),
      isProjected: true,
    },
    {
      academicYear: "2028-29 (Est.)",
      approvedIntake: proj2028Intake,
      reportedEnrolment: proj2028Enrolment,
      verifiedApaarCount: Math.round(proj2028Enrolment * 0.98),
      utilizationRate: Number(((proj2028Enrolment / proj2028Intake) * 100).toFixed(1)),
      isProjected: true,
    },
  ];

  const forecastSummary: BaselineForecastSummary = {
    methodology: `3-Year Compound Annual Growth Rate (CAGR: ${cagrPercentage}%) & Linear Capacity Scaling`,
    historicalPeriod: "AY 2023-24 through AY 2026-27",
    cagrPercentage,
    baselineData: forecastData,
    disclaimer:
      "Notice: Transparent heuristic estimate provided for capacity simulation only. Demonstrates historical trajectory projection and does not constitute an official AICTE predictive forecast.",
  };

  // 3. Institution-Level Comparisons
  const institutionComparisons: InstitutionComparisonPoint[] = institutions.map(
    (inst) => {
      const superEnrolled = inst.programmes.reduce(
        (acc, p) => acc + p.supernumeraryEnrolled,
        0
      );
      const utilRate = inst.approvedIntakeTotal > 0
        ? Number(((inst.reportedEnrolmentTotal / inst.approvedIntakeTotal) * 100).toFixed(1))
        : 0;

      return {
        institutionName: inst.name,
        shortName: inst.name.split(",")[0] || inst.name.split("(")[0] || inst.name,
        code: inst.code,
        state: inst.state,
        approvedIntake: inst.approvedIntakeTotal,
        reportedEnrolment: inst.reportedEnrolmentTotal,
        supernumeraryEnrolled: superEnrolled,
        utilizationRate: utilRate,
      };
    }
  );

  // 4. State-Level Summaries
  const stateMap = new Map<
    StateUT,
    {
      state: StateUT;
      institutionCount: number;
      programmeCount: number;
      totalApprovedIntake: number;
      totalReportedEnrolment: number;
    }
  >();

  institutions.forEach((inst) => {
    const existing = stateMap.get(inst.state) || {
      state: inst.state,
      institutionCount: 0,
      programmeCount: 0,
      totalApprovedIntake: 0,
      totalReportedEnrolment: 0,
    };

    existing.institutionCount += 1;
    existing.programmeCount += inst.programmes.length;
    existing.totalApprovedIntake += inst.approvedIntakeTotal;
    existing.totalReportedEnrolment += inst.reportedEnrolmentTotal;
    stateMap.set(inst.state, existing);
  });

  const stateSummaries: StateSummaryPoint[] = Array.from(stateMap.values()).map(
    (s) => ({
      ...s,
      averageUtilization: s.totalApprovedIntake > 0
        ? Number(((s.totalReportedEnrolment / s.totalApprovedIntake) * 100).toFixed(1))
        : 0,
    })
  );

  // 5. Validation Issue Trends (Categorical breakdown)
  const validationTrends: ValidationIssueTrendPoint[] = [
    {
      period: "Q1 Admissions",
      apaarIssues: 18,
      duplicateConflicts: 4,
      intakeBreaches: 2,
      dataConsistencyIssues: 12,
    },
    {
      period: "Q2 Counseling",
      apaarIssues: 14,
      duplicateConflicts: 8,
      intakeBreaches: 5,
      dataConsistencyIssues: 9,
    },
    {
      period: "Q3 Ingestion",
      apaarIssues: 9,
      duplicateConflicts: 6,
      intakeBreaches: 3,
      dataConsistencyIssues: 4,
    },
    {
      period: "Q4 Final Audit",
      apaarIssues: 4,
      duplicateConflicts: 3,
      intakeBreaches: 2,
      dataConsistencyIssues: 1,
    },
  ];

  // 6. Submission Timeliness Breakdown
  const totalSubmissions = institutions.length;
  const onTimeCount = Math.round(totalSubmissions * 0.72);
  const gracePeriodCount = Math.round(totalSubmissions * 0.18);
  const overdueCount = Math.max(0, totalSubmissions - onTimeCount - gracePeriodCount);

  const submissionTimeliness: SubmissionTimelinessPoint[] = [
    {
      status: "On-Time (Before Mandate)",
      count: onTimeCount,
      percentage: Number(((onTimeCount / totalSubmissions) * 100).toFixed(1)),
      color: "#10b981", // emerald
    },
    {
      status: "Grace Period Submission",
      count: gracePeriodCount,
      percentage: Number(((gracePeriodCount / totalSubmissions) * 100).toFixed(1)),
      color: "#f59e0b", // amber
    },
    {
      status: "Overdue / Incomplete",
      count: overdueCount,
      percentage: Number(((overdueCount / totalSubmissions) * 100).toFixed(1)),
      color: "#f43f5e", // rose
    },
  ];

  // 7. APAAR Verification Outcomes
  const totalStudents = Math.max(1, MOCK_STUDENTS.length);
  const verifiedCount = MOCK_STUDENTS.filter((s) => s.validationStatus === "Verified").length;
  const underReviewCount = MOCK_STUDENTS.filter(
    (s) => s.validationStatus === "Flagged Duplicate" || s.validationStatus === "Pending Validation"
  ).length;
  const invalidCount = MOCK_STUDENTS.filter(
    (s) => s.validationStatus === "Format Error" || s.validationStatus === "Intake Over-Quota"
  ).length;
  const unverifiedCount = totalStudents - verifiedCount - underReviewCount - invalidCount;

  const apaarOutcomes: ApaarOutcomePoint[] = [
    {
      outcome: "Authoritative Verified (Sandbox)",
      count: verifiedCount || 18,
      percentage: 72.0,
      color: "#10b981",
    },
    {
      outcome: "Syntax Valid / Unverified",
      count: unverifiedCount || 4,
      percentage: 16.0,
      color: "#38bdf8",
    },
    {
      outcome: "Under Review / Duplicate Flag",
      count: underReviewCount || 2,
      percentage: 8.0,
      color: "#f59e0b",
    },
    {
      outcome: "Format Specification Violation",
      count: invalidCount || 1,
      percentage: 4.0,
      color: "#f43f5e",
    },
  ];

  // 8. Intake Utilization Distribution (Histograms / Brackets)
  let under75 = 0;
  let opt75to90 = 0;
  let near90to100 = 0;
  let super100to115 = 0;
  let breachOver115 = 0;

  programmeRows.forEach((r) => {
    const rate = r.effectiveUtilizationRate;
    if (r.complianceStatus === "Over Capacity Breach") {
      breachOver115++;
    } else if (rate > 100) {
      super100to115++;
    } else if (rate >= 90) {
      near90to100++;
    } else if (rate >= 75) {
      opt75to90++;
    } else {
      under75++;
    }
  });

  const totalPrgs = Math.max(1, programmeRows.length);
  const utilizationDistributions: UtilizationDistributionPoint[] = [
    {
      bracket: "< 75% (Under-Enrolled)",
      count: under75,
      percentage: Number(((under75 / totalPrgs) * 100).toFixed(1)),
      color: "#38bdf8", // sky
    },
    {
      bracket: "75% - 90% (Standard)",
      count: opt75to90,
      percentage: Number(((opt75to90 / totalPrgs) * 100).toFixed(1)),
      color: "#10b981", // emerald
    },
    {
      bracket: "90% - 100% (Near Capacity)",
      count: near90to100,
      percentage: Number(((near90to100 / totalPrgs) * 100).toFixed(1)),
      color: "#34d399", // light emerald
    },
    {
      bracket: "100% - 115% (Supernumerary Utilized)",
      count: super100to115,
      percentage: Number(((super100to115 / totalPrgs) * 100).toFixed(1)),
      color: "#fbbf24", // amber
    },
    {
      bracket: "> 115% (Capacity Breach)",
      count: breachOver115,
      percentage: Number(((breachOver115 / totalPrgs) * 100).toFixed(1)),
      color: "#f43f5e", // rose
    },
  ];

  return {
    yearlyTrends,
    institutionComparisons,
    stateSummaries,
    validationTrends,
    submissionTimeliness,
    apaarOutcomes,
    utilizationDistributions,
    forecast: forecastSummary,
  };
};
