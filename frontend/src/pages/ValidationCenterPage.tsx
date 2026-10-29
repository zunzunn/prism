import React, { useState, useEffect, useCallback } from "react";
import {
  ValidationFinding,
  ValidationMetrics,
  ValidationCategory,
  ValidationSeverity,
  FindingReviewStatus,
} from "@/types/validation";
import { AcademicYear } from "@/types/governance";
import { ACADEMIC_YEARS } from "@/data/governanceData";
import { MOCK_INSTITUTIONS } from "@/data/institutionsData";
import {
  fetchValidationDashboard,
  updateFindingStatus,
} from "@/services/validationService";
import { ValidationMetricsGrid } from "@/components/validation/ValidationMetricsGrid";
import { FindingsTable } from "@/components/validation/FindingsTable";
import { DuplicateDetailModal } from "@/components/validation/DuplicateDetailModal";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const ValidationCenterPage: React.FC = () => {
  const [findings, setFindings] = useState<ValidationFinding[]>([]);
  const [metrics, setMetrics] = useState<ValidationMetrics | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState<AcademicYear | "All">("All");
  const [institutionCode, setInstitutionCode] = useState<string | "All">("All");
  const [category, setCategory] = useState<ValidationCategory | "All">("All");
  const [severity, setSeverity] = useState<ValidationSeverity | "All">("All");
  const [reviewStatus, setReviewStatus] = useState<FindingReviewStatus | "All">(
    "All"
  );

  // Active Inspect Modal
  const [inspectFinding, setInspectFinding] = useState<ValidationFinding | null>(
    null
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchValidationDashboard({
        search,
        academicYear,
        institutionCode,
        category,
        severity,
        reviewStatus,
        page,
        pageSize,
      });
      setFindings(res.findings);
      setMetrics(res.metrics);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to load validation findings:", err);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    academicYear,
    institutionCode,
    category,
    severity,
    reviewStatus,
    page,
    pageSize,
  ]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleUpdateStatus = async (
    findingId: string,
    newStatus: FindingReviewStatus,
    reason: string
  ) => {
    try {
      const updated = await updateFindingStatus(
        findingId,
        newStatus,
        reason,
        "AICTE Governance Officer"
      );
      setInspectFinding(updated);
      loadDashboard();
    } catch (err) {
      console.error("Error updating finding status:", err);
    }
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AICTE Academic Validation Center
            </h1>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              Deterministic Engine v2.4
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Explainable validation rules, APAAR identifier checks, intake capacity audits, and duplicate detection.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          aria-label="Re-execute deterministic rules engine"
          className="flex items-center gap-1.5 self-start rounded border border-[#1e2738] bg-[#0c1017] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-[#2b374e] hover:bg-[#121926] hover:text-white"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`}
          />
          <span>Re-Run Engine</span>
        </button>
      </div>

      {/* METRICS GRID (6 KPI Cards) */}
      {metrics && <ValidationMetricsGrid metrics={metrics} />}

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
              placeholder="Search rule ID, finding, institution, or student reference..."
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 pr-3 pl-8.5 font-mono text-xs text-zinc-200 placeholder-zinc-400 transition focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ValidationCategory | "All");
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by Validation Category"
            >
              <option value="All">All Categories</option>
              <option value="APAAR Identifier">APAAR Identifier</option>
              <option value="Duplicate Detection">Duplicate Detection</option>
              <option value="Intake Validation">Intake Validation</option>
              <option value="Data Consistency">Data Consistency</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value as ValidationSeverity | "All");
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by Severity"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Warning">Warning</option>
              <option value="Informational">Informational</option>
            </select>
          </div>

          {/* Review Status Filter */}
          <div>
            <select
              value={reviewStatus}
              onChange={(e) => {
                setReviewStatus(e.target.value as FindingReviewStatus | "All");
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by Review Status"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Explanation Requested">Explanation Requested</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed False Positive">Dismissed False Positive</option>
            </select>
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
        </div>
      </div>

      {/* FINDINGS TABLE */}
      <FindingsTable
        findings={findings}
        loading={loading}
        onInspect={(finding) => setInspectFinding(finding)}
      />

      {/* PAGINATION FOOTER */}
      <div className="flex items-center justify-between border-t border-[#161c28] pt-2 px-1">
        <div className="text-[11px] text-zinc-400 font-mono">
          Showing Page <span className="text-zinc-200">{page}</span> of{" "}
          <span className="text-zinc-200">{totalPages}</span> ({total} Findings)
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

      {/* DUPLICATE / FINDING DETAIL MODAL */}
      <DuplicateDetailModal
        finding={inspectFinding}
        isOpen={Boolean(inspectFinding)}
        onClose={() => setInspectFinding(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default ValidationCenterPage;
