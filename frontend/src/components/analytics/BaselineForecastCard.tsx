import React from "react";
import { BaselineForecastSummary } from "@/services/analyticsService";
import { formatNumber } from "@/lib/utils";
import { Info, TrendingUp } from "lucide-react";

interface BaselineForecastCardProps {
  forecast: BaselineForecastSummary;
}

export const BaselineForecastCard: React.FC<BaselineForecastCardProps> = ({ forecast }) => {
  const projectedYears = forecast.baselineData.filter((d) => d.isProjected);

  return (
    <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#141b27] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Enrolment Projection (Transparent Baseline Methodology)
            </h2>
            <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-300">
              Demonstration Estimate
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Standard deterministic mathematical extrapolation based on historical 3-year growth metrics.
          </p>
        </div>

        <div className="text-[11px] font-mono text-zinc-400 bg-[#080b11] px-3 py-1.5 rounded border border-[#161f2e]">
          Historical 3-Year CAGR:{" "}
          <span className="font-bold text-emerald-400">+{forecast.cagrPercentage}%</span>
        </div>
      </div>

      {/* Prominent Regulatory Transparency Notice */}
      <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase font-mono tracking-wider">
              Statistical Transparency Notice
            </span>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              {forecast.disclaimer} Method: {forecast.methodology}. Data baseline: {forecast.historicalPeriod}. Simulated baseline estimates do not incorporate demographic fertility shifts or policy moratoriums.
            </p>
          </div>
        </div>
      </div>

      {/* Projected Years Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {projectedYears.map((proj) => (
          <div
            key={proj.academicYear}
            className="rounded border border-[#1b2537] bg-[#080b11] p-4 space-y-2"
          >
            <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
              <span className="font-mono text-xs font-bold text-zinc-100">
                AY {proj.academicYear}
              </span>
              <span className="rounded border border-[#1f2c40] bg-[#0c121d] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                Projected Estimate
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
              <div className="rounded bg-[#0c1017] p-2 border border-[#131924]">
                <div className="text-[10px] text-zinc-400 uppercase">
                  Projected Intake
                </div>
                <div className="text-sm font-bold text-zinc-200 mt-0.5">
                  {formatNumber(proj.approvedIntake)}
                </div>
              </div>

              <div className="rounded bg-[#0c1017] p-2 border border-[#131924]">
                <div className="text-[10px] text-zinc-400 uppercase">
                  Projected Enrolment
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {formatNumber(proj.reportedEnrolment)}
                </div>
              </div>

              <div className="rounded bg-[#0c1017] p-2 border border-[#131924]">
                <div className="text-[10px] text-zinc-400 uppercase">
                  Est. Utilization
                </div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">
                  {proj.utilizationRate}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
