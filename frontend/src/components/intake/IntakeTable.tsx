import React from "react";
import { ProgrammeIntakeRow } from "@/types/intake";
import { formatDateTime } from "@/lib/utils";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
} from "lucide-react";

interface IntakeTableProps {
  rows: ProgrammeIntakeRow[];
  loading?: boolean;
  onInspect: (row: ProgrammeIntakeRow) => void;
}

export const IntakeTable: React.FC<IntakeTableProps> = ({
  rows,
  loading,
  onInspect,
}) => {
  return (
    <div className="rounded border border-[#182130] bg-[#0c1017]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#161c28] bg-[#080b11] text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            <tr>
              <th className="py-2.5 pr-3 pl-4 sm:pl-5">Institution & Campus</th>
              <th className="px-3 py-2.5">Programme & Level</th>
              <th className="px-3 py-2.5 text-center">AY</th>
              <th className="px-3 py-2.5 text-right">Approved Intake</th>
              <th className="px-3 py-2.5 text-right">Reported Enrolment</th>
              <th className="px-3 py-2.5">Seat Adjustments</th>
              <th className="px-3 py-2.5 text-center">Effective Utilization</th>
              <th className="px-3 py-2.5 text-center">Status</th>
              <th className="px-3 py-2.5 text-right">Last Updated</th>
              <th className="py-2.5 pr-4 pl-3 text-right sm:pr-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141b27]">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-zinc-400 font-mono">
                  Evaluating regulatory intake allocations and reported enrolments...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-zinc-400">
                  No institutional programmes match the selected filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-[#0f141f]"
                >
                  {/* Institution */}
                  <td className="py-3.5 pr-3 pl-4 sm:pl-5">
                    <div className="max-w-[190px] truncate font-semibold text-zinc-200">
                      {row.institutionName}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-400">
                      Code: {row.institutionCode} • {row.state}
                    </div>
                  </td>

                  {/* Programme */}
                  <td className="px-3 py-3.5">
                    <div className="max-w-[210px] truncate font-medium text-zinc-200">
                      {row.programmeName}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-400">
                      {row.degreeLevel}
                    </div>
                  </td>

                  {/* AY */}
                  <td className="px-3 py-3.5 text-center font-mono text-[11px] text-zinc-300">
                    {row.academicYear}
                  </td>

                  {/* Approved Intake */}
                  <td className="px-3 py-3.5 text-right font-mono text-zinc-200 font-semibold">
                    {row.baseApprovedIntake}
                  </td>

                  {/* Reported Enrolment */}
                  <td className="px-3 py-3.5 text-right font-mono text-emerald-400 font-bold">
                    {row.reportedEnrolment}
                  </td>

                  {/* Seat Adjustments */}
                  <td className="px-3 py-3.5 font-mono text-[10px] text-zinc-300">
                    {row.isPolicyMissing ? (
                      <span className="text-amber-400">Policy Unconfigured</span>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-amber-300 font-semibold">
                          +{row.supernumerary.totalSupernumeraryApproved} seats
                        </span>
                        <div className="text-[9px] text-zinc-400">
                          EWS: {row.supernumerary.ews10Percent} • TFW: {row.supernumerary.tfw5Percent}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Utilization Percentage */}
                  <td className="px-3 py-3.5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className={`font-mono text-xs font-bold ${
                          row.complianceStatus === "Over Capacity Breach"
                            ? "text-rose-400"
                            : row.complianceStatus === "Near Capacity"
                            ? "text-amber-300"
                            : "text-emerald-400"
                        }`}
                      >
                        {row.effectiveUtilizationRate}%
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">
                        of {row.totalPermissibleCapacity} cap
                      </span>
                    </div>
                  </td>

                  {/* Compliance Status */}
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                        row.complianceStatus === "Compliant"
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : row.complianceStatus === "Over Capacity Breach"
                          ? "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                          : row.complianceStatus === "Near Capacity"
                          ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                          : row.complianceStatus === "Under Capacity"
                          ? "border border-sky-500/30 bg-sky-500/10 text-sky-400"
                          : "border border-zinc-700 bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {row.complianceStatus === "Compliant" && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {row.complianceStatus === "Over Capacity Breach" && (
                        <AlertOctagon className="h-3 w-3" />
                      )}
                      {row.complianceStatus === "Near Capacity" && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {row.complianceStatus === "Requires Review" && (
                        <HelpCircle className="h-3 w-3" />
                      )}
                      <span>{row.complianceStatus}</span>
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="px-3 py-3.5 text-right font-mono text-[10px] text-zinc-400">
                    {formatDateTime(row.lastUpdated)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pr-4 pl-3 text-right sm:pr-5">
                    <button
                      onClick={() => onInspect(row)}
                      className="inline-flex items-center gap-1 rounded border border-[#1e2738] bg-[#0e131d] px-2.5 py-1 text-xs text-zinc-300 transition hover:border-emerald-500/40 hover:bg-[#121926] hover:text-white"
                      title="Inspect programme ledger breakdown"
                    >
                      <Eye className="h-3 w-3 text-emerald-400" />
                      <span>Inspect</span>
                    </button>
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
