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
            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
            : c.variant === "danger"
            ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
            : c.variant === "warning"
            ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
            : "border-[#1e2738] text-zinc-400 bg-[#111724]";

        return (
          <div
            key={c.label}
            className="flex flex-col justify-between rounded border border-[#182130] bg-[#0c1017] p-3.5 transition hover:border-[#2b374e]"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-medium text-zinc-400 leading-tight">
                {c.label}
              </span>
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border ${variantStyles}`}
              >
                <Icon className="h-3 w-3" />
              </div>
            </div>

            <div className="mt-2.5">
              <span className="font-mono text-xl font-bold text-zinc-100">
                {c.value}
              </span>
            </div>

            <div className="mt-2 border-t border-[#141b27] pt-1.5 text-[10px] text-zinc-400 truncate">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
