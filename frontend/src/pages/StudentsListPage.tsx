import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  StudentRecordDetail,
  AdmissionCategory,
  StudentValidationStatus,
} from "@/types/students";
import { AcademicYear } from "@/types/governance";
import { ACADEMIC_YEARS } from "@/data/governanceData";
import { fetchStudents, maskApaarId } from "@/services/studentService";
import { formatDateTime } from "@/lib/utils";
import { StudentDetailDrawer } from "@/components/students/StudentDetailDrawer";
import { CsvUploadModal } from "@/components/students/CsvUploadModal";
import {
  Search,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  AlertOctagon,
  Building,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

export const StudentsListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialInst = searchParams.get("institution") || "";

  let roleCtx: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    roleCtx = useRole();
  } catch {
    // fallback
  }

  const isInstAdmin = roleCtx?.isInstitutionAdmin;
  const effectiveInst = initialInst || (isInstAdmin ? roleCtx.scopedInstitution.code : "");

  const [students, setStudents] = useState<StudentRecordDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<AcademicYear | "All">("All");
  const [selectedCategory, setSelectedCategory] = useState<
    AdmissionCategory | "All"
  >("All");
  const [selectedStatus, setSelectedStatus] = useState<
    StudentValidationStatus | "All"
  >("All");
  const [sortBy, setSortBy] = useState<
    "fullName" | "admissionDate" | "institutionName" | "validationStatus"
  >("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Selection & Modal States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeStudent, setActiveStudent] = useState<StudentRecordDetail | null>(
    null
  );
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStudents({
        search,
        institutionCode: effectiveInst,
        academicYear: selectedYear,
        admissionCategory: selectedCategory,
        validationStatus: selectedStatus,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });
      setStudents(res.students);
      setTotal(res.total);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    effectiveInst,
    selectedYear,
    selectedCategory,
    selectedStatus,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s.id));
    }
  };

  const handleToggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkBatchValidate = () => {
    alert(
      `Triggered AICTE cryptographic re-validation on ${selectedIds.length} selected student records.`
    );
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              National Student Registry & APAAR Records
            </h1>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 font-bold">
              {total} Verified Students
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-300 sm:text-sm">
            National student enrollment ledger with masked APAAR identifiers, category audits, and tamper-evident hashes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25 cursor-pointer backdrop-blur-md shadow-md shadow-emerald-950/40"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Import Student CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0c1424]/75 p-5 space-y-3 backdrop-blur-xl shadow-xl">
        {effectiveInst && (
          <div className="flex items-center justify-between rounded-xl border border-sky-400/30 bg-sky-500/10 px-3.5 py-2 text-xs text-sky-200 font-mono backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-sky-400" />
              <span>Active Scope: {effectiveInst === "1-332901124" || effectiveInst === "COEP" ? "College of Engineering Pune (COEP) [1-332901124]" : effectiveInst}</span>
            </div>
            <span className="text-[10px] text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-full font-bold">Scoped View</span>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
              placeholder="Search by student name, Roll No, college, or APAAR..."
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2 pr-3 pl-9 font-mono text-xs text-white placeholder-zinc-400 transition focus:border-emerald-500/60 focus:bg-white/[0.08] focus:outline-none backdrop-blur-md"
            />
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value as AcademicYear | "All");
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2 px-3 font-mono text-xs text-zinc-200 focus:border-emerald-500/60 focus:bg-[#0b101c] focus:outline-none backdrop-blur-md"
              aria-label="Filter by Academic Year"
            >
              <option value="All" className="bg-[#0b101c]">All Academic Years</option>
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr} className="bg-[#0b101c]">
                  AY {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Admission Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as AdmissionCategory | "All");
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2 px-3 font-mono text-xs text-zinc-200 focus:border-emerald-500/60 focus:bg-[#0b101c] focus:outline-none backdrop-blur-md"
              aria-label="Filter by Admission Category"
            >
              <option value="All" className="bg-[#0b101c]">All Categories</option>
              <option value="General / Open" className="bg-[#0b101c]">General / Open</option>
              <option value="OBC-NCL" className="bg-[#0b101c]">OBC-NCL</option>
              <option value="SC" className="bg-[#0b101c]">SC</option>
              <option value="ST" className="bg-[#0b101c]">ST</option>
              <option value="EWS" className="bg-[#0b101c]">EWS</option>
            </select>
          </div>

          {/* Validation Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as StudentValidationStatus | "All");
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2 px-3 font-mono text-xs text-zinc-200 focus:border-emerald-500/60 focus:bg-[#0b101c] focus:outline-none backdrop-blur-md"
              aria-label="Filter by Validation Status"
            >
              <option value="All" className="bg-[#0b101c]">All Statuses</option>
              <option value="Verified" className="bg-[#0b101c]">Verified</option>
              <option value="Pending Validation" className="bg-[#0b101c]">Pending Validation</option>
              <option value="Flagged Duplicate" className="bg-[#0b101c]">Flagged Duplicate</option>
              <option value="Intake Over-Quota" className="bg-[#0b101c]">Intake Over-Quota</option>
            </select>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between border-t border-white/10 pt-3 text-xs gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-zinc-400 font-mono text-[11px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(
                  e.target.value as
                    | "fullName"
                    | "admissionDate"
                    | "institutionName"
                    | "validationStatus"
                );
                setPage(1);
              }}
              className="rounded-xl border border-white/15 bg-white/[0.04] py-1 px-2.5 font-mono text-xs text-zinc-200 focus:border-emerald-500/60 focus:bg-[#0b101c] focus:outline-none backdrop-blur-md"
            >
              <option value="fullName" className="bg-[#0b101c]">Student Full Name</option>
              <option value="admissionDate" className="bg-[#0b101c]">Admission Date</option>
              <option value="institutionName" className="bg-[#0b101c]">Institution Name</option>
              <option value="validationStatus" className="bg-[#0b101c]">Validation Status</option>
            </select>
            <button
              onClick={() => {
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                setPage(1);
              }}
              className="rounded-xl border border-white/15 bg-white/[0.04] py-1 px-2.5 font-mono text-xs text-zinc-300 hover:text-white cursor-pointer backdrop-blur-md"
            >
              Order: {sortOrder.toUpperCase()}
            </button>
          </div>

          <div className="text-[11px] font-mono text-zinc-400">
            Total {total} Enrolled Records
          </div>
        </div>

        {/* Bulk Action Bar when items selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-xs text-emerald-200 backdrop-blur-md shadow-md">
            <span className="font-semibold">
              {selectedIds.length} students selected for bulk operation
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkBatchValidate}
                className="rounded-lg border border-emerald-400/50 bg-emerald-500/25 px-3 py-1 font-semibold text-emerald-100 hover:bg-emerald-500/35 transition cursor-pointer"
              >
                Re-Validate Batch
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer px-2"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Student Records Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0c1424]/75 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
              <tr>
                <th className="py-3 pr-2 pl-4 sm:pl-5 w-8">
                  <button
                    onClick={handleToggleSelectAll}
                    aria-label="Select all rows"
                    className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    {selectedIds.length === students.length &&
                    students.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3">Masked APAAR / Student ID</th>
                <th className="px-3 py-3">Student Name</th>
                <th className="px-3 py-3">Institution & State</th>
                <th className="px-3 py-3">Programme</th>
                <th className="px-3 py-3 text-center">Category</th>
                <th className="px-3 py-3 text-center">Validation Status</th>
                <th className="px-3 py-3">Last Updated</th>
                <th className="py-3 pr-4 pl-3 text-right sm:pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                      <span>Loading student records...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    No student records match the active search criteria.
                  </td>
                </tr>
              ) : (
                students.map((stu) => {
                  const isSelected = selectedIds.includes(stu.id);
                  return (
                    <tr
                      key={stu.id}
                      className={`transition-colors ${
                        isSelected ? "bg-emerald-500/10" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <td className="py-3.5 pr-2 pl-4 sm:pl-5">
                        <button
                          onClick={() => handleToggleRow(stu.id)}
                          aria-label={`Select student ${stu.fullName}`}
                          className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3.5">
                        {/* MASKED APAAR IDENTIFIER: NEVER DISPLAY FULL APAAR IN MAIN TABLE */}
                        <div className="font-mono text-[11px] font-semibold text-emerald-400">
                          {maskApaarId(stu.apaarId)}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {stu.institutionStudentId}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 font-medium text-white">
                        {stu.fullName}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="max-w-[200px] truncate text-zinc-200">
                          {stu.institutionName}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {stu.state}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="max-w-[180px] truncate text-zinc-200">
                          {stu.programme}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          AY {stu.academicYear}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                          {stu.admissionCategory}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {stu.validationStatus === "Verified" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        ) : stu.validationStatus === "Flagged Duplicate" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-medium text-rose-300">
                            <AlertOctagon className="h-3 w-3" />
                            Duplicate Flag
                          </span>
                        ) : stu.validationStatus === "Intake Over-Quota" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-medium text-amber-300">
                            <AlertTriangle className="h-3 w-3" />
                            Over-Quota
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-medium text-sky-300">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 font-mono text-[11px] text-zinc-400">
                        {formatDateTime(stu.lastUpdated)}
                      </td>
                      <td className="py-3.5 pr-4 pl-3 text-right sm:pr-5">
                        <button
                          onClick={() => setActiveStudent(stu)}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-200 transition hover:border-emerald-500/40 hover:bg-emerald-500/15 hover:text-emerald-300 cursor-pointer backdrop-blur-md"
                        >
                          <Eye className="h-3 w-3 text-emerald-400" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-5">
          <div className="text-[11px] text-zinc-400 font-mono">
            Showing Page <span className="text-zinc-200 font-semibold">{page}</span> of{" "}
            <span className="text-zinc-200 font-semibold">{totalPages}</span> ({total} Student Records)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40 cursor-pointer backdrop-blur-md"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40 cursor-pointer backdrop-blur-md"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* RECORD DETAIL DRAWER */}
      <StudentDetailDrawer
        student={activeStudent}
        onClose={() => setActiveStudent(null)}
      />

      {/* CSV UPLOAD MODAL */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportComplete={(summary) => {
          console.log("Import summary:", summary);
          loadStudents();
        }}
      />
    </div>
  );
};

export default StudentsListPage;
