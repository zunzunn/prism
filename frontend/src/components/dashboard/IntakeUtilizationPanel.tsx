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
    <div className="relative overflow-hidden rounded border border-[#192333] bg-[#0c1017] p-5">
      {/* Header with Title and Demo Tag */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#161c28] pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-[#202b3e] bg-[#111722] text-emerald-400">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">
                {selectedState === "All States / UTs" ? "National" : selectedState}{" "}
                Intake Utilization
              </h2>
              <span className="rounded border border-[#222c3f] bg-[#101520] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                Demo Data
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Approved AICTE institutional capacity vs reported student enrollments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-zinc-400">Sanctioned:</span>
            <span className="font-semibold text-zinc-200">
              {data.approvedCapacity.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-400"></span>
            <span className="text-zinc-400">Enrolled:</span>
            <span className="font-semibold text-zinc-200">
              {data.enrolled.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded border border-[#171f2d] bg-[#090d14] p-3">
          <span className="text-[11px] text-zinc-400">Total Enrolled vs Capacity</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-lg font-bold text-zinc-100">
              {data.enrolled.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              / {data.approvedCapacity.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">Sanctioned technical seats</span>
        </div>

        <div className="rounded border border-[#171f2d] bg-[#090d14] p-3">
          <span className="text-[11px] text-zinc-400">National Utilization Rate</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`font-mono text-lg font-bold ${
                isHighUtilization ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {data.utilizationRate.toFixed(1)}%
            </span>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400 uppercase">
              Balanced
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">Across active programs</span>
        </div>

        <div className="rounded border border-[#171f2d] bg-[#090d14] p-3">
          <span className="text-[11px] text-zinc-400">Sanctioned Seats Remaining</span>
          <div className="mt-1">
            <span className="font-mono text-lg font-bold text-zinc-200">
              {data.sanctionedSeatsRemaining.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">Available vacancy margin</span>
        </div>

        <div className="rounded border border-[#171f2d] bg-[#090d14] p-3">
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
        <div className="h-2.5 w-full overflow-hidden rounded bg-[#161c28] flex">
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
            className="h-full bg-[#20293b]"
          />
        </div>
      </div>

      {/* Regulatory Context Note */}
      <div className="mt-4 flex items-start gap-2 rounded border border-[#182132] bg-[#080b11] p-2.5 text-[11px] text-zinc-400">
        <Info className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-zinc-300">Regulatory Oversight Note:</strong> Total
          capacity metrics must not be interpreted as a simplistic violation threshold.
          AICTE compliance protocols strictly accommodate permitted supernumerary
          allocations (e.g. Economically Weaker Section 10%, Tuition Fee Waiver 5%,
          PMSSS, and NRI quotas) beyond basic sanctioned strength.
        </p>
      </div>
    </div>
  );
};
