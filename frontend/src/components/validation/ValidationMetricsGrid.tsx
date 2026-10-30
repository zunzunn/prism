import React from "react";
import { ValidationMetrics } from "@/types/validation";
import {
  FileCheck2,
  CheckCircle,
  AlertOctagon,
  Clock,
  Copy,
  Scale,
} from "lucide-react";

interface ValidationMetricsGridProps {
  metrics: ValidationMetrics;
}

export const ValidationMetricsGrid: React.FC<ValidationMetricsGridProps> = ({
  metrics,
}) => {
  const cards = [
    {
      label: "Total Records Evaluated",
      value: metrics.totalRecordsEvaluated.toLocaleString("en-IN"),
      subtext: "Deterministic schema & quota runs",
      icon: FileCheck2,
      variant: "neutral",
    },
    {
      label: "Valid Records",
      value: metrics.validRecords.toLocaleString("en-IN"),
      subtext: "Fully compliant across all 4 rule sets",
      icon: CheckCircle,
      variant: "positive",
    },
    {
      label: "Invalid Records",
      value: metrics.invalidRecords.toLocaleString("en-IN"),
      subtext: "Critical format or constraint failures",
      icon: AlertOctagon,
      variant: "danger",
    },
    {
      label: "Records Requiring Review",
      value: metrics.recordsRequiringReview.toLocaleString("en-IN"),
      subtext: "Ambiguous supernumerary or nodal gaps",
      icon: Clock,
      variant: "warning",
    },
    {
      label: "Potential Duplicate Enrolments",
      value: metrics.potentialDuplicateEnrolments.toLocaleString("en-IN"),
      subtext: "Cross-campus & intra-institute overlaps",
      icon: Copy,
      variant: "danger",
    },
    {
      label: "Intake Compliance Alerts",
      value: metrics.intakeComplianceAlerts.toLocaleString("en-IN"),
      subtext: "Sanctioned quota threshold reviews",
      icon: Scale,
      variant: "warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => {
        const Icon = c.icon;
        const variantStyles =
          c.variant === "positive"
            ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/15"
            : c.variant === "danger"
            ? "border-rose-500/40 text-rose-300 bg-rose-500/15"
            : c.variant === "warning"
            ? "border-amber-500/40 text-amber-300 bg-amber-500/15"
            : "border-white/10 text-zinc-300 bg-white/[0.05]";

        return (
          <div
            key={c.label}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c1424]/75 p-4 backdrop-blur-xl shadow-lg transition hover:border-emerald-500/40"
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-[11px] font-medium text-zinc-300 leading-tight">
                {c.label}
              </span>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${variantStyles}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="mt-3">
              <span className="font-mono text-xl font-bold text-white">
                {c.value}
              </span>
            </div>

            <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-zinc-400 truncate">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
