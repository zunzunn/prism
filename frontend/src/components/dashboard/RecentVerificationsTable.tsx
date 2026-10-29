import React from "react";
import { VerificationAuditRecord } from "@/types";
import { truncateHash, formatDateTime } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, Clock, ArrowUpRight } from "lucide-react";

interface RecentVerificationsTableProps {
  records: VerificationAuditRecord[];
}

export const RecentVerificationsTable: React.FC<RecentVerificationsTableProps> = ({
  records,
}) => {
  return (
    <div className="rounded border border-[#1b2333] bg-[#0c1017]">
      <div className="flex items-center justify-between border-b border-[#1b2333] px-4 py-3 sm:px-5">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
            Live Academic Verifications
          </h2>
          <p className="text-[11px] text-zinc-400">
            Real-time audit log of credential checks and blockchain document hash proofs
          </p>
        </div>
        <button className="flex items-center gap-1 rounded border border-[#202a3d] bg-[#101521] px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-[#151c2c] hover:text-zinc-100">
          <span>View All Audits</span>
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#182030] bg-[#080b11] text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
            <tr>
              <th className="py-2.5 pr-3 pl-4 sm:pl-5">Student / APAAR ID</th>
              <th className="px-3 py-2.5">Institution</th>
              <th className="px-3 py-2.5">Verifier / Entity</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 font-mono">Proof Hash (SHA-256)</th>
              <th className="py-2.5 pr-4 pl-3 text-right sm:pr-5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151c2a]">
            {records.map((r) => {
              return (
                <tr
                  key={r.id}
                  className="transition-colors hover:bg-[#0f141f]"
                >
                  <td className="py-3 pr-3 pl-4 sm:pl-5">
                    <div className="font-medium text-zinc-200">
                      {r.studentName}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-400">
                      {r.apaarId}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    <div className="max-w-[220px] truncate">{r.institution}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-zinc-200">{r.requestedBy}</div>
                    <div className="text-[10px] text-zinc-400">
                      {r.verifierRole}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {r.status === "Verified" ? (
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    ) : r.status === "Flagged" ? (
                      <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                        <ShieldAlert className="h-3 w-3" />
                        Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        <Clock className="h-3 w-3" />
                        In Review
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-[11px] text-zinc-400">
                    {truncateHash(r.integrityHash, 8, 6)}
                  </td>
                  <td className="py-3 pr-4 pl-3 text-right font-mono text-[11px] text-zinc-400 sm:pr-5">
                    {formatDateTime(r.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
