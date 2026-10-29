import React from "react";
import { AuditActivityRecord } from "@/types/governance";
import { formatDateTime } from "@/lib/utils";
import { Activity, Terminal } from "lucide-react";

interface AuditActivityFeedProps {
  activities: AuditActivityRecord[];
}

export const AuditActivityFeed: React.FC<AuditActivityFeedProps> = ({
  activities,
}) => {
  return (
    <div className="rounded border border-[#182130] bg-[#0c1017]">
      <div className="flex items-center justify-between border-b border-[#161c28] px-4 py-3.5 sm:px-5">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-[#1f2838] bg-[#111722] text-emerald-400">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100">
              National AICTE Governance Audit Trail
            </h3>
            <p className="text-[11px] text-zinc-400">
              Cryptographically signed audit log of policy events & verification queries
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          LEDGER LIVE
        </span>
      </div>

      <div className="divide-y divide-[#141b27]">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 transition-colors hover:bg-[#0f141f] gap-3"
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#1e2738] bg-[#101520] text-zinc-400">
                <Terminal className="h-3 w-3 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200">
                    {act.action}
                  </span>
                  <span className="rounded border border-[#1f2838] bg-[#111622] px-1.5 py-0.2 text-[9px] font-mono text-zinc-400">
                    {act.role}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">{act.details}</p>
                <div className="mt-1 font-mono text-[10px] text-zinc-400">
                  By: <span className="text-zinc-300">{act.actor}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="block font-mono text-[11px] text-zinc-400">
                {formatDateTime(act.timestamp)}
              </span>
              <span className="block font-mono text-[10px] text-emerald-400/80">
                Hash: {act.hash}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
