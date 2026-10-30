import React from "react";
import { IntakeUtilizationSummary } from "@/types/governance";
import { Scale, Info } from "lucide-react";

interface IntakeUtilizationPanelProps {
  data: IntakeUtilizationSummary;
  selectedState?: string;
}

export const IntakeUtilizationPanel: React.FC<IntakeUtilizationPanelProps> = ({
  data,
  selectedState = "National",
}) => {
  const isHighUtilization = data.utilizationRate >= 98.0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1424]/75 p-6 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]">
      {/* Header with Title and Demo Tag */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-950/40">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                {selectedState === "All States / UTs" ? "National" : selectedState}{" "}
                Intake Utilization
              </h2>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                Demo Data
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Approved AICTE institutional capacity vs reported student enrollments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
            <span className="text-zinc-400">Sanctioned:</span>
            <span className="font-semibold text-zinc-200">
              {data.approvedCapacity.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]"></span>
            <span className="text-zinc-400">Enrolled:</span>
            <span className="font-semibold text-zinc-200">
              {data.enrolled.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md transition hover:border-emerald-500/30">
          <span className="text-[11px] text-zinc-400">Total Enrolled vs Capacity</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-bold text-white">
              {data.enrolled.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              / {data.approvedCapacity.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">Sanctioned technical seats</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md transition hover:border-emerald-500/30">
          <span className="text-[11px] text-zinc-400">National Utilization Rate</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`font-mono text-lg font-bold ${
                isHighUtilization ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {data.utilizationRate.toFixed(1)}%
            </span>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono text-emerald-300 font-bold uppercase">
              Balanced
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">Across active programs</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md transition hover:border-emerald-500/30">
          <span className="text-[11px] text-zinc-400">Sanctioned Seats Remaining</span>
          <div className="mt-1">
            <span className="font-mono text-lg font-bold text-zinc-100">
              {data.sanctionedSeatsRemaining.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">Available vacancy margin</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md transition hover:border-sky-500/30">
          <span className="text-[11px] text-zinc-400">Supernumerary Quotas</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-bold text-sky-400">
              {data.supernumeraryEnrolled.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              / {data.supernumeraryApproved.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">EWS, TFW & PMSSS quotas</span>
        </div>
      </div>

      {/* Visual Capacity Utilization Bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
          <span className="font-mono text-[11px]">Seat Allocation Distribution</span>
          <span className="font-mono text-[11px] text-emerald-400">
            {data.utilizationRate.toFixed(1)}% Capacity Filled
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded bg-black/40 flex border border-white/5">
          <div
            style={{ width: `${Math.min(data.utilizationRate, 100)}%` }}
            className={`h-full transition-all duration-500 ${
              isHighUtilization ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
          <div
            style={{
              width: `${Math.max(100 - data.utilizationRate, 0)}%`,
            }}
            className="h-full bg-white/10"
          />
        </div>
      </div>

      {/* Regulatory Context Note */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-sky-400/20 bg-sky-500/[0.06] p-3 text-[11px] text-zinc-300 backdrop-blur-md">
        <Info className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-sky-200">Regulatory Oversight Note:</strong> Total
          capacity metrics must not be interpreted as a simplistic violation threshold.
          AICTE compliance protocols strictly accommodate permitted supernumerary
          allocations (e.g. Economically Weaker Section 10%, Tuition Fee Waiver 5%,
          PMSSS, and NRI quotas) beyond basic sanctioned strength.
        </p>
      </div>
    </div>
  );
};
