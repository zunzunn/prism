import React from "react";
import { Link } from "react-router-dom";
import { ValidationFinding } from "@/types/validation";
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  ArrowRight,
  Eye,
} from "lucide-react";

interface FindingsTableProps {
  findings: ValidationFinding[];
  loading?: boolean;
  onInspect: (finding: ValidationFinding) => void;
}

export const FindingsTable: React.FC<FindingsTableProps> = ({
  findings,
  loading,
  onInspect,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1424]/75 overflow-hidden backdrop-blur-xl shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            <tr>
              <th className="py-3 pr-3 pl-4 sm:pl-5">Finding / Rule ID</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3 text-center">Severity</th>
              <th className="px-3 py-3">Institution & Campus</th>
              <th className="px-3 py-3">Affected References</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="py-3 pr-4 pl-3 text-right sm:pr-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400">
                  Running deterministic validation rules engine...
                </td>
              </tr>
            ) : findings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400">
                  No validation findings match the active criteria.
                </td>
              </tr>
            ) : (
              findings.map((finding) => (
                <tr
                  key={finding.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="py-3.5 pr-3 pl-4 sm:pl-5">
                    <div className="font-semibold text-white">
                      {finding.ruleName}
                    </div>
                    <div className="font-mono text-[10px] text-emerald-400 font-bold">
                      {finding.ruleId} • {finding.id}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                      {finding.category}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    {finding.severity === "Critical" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-medium text-rose-300">
                        <AlertOctagon className="h-3 w-3" />
                        Critical
                      </span>
                    ) : finding.severity === "Warning" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-medium text-amber-300">
                        <AlertTriangle className="h-3 w-3" />
                        Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/40 bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-medium text-sky-300">
                        <Info className="h-3 w-3" />
                        Info
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="max-w-[200px] truncate text-white font-medium">
                      {finding.institutionName}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      Code: {finding.institutionCode} • {finding.academicYear}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 font-mono text-[11px] text-zinc-300">
                    {finding.affectedRecordReferences.slice(0, 2).join(", ")}
                    {finding.affectedRecordReferences.length > 2 && (
                      <span className="text-zinc-500">
                        {" "}
                        +{finding.affectedRecordReferences.length - 2} more
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                        finding.reviewStatus === "Resolved"
                          ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                          : finding.reviewStatus === "Dismissed False Positive"
                          ? "border border-zinc-700 bg-zinc-800/80 text-zinc-400 line-through"
                          : finding.reviewStatus === "Explanation Requested"
                          ? "border border-amber-500/40 bg-amber-500/15 text-amber-300"
                          : "border border-white/10 bg-white/[0.05] text-zinc-300"
                      }`}
                    >
                      {finding.reviewStatus}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 pl-3 text-right sm:pr-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onInspect(finding)}
                        className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-200 transition hover:border-emerald-500/40 hover:bg-emerald-500/15 hover:text-emerald-300 cursor-pointer backdrop-blur-md"
                      >
                        <Eye className="h-3 w-3 text-emerald-400" />
                        <span>Inspect</span>
                      </button>
                      <Link
                        to={`/validation/${finding.id}`}
                        aria-label="View full diagnostic route"
                        className="rounded-xl border border-white/15 bg-white/[0.04] p-1.5 text-zinc-400 hover:text-white hover:border-white/30 transition cursor-pointer backdrop-blur-md"
                        title="Open Dedicated Route"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
