import React from "react";
import {
  Users,
  CheckCircle,
  Clock,
  AlertOctagon,
  Building2,
  TrendingUp,
} from "lucide-react";
import { SystemMetrics } from "@/types";

interface MetricsGridProps {
  metrics: SystemMetrics;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const cards = [
    {
      title: "Total Student Records",
      value: metrics.totalStudents.toLocaleString("en-IN"),
      subtext: "+1,240 enrolled this term",
      icon: Users,
      badge: "+2.4%",
      badgeType: "positive",
    },
    {
      title: "Verified Credentials",
      value: metrics.verifiedCredentials.toLocaleString("en-IN"),
      subtext: "Cryptographically verified",
      icon: CheckCircle,
      badge: `${metrics.verificationSuccessRate}% rate`,
      badgeType: "positive",
    },
    {
      title: "Pending Verifications",
      value: metrics.pendingVerifications.toLocaleString("en-IN"),
      subtext: "Avg turnaround: 2.1 hrs",
      icon: Clock,
      badge: "In Queue",
      badgeType: "neutral",
    },
    {
      title: "Integrity Discrepancies",
      value: metrics.flaggedDiscrepancies.toLocaleString("en-IN"),
      subtext: "Mismatch or altered record",
      icon: AlertOctagon,
      badge: "Flagged",
      badgeType: "danger",
    },
    {
      title: "Active Institutions",
      value: metrics.activeInstitutions.toLocaleString("en-IN"),
      subtext: "AICTE Accredited across 28 states",
      icon: Building2,
      badge: "Synced",
      badgeType: "positive",
    },
    {
      title: "Validation Throughput",
      value: "99.4%",
      subtext: "Zero-latency APAAR API sync",
      icon: TrendingUp,
      badge: "Optimal",
      badgeType: "positive",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="group relative flex flex-col justify-between rounded border border-[#1b2333] bg-[#0c1017] p-4 transition-all duration-200 hover:border-[#2b374e] hover:bg-[#0f141d]"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium tracking-tight text-zinc-400">
                {c.title}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded border border-[#1d273a] bg-[#121824] text-zinc-400 transition group-hover:text-zinc-200">
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
                {c.value}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                  c.badgeType === "positive"
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : c.badgeType === "danger"
                    ? "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                    : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {c.badge}
              </span>
            </div>

            <div className="mt-2.5 border-t border-[#161c28] pt-2 text-[11px] text-zinc-400">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
