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
    <div className="rounded border border-[#182130] bg-[#0c1017]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#161c28] bg-[#080b11] text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            <tr>
              <th className="py-2.5 pr-3 pl-4 sm:pl-5">Finding / Rule ID</th>
              <th className="px-3 py-2.5">Category</th>
              <th className="px-3 py-2.5 text-center">Severity</th>
              <th className="px-3 py-2.5">Institution & Campus</th>
              <th className="px-3 py-2.5">Affected References</th>
              <th className="px-3 py-2.5 text-center">Status</th>
              <th className="py-2.5 pr-4 pl-3 text-right sm:pr-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141b27]">
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
                  className="transition-colors hover:bg-[#0f141f]"
                >
                  <td className="py-3.5 pr-3 pl-4 sm:pl-5">
                    <div className="font-semibold text-zinc-200">
                      {finding.ruleName}
                    </div>
                    <div className="font-mono text-[10px] text-emerald-400">
                      {finding.ruleId} • {finding.id}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="rounded border border-[#1e2738] bg-[#101521] px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                      {finding.category}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    {finding.severity === "Critical" ? (
                      <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                        <AlertOctagon className="h-3 w-3" />
                        Critical
                      </span>
                    ) : finding.severity === "Warning" ? (
                      <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                        <Info className="h-3 w-3" />
                        Info
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="max-w-[200px] truncate text-zinc-200 font-medium">
                      {finding.institutionName}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      Code: {finding.institutionCode} • {finding.academicYear}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 font-mono text-[11px] text-zinc-400">
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
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                        finding.reviewStatus === "Resolved"
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : finding.reviewStatus === "Dismissed False Positive"
                          ? "border border-zinc-700 bg-zinc-800 text-zinc-400 line-through"
                          : finding.reviewStatus === "Explanation Requested"
                          ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                          : "border border-[#222f42] bg-[#111724] text-zinc-300"
                      }`}
                    >
                      {finding.reviewStatus}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 pl-3 text-right sm:pr-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onInspect(finding)}
                        className="inline-flex items-center gap-1 rounded border border-[#1e2738] bg-[#0e131d] px-2.5 py-1 text-xs text-zinc-300 transition hover:border-emerald-500/40 hover:bg-[#121926] hover:text-white"
                      >
                        <Eye className="h-3 w-3 text-emerald-400" />
                        <span>Inspect</span>
                      </button>
                      <Link
                        to={`/validation/${finding.id}`}
                        aria-label="View full diagnostic route"
                        className="rounded border border-[#1e2738] bg-[#0e131d] p-1 text-zinc-400 hover:text-white"
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
