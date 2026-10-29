import React from "react";
import { DuplicateAlertRecord } from "@/types/governance";
import { AlertOctagon, Eye, ShieldAlert } from "lucide-react";

interface DuplicateAlertsTableProps {
  alerts: DuplicateAlertRecord[];
  onSelectAlert: (alert: DuplicateAlertRecord) => void;
}

export const DuplicateAlertsTable: React.FC<DuplicateAlertsTableProps> = ({
  alerts,
  onSelectAlert,
}) => {
  return (
    <div className="rounded border border-[#182130] bg-[#0c1017]">
      <div className="flex items-center justify-between border-b border-[#161c28] px-4 py-3.5 sm:px-5">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-rose-500/30 bg-rose-500/10 text-rose-400">
            <AlertOctagon className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100">
              Potential Duplicate Enrolment Alerts
            </h3>
            <p className="text-[11px] text-zinc-400">
              Heuristic anomaly engine detected cross-institutional identity overlaps
            </p>
          </div>
        </div>
        <span className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] text-rose-400">
          {alerts.length} Active Anomaly Flags
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#161c28] bg-[#080b11] text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            <tr>
              <th className="py-2.5 pr-3 pl-4 sm:pl-5">Student / APAAR ID</th>
              <th className="px-3 py-2.5">Conflicting Campuses</th>
              <th className="px-3 py-2.5">Program & Overlap</th>
              <th className="px-3 py-2.5 text-center">Confidence</th>
              <th className="px-3 py-2.5 text-center">Severity</th>
              <th className="py-2.5 pr-4 pl-3 text-right sm:pr-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141b27]">
            {alerts.map((alt) => (
              <tr
                key={alt.id}
                onClick={() => onSelectAlert(alt)}
                className="cursor-pointer transition-colors hover:bg-[#0f141f]"
              >
                <td className="py-3 pr-3 pl-4 sm:pl-5">
                  <div className="font-semibold text-zinc-200">{alt.studentName}</div>
                  <div className="font-mono text-[11px] text-zinc-400">
                    {alt.apaarId}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="max-w-[220px] truncate text-emerald-400 font-medium">
                    1. {alt.primaryInstitution}
                  </div>
                  <div className="max-w-[220px] truncate text-rose-400">
                    2. {alt.conflictingInstitution}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-zinc-200">{alt.program}</div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    {alt.overlapPeriod}
                  </div>
                </td>
                <td className="px-3 py-3 text-center font-mono font-bold text-zinc-200">
                  {alt.confidenceScore}%
                </td>
                <td className="px-3 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      alt.severity === "Critical"
                        ? "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                        : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    <ShieldAlert className="h-3 w-3" />
                    {alt.severity}
                  </span>
                </td>
                <td className="py-3 pr-4 pl-3 text-right sm:pr-5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAlert(alt);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-[#222c3e] bg-[#111722] px-2.5 py-1 text-xs text-zinc-300 transition hover:border-emerald-500/40 hover:text-white"
                  >
                    <Eye className="h-3 w-3 text-emerald-400" />
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
