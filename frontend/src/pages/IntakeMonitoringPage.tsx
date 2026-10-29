import React, { useState, useEffect, useCallback } from "react";
import {
  ProgrammeIntakeRow,
  IntakeOverviewMetrics,
  IntakeComplianceStatus,
} from "@/types/intake";
import { AcademicYear, StateUT } from "@/types/governance";
import { ACADEMIC_YEARS, STATE_LIST } from "@/data/governanceData";
import { MOCK_INSTITUTIONS } from "@/data/institutionsData";
import { fetchIntakeMonitoringData } from "@/services/intakeService";
import { IntakeMetricsGrid } from "@/components/intake/IntakeMetricsGrid";
import { IntakeTable } from "@/components/intake/IntakeTable";
import { ProgrammeDetailModal } from "@/components/intake/ProgrammeDetailModal";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const IntakeMonitoringPage: React.FC = () => {
  const [rows, setRows] = useState<ProgrammeIntakeRow[]>([]);
  const [metrics, setMetrics] = useState<IntakeOverviewMetrics | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState<AcademicYear | "All">("All");
  const [state, setState] = useState<StateUT | "All">("All");
  const [institutionCode, setInstitutionCode] = useState<string | "All">("All");
  const [complianceStatus, setComplianceStatus] = useState<
    IntakeComplianceStatus | "All"
  >("All");

  // Active Inspect Modal
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(
    null
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchIntakeMonitoringData({
        search,
        academicYear,
        state,
        institutionCode,
        complianceStatus,
        page,
        pageSize,
      });
      setRows(res.rows);
      setMetrics(res.metrics);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to load intake monitoring data:", err);
    } finally {
      setLoading(false);
    }
  }, [search, academicYear, state, institutionCode, complianceStatus, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Approved Intake & Capacity Monitoring
            </h1>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              APH 2026-27 Compliant
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Real-time enrollment tracking against regular sanctioned intake and supernumerary quotas (EWS, TFW, PMSSS).
          </p>
        </div>

        <button
          onClick={loadData}
          aria-label="Re-calculate capacity allocations"
          className="flex items-center gap-1.5 self-start rounded border border-[#1e2738] bg-[#0c1017] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-[#2b374e] hover:bg-[#121926] hover:text-white"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`}
          />
          <span>Recalculate Ledgers</span>
        </button>
      </div>

      {/* METRICS GRID */}
      {metrics && <IntakeMetricsGrid metrics={metrics} />}

      {/* FILTER TOOLBAR */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search branch, degree level, or institution..."
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 pr-3 pl-8.5 font-mono text-xs text-zinc-200 placeholder-zinc-400 transition focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value as AcademicYear | "All");
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by Academic Year"
            >
              <option value="All">All Academic Years</option>
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  AY {yr}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value as StateUT | "All");
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by State"
            >
              <option value="All">All States / UTs</option>
              {STATE_LIST.filter((s) => s !== "All States / UTs").map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Institution Filter */}
          <div>
            <select
              value={institutionCode}
              onChange={(e) => {
                setInstitutionCode(e.target.value);
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by Institution"
            >
              <option value="All">All Institutions</option>
              {MOCK_INSTITUTIONS.map((inst) => (
                <option key={inst.id} value={inst.code}>
                  {inst.code} ({inst.name.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Compliance Status Filter */}
          <div>
            <select
              value={complianceStatus}
              onChange={(e) => {
                setComplianceStatus(e.target.value as IntakeComplianceStatus | "All");
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by Compliance Status"
            >
              <option value="All">All Compliance States</option>
              <option value="Compliant">Compliant</option>
              <option value="Under Capacity">Under Capacity (&lt;75%)</option>
              <option value="Near Capacity">Near Capacity (95-100%)</option>
              <option value="Over Capacity Breach">Over Capacity Breach</option>
              <option value="Requires Review">Requires Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* INTAKE TABLE */}
      <IntakeTable
        rows={rows}
        loading={loading}
        onInspect={(row) => setSelectedProgrammeId(row.id)}
      />

      {/* PAGINATION FOOTER */}
      <div className="flex items-center justify-between border-t border-[#161c28] pt-2 px-1">
        <div className="text-[11px] text-zinc-400 font-mono">
          Showing Page <span className="text-zinc-200">{page}</span> of{" "}
          <span className="text-zinc-200">{totalPages}</span> ({total} Programmes Monitored)
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded border border-[#1e2738] bg-[#0c1017] px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-[#111722] disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 rounded border border-[#1e2738] bg-[#0c1017] px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-[#111722] disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* PROGRAMME DETAIL DRILL-DOWN MODAL */}
      <ProgrammeDetailModal
        programmeId={selectedProgrammeId}
        isOpen={Boolean(selectedProgrammeId)}
        onClose={() => setSelectedProgrammeId(null)}
      />
    </div>
  );
};

export default IntakeMonitoringPage;
