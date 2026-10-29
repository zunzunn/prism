import React from "react";
import {
  SubmissionTimelinessPoint,
  ApaarOutcomePoint,
  UtilizationDistributionPoint,
} from "@/services/analyticsService";
import { Clock, ShieldCheck, PieChart } from "lucide-react";

interface UtilizationDistributionChartProps {
  timeliness: SubmissionTimelinessPoint[];
  apaarOutcomes: ApaarOutcomePoint[];
  utilizationDistributions: UtilizationDistributionPoint[];
}

export const UtilizationDistributionChart: React.FC<
  UtilizationDistributionChartProps
> = ({ timeliness, apaarOutcomes, utilizationDistributions }) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* 1. Intake Utilization Distribution */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
            <PieChart className="h-4 w-4 text-emerald-400" />
            <span>Capacity Utilization Bracket</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">By Programme</span>
        </div>

        <div className="space-y-2 pt-1">
          {utilizationDistributions.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-300">{item.bracket}</span>
                <span className="font-bold text-white">
                  {item.count} prgs ({item.percentage}%)
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#161f2e] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, item.percentage)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. APAAR Verification Outcomes */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
            <ShieldCheck className="h-4 w-4 text-sky-400" />
            <span>APAAR Registry Outcomes</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Candidate Audit</span>
        </div>

        <div className="space-y-2 pt-1">
          {apaarOutcomes.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-300">{item.outcome}</span>
                <span className="font-bold text-white">
                  {item.percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#161f2e] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, item.percentage)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Submission Timeliness */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Submission Timeliness</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Campus Compliance</span>
        </div>

        <div className="space-y-2 pt-1">
          {timeliness.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-300">{item.status}</span>
                <span className="font-bold text-white">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#161f2e] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, item.percentage)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
