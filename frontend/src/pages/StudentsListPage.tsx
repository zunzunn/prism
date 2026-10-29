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
} from "lucide-react";

export const StudentsListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialInst = searchParams.get("institution") || "";

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
        institutionCode: initialInst,
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
    initialInst,
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              National Student Registry & APAAR Records
            </h1>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              {total} Verified Students
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            National student enrollment ledger with masked APAAR identifiers, category audits, and tamper-evident hashes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Import Student CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-3">
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
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 pr-3 pl-8.5 font-mono text-xs text-zinc-200 placeholder-zinc-400 transition focus:border-emerald-500/50 focus:outline-none"
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

          {/* Admission Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as AdmissionCategory | "All");
                setPage(1);
              }}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by Admission Category"
            >
              <option value="All">All Categories</option>
              <option value="General / Open">General / Open</option>
              <option value="OBC-NCL">OBC-NCL</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
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
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter by Validation Status"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Pending Validation">Pending Validation</option>
              <option value="Flagged Duplicate">Flagged Duplicate</option>
              <option value="Intake Over-Quota">Intake Over-Quota</option>
            </select>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between border-t border-[#161c28] pt-3 text-xs gap-2">
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
              className="rounded border border-[#1b2333] bg-[#090d14] py-1 px-2.5 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
            >
              <option value="fullName">Student Full Name</option>
              <option value="admissionDate">Admission Date</option>
              <option value="institutionName">Institution Name</option>
              <option value="validationStatus">Validation Status</option>
            </select>
            <button
              onClick={() => {
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                setPage(1);
              }}
              className="rounded border border-[#1b2333] bg-[#090d14] py-1 px-2 font-mono text-xs text-zinc-300 hover:text-white"
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
          <div className="flex items-center justify-between rounded border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-300">
            <span className="font-medium">
              {selectedIds.length} students selected for bulk operation
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkBatchValidate}
                className="rounded border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 font-semibold hover:bg-emerald-500/30 transition"
              >
                Re-Validate Batch
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Student Records Table */}
      <div className="rounded border border-[#182130] bg-[#0c1017]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#161c28] bg-[#080b11] text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
              <tr>
                <th className="py-2.5 pr-2 pl-4 sm:pl-5 w-8">
                  <button
                    onClick={handleToggleSelectAll}
                    aria-label="Select all rows"
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    {selectedIds.length === students.length &&
                    students.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-2.5">Masked APAAR / Student ID</th>
                <th className="px-3 py-2.5">Student Name</th>
                <th className="px-3 py-2.5">Institution & State</th>
                <th className="px-3 py-2.5">Programme</th>
                <th className="px-3 py-2.5 text-center">Category</th>
                <th className="px-3 py-2.5 text-center">Validation Status</th>
                <th className="px-3 py-2.5">Last Updated</th>
                <th className="py-2.5 pr-4 pl-3 text-right sm:pr-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141b27]">
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
                        isSelected ? "bg-[#111722]" : "hover:bg-[#0f141f]"
                      }`}
                    >
                      <td className="py-3.5 pr-2 pl-4 sm:pl-5">
                        <button
                          onClick={() => handleToggleRow(stu.id)}
                          aria-label={`Select student ${stu.fullName}`}
                          className="text-zinc-400 hover:text-zinc-200"
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
                      <td className="px-3 py-3.5 font-medium text-zinc-100">
                        {stu.fullName}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="max-w-[200px] truncate text-zinc-300">
                          {stu.institutionName}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {stu.state}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="max-w-[180px] truncate text-zinc-300">
                          {stu.programme}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          AY {stu.academicYear}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="rounded border border-[#1b2536] bg-[#0f141f] px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                          {stu.admissionCategory}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {stu.validationStatus === "Verified" ? (
                          <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </span>
                        ) : stu.validationStatus === "Flagged Duplicate" ? (
                          <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                            <AlertOctagon className="h-3 w-3" />
                            Duplicate Flag
                          </span>
                        ) : stu.validationStatus === "Intake Over-Quota" ? (
                          <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            Over-Quota
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
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
                          className="inline-flex items-center gap-1 rounded border border-[#1e2738] bg-[#0e131d] px-2.5 py-1 text-xs text-zinc-300 transition hover:border-emerald-500/40 hover:bg-[#121926] hover:text-white"
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
        <div className="flex items-center justify-between border-t border-[#161c28] px-4 py-3 sm:px-5">
          <div className="text-[11px] text-zinc-400 font-mono">
            Showing Page <span className="text-zinc-200">{page}</span> of{" "}
            <span className="text-zinc-200">{totalPages}</span> ({total} Student Records)
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
