import {
  AcademicYear,
  StateUT,
  RecentSubmissionRecord,
  DuplicateAlertRecord,
  AuditActivityRecord,
} from "../types/governance";
import {
  DashboardStateData,
  GOVERNANCE_STATE_DATA,
  RECENT_SUBMISSIONS_DATA,
  DUPLICATE_ALERTS_DATA,
  AUDIT_ACTIVITY_DATA,
} from "../data/governanceData";

export interface GovernanceDashboardPayload {
  stateData: DashboardStateData;
  recentSubmissions: RecentSubmissionRecord[];
  duplicateAlerts: DuplicateAlertRecord[];
  auditActivity: AuditActivityRecord[];
  activeFilters: {
    academicYear: AcademicYear;
    state: StateUT;
  };
  refreshedAt: string;
}

export const fetchGovernanceDashboard = async (
  academicYear: AcademicYear = "2026-27",
  state: StateUT = "All States / UTs"
): Promise<GovernanceDashboardPayload> => {
  // Simulate network latency (200ms) for realistic loading state
  await new Promise((resolve) => setTimeout(resolve, 200));

  // In the future, this can invoke:
  // const resp = await apiClient.get(`/api/governance/dashboard?year=${academicYear}&state=${state}`);
  // return resp.data;

  // Retrieve state data or fallback to national dataset
  const baseData =
    GOVERNANCE_STATE_DATA[state] || GOVERNANCE_STATE_DATA["All States / UTs"];

  // Filter submissions by state if selected
  const filteredSubmissions =
    state === "All States / UTs"
      ? RECENT_SUBMISSIONS_DATA
      : RECENT_SUBMISSIONS_DATA.filter((sub) => sub.state === state);

  // Filter duplicate alerts by state if selected
  const filteredAlerts =
    state === "All States / UTs"
      ? DUPLICATE_ALERTS_DATA
      : DUPLICATE_ALERTS_DATA.filter((alt) => alt.state === state);

  return {
    stateData: baseData,
    recentSubmissions:
      filteredSubmissions.length > 0 ? filteredSubmissions : RECENT_SUBMISSIONS_DATA,
    duplicateAlerts:
      filteredAlerts.length > 0 ? filteredAlerts : DUPLICATE_ALERTS_DATA,
    auditActivity: AUDIT_ACTIVITY_DATA,
    activeFilters: {
      academicYear,
      state,
    },
    refreshedAt: new Date().toISOString(),
  };
};
