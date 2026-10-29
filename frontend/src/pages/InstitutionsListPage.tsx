import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  InstitutionDetailRecord,
  InstitutionStatus,
} from "@/types/institutions";
import { StateUT, AcademicYear } from "@/types/governance";
import { STATE_LIST, ACADEMIC_YEARS } from "@/data/governanceData";
import { fetchInstitutions } from "@/services/institutionService";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export const InstitutionsListPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<InstitutionDetailRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState<StateUT | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<InstitutionStatus | "All">(
    "All"
  );
  const [selectedYear, setSelectedYear] = useState<AcademicYear>("2026-27");

  const loadInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchInstitutions({
        search,
        state: selectedState,
        status: selectedStatus,
        academicYear: selectedYear,
        page,
        pageSize,
      });
      setInstitutions(res.institutions);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to load institutions:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedState, selectedStatus, selectedYear, page, pageSize]);

  useEffect(() => {
    loadInstitutions();
  }, [loadInstitutions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadInstitutions();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AICTE Approved Technical Institutions
            </h1>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              {total} Campuses
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            National directory of approved engineering colleges, autonomous universities, and intake quotas.
          </p>
        </div>

        <button
          onClick={loadInstitutions}
          aria-label="Refresh institutions directory"
          className="flex items-center gap-1.5 self-start rounded border border-[#1e2738] bg-[#0c1017] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-[#2b374e] hover:bg-[#111722] hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-4">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
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
              placeholder="Search by college name, district, or code..."
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 pr-3 pl-8.5 font-mono text-xs text-zinc-200 placeholder-zinc-400 transition focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value as StateUT | "All");
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by state"
            >
              <option value="All">All States / UTs</option>
              {STATE_LIST.filter((s) => s !== "All States / UTs").map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as InstitutionStatus | "All");
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by accreditation status"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Under Review">Under Review</option>
              <option value="Quota Exceeded">Quota Exceeded</option>
              <option value="Conditional Approval">Conditional Approval</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value as AcademicYear);
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by academic year"
            >
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  AY {yr}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Institutions Table */}
      <div className="rounded border border-[#182130] bg-[#0c1017]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#161c28] bg-[#080b11] text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
              <tr>
                <th className="py-2.5 pr-3 pl-4 sm:pl-5">Institution Code</th>
                <th className="px-3 py-2.5">Institution Name & District</th>
                <th className="px-3 py-2.5">State</th>
                <th className="px-3 py-2.5 text-center">Programmes</th>
                <th className="px-3 py-2.5 text-right font-mono">Approved Intake</th>
                <th className="px-3 py-2.5 text-right font-mono">Reported Enrolled</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3 py-2.5">Last Submission</th>
                <th className="py-2.5 pr-4 pl-3 text-right sm:pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141b27]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                      <span>Loading institution records...</span>
                    </div>
                  </td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    No institutions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                institutions.map((inst) => {
                  const isOverQuota =
                    inst.reportedEnrolmentTotal > inst.approvedIntakeTotal;
                  return (
                    <tr
                      key={inst.id}
                      className="transition-colors hover:bg-[#0f141f]"
                    >
                      <td className="py-3.5 pr-3 pl-4 sm:pl-5 font-mono text-[11px] font-bold text-emerald-400">
                        {inst.code}
                      </td>
                      <td className="px-3 py-3.5">
                        <Link
                          to={`/institutions/${inst.code}`}
                          className="font-medium text-zinc-100 hover:text-emerald-300 transition"
                        >
                          {inst.name}
                        </Link>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {inst.institutionType} • {inst.district}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-zinc-300">{inst.state}</td>
                      <td className="px-3 py-3.5 text-center font-mono">
                        <span className="rounded bg-[#121824] px-2 py-0.5 text-zinc-300 border border-[#1b2536]">
                          {inst.totalApprovedProgrammes} B.Tech
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-zinc-300">
                        {inst.approvedIntakeTotal.toLocaleString("en-IN")}
                      </td>
                      <td
                        className={`px-3 py-3.5 text-right font-mono font-semibold ${
                          isOverQuota ? "text-rose-400" : "text-zinc-100"
                        }`}
                      >
                        {inst.reportedEnrolmentTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {inst.status === "Approved" ? (
                          <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Approved
                          </span>
                        ) : inst.status === "Quota Exceeded" ? (
                          <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                            <AlertTriangle className="h-3 w-3" />
                            Over Quota
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                            <Clock className="h-3 w-3" />
                            Under Review
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 font-mono text-[11px] text-zinc-400">
                        {inst.lastSubmissionDate
                          ? formatDateTime(inst.lastSubmissionDate)
                          : "No recent submissions"}
                      </td>
                      <td className="py-3.5 pr-4 pl-3 text-right sm:pr-5">
                        <Link
                          to={`/institutions/${inst.code}`}
                          className="inline-flex items-center gap-1 rounded border border-[#1e2738] bg-[#0e131d] px-2.5 py-1 text-xs text-zinc-300 transition hover:border-emerald-500/40 hover:bg-[#121926] hover:text-white"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="h-3 w-3 text-emerald-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-[#161c28] px-4 py-3 sm:px-5">
          <div className="text-[11px] text-zinc-400 font-mono">
            Showing Page <span className="text-zinc-200">{page}</span> of{" "}
            <span className="text-zinc-200">{totalPages}</span> ({total} Institutions)
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
      </div>
    </div>
  );
};

export default InstitutionsListPage;
