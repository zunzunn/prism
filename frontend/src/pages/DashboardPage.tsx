import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  AcademicYear,
  StateUT,
  DuplicateAlertRecord,
} from "@/types/governance";
import {
  fetchGovernanceDashboard,
  GovernanceDashboardPayload,
} from "@/services/governanceService";
import { STATE_LIST, ACADEMIC_YEARS } from "@/data/governanceData";
import { GovernanceMetricsGrid } from "@/components/dashboard/GovernanceMetricsGrid";
import { IntakeUtilizationPanel } from "@/components/dashboard/IntakeUtilizationPanel";
import { InstitutionIntakeChart } from "@/components/charts/InstitutionIntakeChart";
import { ValidationHealthChart } from "@/components/charts/ValidationHealthChart";
import { QuickVerificationGlassWidget } from "@/components/dashboard/QuickVerificationGlassWidget";
import { RecentSubmissionsTable } from "@/components/dashboard/RecentSubmissionsTable";
import { DuplicateAlertsTable } from "@/components/dashboard/DuplicateAlertsTable";
import { AuditActivityFeed } from "@/components/dashboard/AuditActivityFeed";
import { DetailDrawer } from "@/components/dashboard/DetailDrawer";
import {
  RefreshCw,
  Sparkles,
  X,
  AlertOctagon,
  FileText,
  Activity,
  Building2,
  Calendar,
  MapPin,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  // Filter States
  const [academicYear, setAcademicYear] = useState<AcademicYear>("2026-27");
  const [selectedState, setSelectedState] = useState<StateUT>("All States / UTs");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [data, setData] = useState<GovernanceDashboardPayload | null>(null);

  // Active Lower Section Tab
  const [activeTab, setActiveTab] = useState<
    "duplicates" | "submissions" | "institutions" | "audit"
  >("duplicates");

  // Detail Drawer State
  const [selectedAlert, setSelectedAlert] = useState<DuplicateAlertRecord | null>(
    null
  );

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetchGovernanceDashboard(academicYear, selectedState);
      setData(res);
    } catch (err) {
      console.error("Failed to load governance dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [academicYear, selectedState]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dismissDemo = () => {
    searchParams.delete("demo");
    setSearchParams(searchParams);
  };

  const handleResolveAlert = (id: string, action: string) => {
    if (!data) return;
    const updatedAlerts = data.duplicateAlerts.filter((a) => a.id !== id);
    setData({
      ...data,
      duplicateAlerts: updatedAlerts,
      stateData: {
        ...data.stateData,
        metrics: {
          ...data.stateData.metrics,
          potentialDuplicateEnrolments: Math.max(
            0,
            data.stateData.metrics.potentialDuplicateEnrolments - 1
          ),
        },
      },
    });
    alert(`Alert ${id} updated: ${action}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Interactive Demonstration Banner when demo=true */}
      {isDemo && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-xs text-emerald-200 backdrop-blur-xl shadow-lg shadow-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              <strong className="font-semibold text-emerald-100">
                Interactive Demo Active:
              </strong>{" "}
              Simulating national AICTE governance node with cross-institutional
              admissions and live duplicate detection.
            </span>
          </div>
          <button
            onClick={dismissDemo}
            aria-label="Dismiss demo banner"
            className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-200 transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AICTE National Academic Governance Dashboard
            </h1>
            <span className="hidden sm:inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300 uppercase">
              Live Hub
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-300 sm:text-sm">
            Real-time APAAR validation, intake monitoring, and duplicate detection
            across approved institutions.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-auto">
          {/* Academic Year Filter */}
          <div className="relative flex items-center">
            <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value as AcademicYear)}
              className="appearance-none rounded-xl border border-white/15 bg-white/[0.04] py-1.5 pl-8 pr-7 text-xs text-zinc-200 transition hover:border-emerald-500/40 focus:border-emerald-500/60 focus:bg-white/[0.08] focus:outline-none backdrop-blur-md"
              aria-label="Filter by Academic Year"
            >
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr} className="bg-[#0b101c] text-zinc-200">
                  AY {yr}
                </option>
              ))}
            </select>
          </div>

          {/* State / UT Filter */}
          <div className="relative flex items-center">
            <MapPin className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value as StateUT)}
              className="appearance-none rounded-xl border border-white/15 bg-white/[0.04] py-1.5 pl-8 pr-7 text-xs text-zinc-200 transition hover:border-emerald-500/40 focus:border-emerald-500/60 focus:bg-white/[0.08] focus:outline-none backdrop-blur-md"
              aria-label="Filter by State or Union Territory"
            >
              {STATE_LIST.map((st) => (
                <option key={st} value={st} className="bg-[#0b101c] text-zinc-200">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={refreshing}
            aria-label="Refresh dashboard metrics"
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white disabled:opacity-50 cursor-pointer backdrop-blur-md"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-emerald-400 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        /* Loading Skeleton */
        <div className="space-y-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 rounded border border-[#1f2838] bg-[#0c1017] px-4 py-2 text-xs text-zinc-300">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
            <span>Synchronizing national academic data lake...</span>
          </div>
        </div>
      ) : data ? (
        <>
          {/* EIGHT METRIC CARDS */}
          <GovernanceMetricsGrid metrics={data.stateData.metrics} />

          {/* WIDE HORIZONTAL PANEL: NATIONAL INTAKE UTILIZATION */}
          <IntakeUtilizationPanel
            data={data.stateData.intakeUtilization}
            selectedState={selectedState}
          />

          {/* RECHARTS VISUALIZATION PANELS */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <InstitutionIntakeChart data={data.stateData.topInstitutions} />
            </div>
            <div>
              <ValidationHealthChart data={data.stateData.validationHealth} />
            </div>
          </div>

          {/* CRYPTOGRAPHIC VERIFICATION GLASS WIDGET */}
          <QuickVerificationGlassWidget />

          {/* LOWER DASHBOARD SECTION (TABBED HIGH-DENSITY AUDIT & ANOMALIES) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-2 gap-3">
              <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab("duplicates")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer backdrop-blur-md ${
                    activeTab === "duplicates"
                      ? "border border-rose-500/40 bg-rose-500/15 text-rose-300 shadow-sm shadow-rose-950/40"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                  <span>Duplicate Enrolments</span>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-400">
                    {data.duplicateAlerts.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("submissions")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer backdrop-blur-md ${
                    activeTab === "submissions"
                      ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-950/40"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Recent Submissions</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                    {data.recentSubmissions.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("institutions")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer backdrop-blur-md ${
                    activeTab === "institutions"
                      ? "border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-950/40"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Institutions Requiring Review</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                    2
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("audit")}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer backdrop-blur-md ${
                    activeTab === "audit"
                      ? "border border-sky-500/40 bg-sky-500/15 text-sky-300 shadow-sm shadow-sky-950/40"
                      : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5 text-sky-400" />
                  <span>Audit Activity</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-zinc-400">
                Last Synced:{" "}
                <span className="text-zinc-200 font-semibold">
                  {new Date(data.refreshedAt).toLocaleTimeString("en-IN")}
                </span>
              </div>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === "duplicates" && (
              <DuplicateAlertsTable
                alerts={data.duplicateAlerts}
                onSelectAlert={(alert) => setSelectedAlert(alert)}
              />
            )}

            {activeTab === "submissions" && (
              <RecentSubmissionsTable submissions={data.recentSubmissions} />
            )}

            {activeTab === "institutions" && (
              <div className="rounded-2xl border border-white/10 bg-[#0c1424]/75 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Technical Institutions Requiring Regulatory Review
                    </h3>
                    <p className="text-xs text-zinc-300">
                      Campuses flagged for potential supernumerary breach or anomalous enrollment surges
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4.5 flex flex-col justify-between backdrop-blur-md">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            Delhi Technological University (DTU)
                          </h4>
                          <span className="font-mono text-[10px] text-zinc-400">
                            Code: 1-882910344 • State: Delhi
                          </span>
                        </div>
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                          Capacity Review
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                        Reported 2,410 enrollments vs 2,400 sanctioned capacity (+10). Nodal officer must submit EWS/TFW supernumerary allotment documentation for reconciliation.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-amber-500/20 pt-2.5">
                      <span className="text-[10px] font-mono text-zinc-400">Status: Notice Sent</span>
                      <Link
                        to="/intake"
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        Inspect Quota Breakup →
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4.5 flex flex-col justify-between backdrop-blur-md">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            Institute of Engineering & Tech, Lucknow
                          </h4>
                          <span className="font-mono text-[10px] text-zinc-400">
                            Code: 1-772910291 • State: Uttar Pradesh
                          </span>
                        </div>
                        <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-300">
                          APAAR Parity Gap
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                        Batch AICTE-2026-B8925 contains 25 unverified student identity records failing national format hash match. Manual nodal endorsement pending.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-rose-500/20 pt-2.5">
                      <span className="text-[10px] font-mono text-zinc-400">Status: Hold Placed</span>
                      <Link
                        to="/validation"
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        Review Batch Records →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "audit" && (
              <AuditActivityFeed activities={data.auditActivity} />
            )}
          </div>
        </>
      ) : null}

      {/* DETAIL DRAWER FOR ANOMALY INSPECTION */}
      <DetailDrawer
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onResolve={handleResolveAlert}
      />
    </div>
  );
};

export default DashboardPage;
