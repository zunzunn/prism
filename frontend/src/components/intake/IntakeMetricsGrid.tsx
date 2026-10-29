import React from "react";
import { IntakeOverviewMetrics } from "@/types/intake";
import { formatNumber } from "@/lib/utils";
import {
  Scale,
  Users,
  Percent,
  Layers,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
} from "lucide-react";

interface IntakeMetricsGridProps {
  metrics: IntakeOverviewMetrics;
}

export const IntakeMetricsGrid: React.FC<IntakeMetricsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {/* 1. Total Approved Intake */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-3.5 space-y-1">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Approved Intake
          </span>
          <Scale className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="text-xl font-bold font-mono text-white">
          {formatNumber(metrics.totalApprovedIntake)}
        </div>
        <p className="text-[10px] text-zinc-400 font-mono">
          Base sanctioned seats
        </p>
      </div>

      {/* 2. Reported Enrolment */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-3.5 space-y-1">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Reported Enrolment
          </span>
          <Users className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="text-xl font-bold font-mono text-emerald-400">
          {formatNumber(metrics.totalReportedEnrolment)}
        </div>
        <p className="text-[10px] text-zinc-400 font-mono">
          Total admitted students
        </p>
      </div>

      {/* 3. Regular Utilization */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-3.5 space-y-1">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Regular Utilization
          </span>
          <Percent className="h-4 w-4 text-sky-400" />
        </div>
        <div className="text-xl font-bold font-mono text-sky-400">
          {metrics.overallRegularUtilizationRate}%
        </div>
        <p className="text-[10px] text-zinc-400 font-mono">
          Enrolment vs base capacity
        </p>
      </div>

      {/* 4. Supernumerary Seats */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-3.5 space-y-1">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Supernumerary Quotas
          </span>
          <Layers className="h-4 w-4 text-amber-400" />
        </div>
        <div className="text-xl font-bold font-mono text-amber-300">
          {formatNumber(metrics.totalSupernumeraryEnrolled)} / {formatNumber(metrics.totalSupernumeraryApproved)}
        </div>
        <p className="text-[10px] text-zinc-400 font-mono">
          EWS, TFW, PMSSS seats
        </p>
      </div>

      {/* 5. Remaining Capacity */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-3.5 space-y-1">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Remaining Capacity
          </span>
          <CheckCircle2 className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="text-xl font-bold font-mono text-zinc-200">
          {formatNumber(metrics.totalRemainingCapacity)}
        </div>
        <p className="text-[10px] text-zinc-400 font-mono">
          Available headroom
        </p>
      </div>

      {/* 6. Institutions Requiring Review */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-3.5 space-y-1">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Requires Review
          </span>
          <HelpCircle className="h-4 w-4 text-amber-400" />
        </div>
        <div className="text-xl font-bold font-mono text-amber-400">
          {metrics.institutionsRequiringReviewCount}
        </div>
        <p className="text-[10px] text-zinc-400 font-mono">
          Unconfigured quota policy
        </p>
      </div>

      {/* 7. Programmes with Violations */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-3.5 space-y-1 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-mono uppercase tracking-wider">
            Over-Capacity Alert
          </span>
          <AlertOctagon className="h-4 w-4 text-rose-400" />
        </div>
        <div className="text-xl font-bold font-mono text-rose-400">
          {metrics.programmesWithViolationsCount}
        </div>
        <p className="text-[10px] text-zinc-400 font-mono">
          Exceeds total allowed
        </p>
      </div>
    </div>
  );
};
