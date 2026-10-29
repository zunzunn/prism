import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon, ArrowUpRight } from "lucide-react";

export interface MetricCardConfig {
  id: string;
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  targetRoute: string;
  badge?: string;
  statusVariant?: "positive" | "warning" | "danger" | "neutral";
}

interface GovernanceMetricCardProps {
  card: MetricCardConfig;
}

export const GovernanceMetricCard: React.FC<GovernanceMetricCardProps> = ({
  card,
}) => {
  const Icon = card.icon;

  const getVariantStyles = () => {
    switch (card.statusVariant) {
      case "positive":
        return {
          badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
          iconContainer: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
          hoverBorder: "hover:border-emerald-500/40",
        };
      case "danger":
        return {
          badge: "border-rose-500/30 bg-rose-500/10 text-rose-400",
          iconContainer: "border-rose-500/20 bg-rose-500/10 text-rose-400",
          hoverBorder: "hover:border-rose-500/40",
        };
      case "warning":
        return {
          badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
          iconContainer: "border-amber-500/20 bg-amber-500/10 text-amber-400",
          hoverBorder: "hover:border-amber-500/40",
        };
      case "neutral":
      default:
        return {
          badge: "border-[#1f2838] bg-[#111724] text-zinc-400",
          iconContainer: "border-[#1e2738] bg-[#111622] text-zinc-300",
          hoverBorder: "hover:border-[#2b374e]",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Link
      to={card.targetRoute}
      className={`group relative flex flex-col justify-between rounded border border-[#182130] bg-[#0c1017] p-4 transition-all duration-200 hover:bg-[#0f141f] ${styles.hoverBorder} focus:outline-none focus:ring-1 focus:ring-zinc-600`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium tracking-tight text-zinc-400 group-hover:text-zinc-300">
          {card.label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded border transition ${styles.iconContainer}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Metric Main Number */}
      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
          {typeof card.value === "number"
            ? card.value.toLocaleString("en-IN")
            : card.value}
        </span>
        {card.badge && (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles.badge}`}
          >
            {card.badge}
          </span>
        )}
      </div>

      {/* Subtext and Quick Arrow */}
      <div className="mt-2.5 flex items-center justify-between border-t border-[#151c28] pt-2 text-[11px] text-zinc-400">
        <span className="truncate pr-2">{card.subtext}</span>
        <ArrowUpRight className="h-3 w-3 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-200" />
      </div>
    </Link>
  );
};
