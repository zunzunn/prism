import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { InstitutionDetailRecord } from "@/types/institutions";
import { fetchInstitutionById } from "@/services/institutionService";
import { formatDateTime } from "@/lib/utils";
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Scale,
  Calendar,
  FileText,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";

export const InstitutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [institution, setInstitution] = useState<InstitutionDetailRecord | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetchInstitutionById(id);
        setInstitution(res);
      } catch (err) {
        console.error("Failed to load institution detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded border border-[#1f2838] bg-[#0c1017] px-4 py-2 text-xs text-zinc-300">
          <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
          <span>Loading institution profile...</span>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="py-24 text-center space-y-4">
        <Building2 className="mx-auto h-10 w-10 text-zinc-500" />
        <h2 className="text-base font-bold text-zinc-200">
          Institution Not Found
        </h2>
        <p className="text-xs text-zinc-400">
          No approved AICTE institution found matching code `{id}`.
        </p>
        <Link
          to="/institutions"
          className="inline-flex items-center gap-1.5 rounded border border-[#1e2738] bg-[#0c1017] px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Institutions Directory</span>
        </Link>
      </div>
    );
  }

  const isOverIntake =
    institution.reportedEnrolmentTotal > institution.approvedIntakeTotal;

  return (
    <div className="space-y-6 pb-14">
      {/* Back Link & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div className="flex items-center space-x-3">
          <Link
            to="/institutions"
            aria-label="Back to Institutions"
            className="flex h-9 w-9 items-center justify-center rounded border border-[#1e2838] bg-[#0c1017] text-zinc-400 transition hover:bg-[#121926] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {institution.name}
              </h1>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                  institution.status === "Approved"
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : institution.status === "Quota Exceeded"
                    ? "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                    : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {institution.status}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
              <span>AICTE ID: {institution.code}</span>
              <span>•</span>
              <span>{institution.institutionType}</span>
              <span>•</span>
              <span>
                {institution.district}, {institution.state}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/students?institution=${institution.code}`}
            className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <span>View Enrolled Students</span>
          </Link>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-[#182130] bg-[#0c1017] p-4">
          <span className="text-[11px] text-zinc-400">Approved Intake</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-zinc-100">
              {institution.approvedIntakeTotal.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Sanctioned</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            Across {institution.totalApprovedProgrammes} academic branches
          </div>
        </div>

        <div className="rounded border border-[#182130] bg-[#0c1017] p-4">
          <span className="text-[11px] text-zinc-400">Reported Enrolment</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span
              className={`font-mono text-2xl font-bold ${
                isOverIntake ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {institution.reportedEnrolmentTotal.toLocaleString("en-IN")}
            </span>
            <span
              className={`text-[10px] font-mono font-semibold uppercase ${
                isOverIntake ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {((institution.reportedEnrolmentTotal / institution.approvedIntakeTotal) * 100).toFixed(1)}% Quota
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {isOverIntake
              ? "Exceeds approved capacity (supernumerary audit required)"
              : "Within approved sanctioned thresholds"}
          </div>
        </div>

        <div className="rounded border border-[#182130] bg-[#0c1017] p-4">
          <span className="text-[11px] text-zinc-400">Accreditation</span>
          <div className="mt-1">
            <span className="font-semibold text-zinc-200 text-sm">
              {institution.accreditation}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">
            Established Year: {institution.establishedYear}
          </div>
        </div>

        <div className="rounded border border-[#182130] bg-[#0c1017] p-4">
          <span className="text-[11px] text-zinc-400">Nodal Officer</span>
          <div className="mt-1">
            <span className="font-semibold text-zinc-200 text-sm">
              {institution.nodalOfficerName}
            </span>
          </div>
          <div className="mt-1 text-[11px] font-mono text-zinc-400 truncate">
            {institution.nodalOfficerEmail}
          </div>
        </div>
      </div>

      {/* Approved Programmes & Intake Breakdown Table */}
      <div className="rounded border border-[#182130] bg-[#0c1017]">
        <div className="border-b border-[#161c28] px-4 py-3 sm:px-5 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-zinc-100">
              Approved Programmes & Branch-Wise Intake
            </h2>
            <p className="text-[11px] text-zinc-400">
              Department sanctioned strength and supernumerary admissions
            </p>
          </div>
          <span className="rounded border border-[#1e2738] bg-[#111722] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
            AY 2026-27
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#161c28] bg-[#080b11] text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
              <tr>
                <th className="py-2.5 pr-3 pl-4 sm:pl-5">Programme Name</th>
                <th className="px-3 py-2.5">Degree Level</th>
                <th className="px-3 py-2.5 text-right font-mono">Approved Intake</th>
                <th className="px-3 py-2.5 text-right font-mono">Enrolled</th>
                <th className="px-3 py-2.5 text-right font-mono">Supernumerary (Enr/App)</th>
                <th className="px-3 py-2.5 text-right font-mono">Utilization</th>
                <th className="py-2.5 pr-4 pl-3 text-center sm:pr-5">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141b27]">
              {institution.programmes.map((prg) => (
                <tr key={prg.id} className="transition-colors hover:bg-[#0f141f]">
                  <td className="py-3 pr-3 pl-4 sm:pl-5 font-medium text-zinc-200">
                    {prg.programmeName}
                  </td>
                  <td className="px-3 py-3 text-zinc-400">{prg.degreeLevel}</td>
                  <td className="px-3 py-3 text-right font-mono text-zinc-200">
                    {prg.approvedIntake}
                  </td>
                  <td
                    className={`px-3 py-3 text-right font-mono font-semibold ${
                      prg.isOverIntake ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {prg.reportedEnrolment}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-zinc-300">
                    {prg.supernumeraryEnrolled} / {prg.supernumeraryApproved}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-zinc-300">
                    {prg.utilizationRate.toFixed(1)}%
                  </td>
                  <td className="py-3 pr-4 pl-3 text-center sm:pr-5">
                    {prg.isOverIntake ? (
                      <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                        <AlertTriangle className="h-3 w-3" />
                        Breach (+{prg.reportedEnrolment - prg.approvedIntake})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Compliant
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dual Column: Submission History & Data Quality Issues */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Submission History */}
        <div className="rounded border border-[#182130] bg-[#0c1017] p-5">
          <div className="flex items-center justify-between border-b border-[#161c28] pb-3">
            <h3 className="text-xs font-bold text-zinc-100">
              Institutional Submission History
            </h3>
            <span className="font-mono text-[10px] text-zinc-400">
              {institution.submissions.length} Batches
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {institution.submissions.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">
                No past submissions recorded for this campus.
              </p>
            ) : (
              institution.submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded border border-[#17202e] bg-[#090d14] p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-emerald-400">
                        {sub.batchReference}
                      </span>
                      <span className="rounded border border-[#1e2738] bg-[#0c1017] px-1.5 py-0.2 font-mono text-[9px] text-zinc-300">
                        {sub.academicYear}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-400">
                      {sub.recordsSubmitted.toLocaleString("en-IN")} records •{" "}
                      <span className="text-emerald-400">{sub.apaarPassCount} APAAR verified</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      {sub.status}
                    </span>
                    <span className="block mt-1 font-mono text-[10px] text-zinc-400">
                      {formatDateTime(sub.submittedAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Data Quality & Intake Issues */}
        <div className="rounded border border-[#182130] bg-[#0c1017] p-5">
          <div className="flex items-center justify-between border-b border-[#161c28] pb-3">
            <h3 className="text-xs font-bold text-zinc-100">
              Data Quality & Compliance Audits
            </h3>
            <span className="font-mono text-[10px] text-rose-400">
              {institution.qualityIssues.length} Flags
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {institution.qualityIssues.length === 0 ? (
              <div className="py-6 text-center text-xs text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero open data quality issues detected for this institution.</span>
              </div>
            ) : (
              institution.qualityIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded border border-rose-500/30 bg-rose-500/5 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                      <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                      <span>{issue.category}</span>
                    </div>
                    <span className="rounded border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.2 text-[9px] font-mono text-rose-400 uppercase">
                      {issue.severity}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-300">{issue.description}</p>
                  <div className="mt-2 flex items-center justify-between border-t border-rose-500/20 pt-1.5 text-[10px] font-mono text-zinc-400">
                    <span>Affected Records: {issue.affectedRecords}</span>
                    <span>Status: {issue.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDetailPage;
