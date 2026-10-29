import React from "react";
import {
  UploadCloud,
  QrCode,
  ShieldCheck,
  Building,
  Database,
  SearchCheck,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Institution Upload",
    shortLabel: "Ingestion",
    icon: UploadCloud,
    description:
      "Institutions ingest bulk enrollment records via automated API webhooks or standardized CSV/JSON packages.",
    badge: "Input Stage",
    badgeColor: "border-[#1d273a] bg-[#111724] text-zinc-300",
  },
  {
    step: "02",
    title: "APAAR Validation",
    shortLabel: "Format Check",
    icon: QrCode,
    description:
      "Syntactic and cryptographic verification against the national 12-digit APAAR/ABC registry specifications.",
    badge: "National Standard",
    badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  {
    step: "03",
    title: "Data Quality Checks",
    shortLabel: "Quality Engine",
    icon: ShieldCheck,
    description:
      "Automated discrepancy engine scans for duplicate enrollments, identity overlaps, and historical anomalies.",
    badge: "Heuristic Rules",
    badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  {
    step: "04",
    title: "Intake Compliance",
    shortLabel: "Capacity Audit",
    icon: Building,
    description:
      "Compares total active admissions against official AICTE approved intake thresholds across branches.",
    badge: "Regulatory Gate",
    badgeColor: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  },
  {
    step: "05",
    title: "Central Registry",
    shortLabel: "Immutable Ledger",
    icon: Database,
    description:
      "Cryptographic SHA-256 seal generated and committed to the immutable credential ledger with timestamp.",
    badge: "SHA-256 Seal",
    badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  {
    step: "06",
    title: "Authorized Verification",
    shortLabel: "Query Portal",
    icon: SearchCheck,
    description:
      "Zero-latency credential verification query portal for employers, universities, and regulatory authorities.",
    badge: "Real-time Query",
    badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
];

export const WorkflowSection: React.FC = () => {
  return (
    <section id="workflow" className="relative scroll-mt-20 border-t border-[#161f2e] bg-[#07090e] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1f2838] bg-[#0c1017] px-3 py-1 text-[11px] font-mono font-medium text-emerald-400 uppercase">
            <span>End-to-End Pipeline</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            How CREDEN Verifies Academic Identity
          </h2>
          <p className="mt-2.5 text-xs text-zinc-400 sm:text-sm">
            From raw institutional admission payloads to cryptographically provable national credentials in six transparent stages.
          </p>
        </div>

        {/* Six Steps Grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="group relative flex flex-col justify-between rounded border border-[#192232] bg-[#0b0e14] p-5 transition-all duration-200 hover:border-[#28374e] hover:bg-[#0f131c]"
              >
                <div>
                  {/* Top Bar with Number and Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-zinc-400 group-hover:text-emerald-400">
                      {s.step}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.badgeColor}`}
                    >
                      {s.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="mt-4 flex items-center space-x-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#1d273a] bg-[#101521] text-zinc-300 transition group-hover:border-emerald-500/30 group-hover:text-emerald-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">
                        {s.title}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Stage {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                    {s.description}
                  </p>
                </div>

                {/* Bottom Step Indicator */}
                <div className="mt-5 flex items-center justify-between border-t border-[#151c28] pt-3 text-[11px] text-zinc-400">
                  <span className="font-mono text-[10px] text-zinc-400">
                    {s.shortLabel}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-400 group-hover:text-emerald-400">
                      <span>Next Stage</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                  {index === steps.length - 1 && (
                    <span className="font-mono text-[10px] text-emerald-400 font-medium">
                      Verification Complete
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
