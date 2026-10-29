import React from "react";
import { ShieldCheck, Cpu, HardDrive, RefreshCw } from "lucide-react";

export const SystemStatusBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded border border-emerald-500/20 bg-gradient-to-r from-[#0a1212] via-[#091018] to-[#0a0d14] p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start space-x-3.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-zinc-100">
                CREDEN Academic Verification Engine
              </h1>
              <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-emerald-400 uppercase">
                AICTE v2.4 Active
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              Decentralized student credential verification protocol connected to National APAAR / ABC Registry.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:self-auto">
          <div className="flex items-center gap-2 rounded border border-[#1d273a] bg-[#0c1017] px-3 py-1.5 text-xs">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-zinc-400">Engine latency:</span>
            <span className="font-mono font-medium text-zinc-200">24ms</span>
          </div>

          <div className="flex items-center gap-2 rounded border border-[#1d273a] bg-[#0c1017] px-3 py-1.5 text-xs">
            <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-zinc-400">Ledger Block:</span>
            <span className="font-mono font-medium text-zinc-200">#8,941,202</span>
          </div>

          <button className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
};
