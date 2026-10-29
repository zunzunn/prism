import React from "react";
import { RecentSubmissionRecord } from "@/types/governance";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle, FileText, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RecentSubmissionsTableProps {
  submissions: RecentSubmissionRecord[];
}

export const RecentSubmissionsTable: React.FC<RecentSubmissionsTableProps> = ({
  submissions,
}) => {
  return (
    <div className="rounded border border-[#182130] bg-[#0c1017]">
      <div className="flex items-center justify-between border-b border-[#161c28] px-4 py-3.5 sm:px-5">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-[#1f2838] bg-[#111722] text-zinc-300">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100">
              Recent Institutional Batch Submissions
            </h3>
            <p className="text-[11px] text-zinc-400">
              Live automated student enrollment ingest payloads
            </p>
          </div>
        </div>
        <Link
          to="/validation"
          className="flex items-center gap-1 rounded border border-[#20293a] bg-[#0e131d] px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-[#141b28] hover:text-white"
        >
          <span>All Batches</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#161c28] bg-[#080b11] text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            <tr>
              <th className="py-2.5 pr-3 pl-4 sm:pl-5">Batch Reference</th>
              <th className="px-3 py-2.5">Institution & State</th>
              <th className="px-3 py-2.5 text-right font-mono">Enrolled Records</th>
              <th className="px-3 py-2.5 text-right font-mono">APAAR Pass</th>
              <th className="px-3 py-2.5 text-center">Status</th>
              <th className="py-2.5 pr-4 pl-3 text-right sm:pr-5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141b27]">
            {submissions.map((sub) => (
              <tr key={sub.id} className="transition-colors hover:bg-[#0f141f]">
                <td className="py-3 pr-3 pl-4 sm:pl-5 font-mono text-[11px] font-semibold text-emerald-400">
                  {sub.batchReference}
                </td>
                <td className="px-3 py-3">
                  <div className="font-medium text-zinc-200">{sub.institutionName}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Code: {sub.institutionCode} • {sub.state}
                  </div>
                </td>
                <td className="px-3 py-3 text-right font-mono text-zinc-200">
                  {sub.recordsCount.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-3 text-right font-mono text-emerald-400 font-medium">
                  {sub.apaarVerifiedCount.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-3 text-center">
                  {sub.status === "Completed" ? (
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </span>
                  ) : sub.status === "Processing" ? (
                    <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                      <Clock className="h-3 w-3 animate-spin" />
                      Processing
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                      <AlertTriangle className="h-3 w-3" />
                      Needs Review
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 pl-3 text-right font-mono text-[11px] text-zinc-400 sm:pr-5">
                  {formatDateTime(sub.submittedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
