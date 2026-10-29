import React from "react";
import {
  Users2,
  CopyCheck,
  BarChart3,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    title: "Student Record Management",
    subtitle: "Unified Lifecycle Data",
    icon: Users2,
    description:
      "Centralized technical education repository mapping students seamlessly to APAAR IDs, semester performance, and institution affiliations without data fragmentation.",
    highlights: [
      "Automated APAAR / ABC identity linking",
      "Historical transcript record ledger",
      "Multi-branch diploma & degree categorization",
    ],
  },
  {
    title: "Duplicate Enrolment Detection",
    subtitle: "Cross-Institutional Audit",
    icon: CopyCheck,
    description:
      "Real-time heuristic anomaly detection preventing dual admissions and ghost enrollments across public and private technical institutes nationwide.",
    highlights: [
      "Fuzzy matching & national registry checks",
      "Concurrent semester overlap flags",
      "Explainable algorithmic discrepancy scores",
    ],
  },
  {
    title: "Approved Intake Monitoring",
    subtitle: "Sanctioned Quota Oversight",
    icon: BarChart3,
    description:
      "Automated monitoring of active enrollments against official AICTE approved intake caps, safeguarding institutional accreditation compliance.",
    highlights: [
      "Real-time department seat consumption",
      "Automated over-quota violation alerts",
      "Multi-year capacity trend analytics",
    ],
  },
  {
    title: "Secure Academic Verification",
    subtitle: "Cryptographic Seal & Proof",
    icon: LockKeyhole,
    description:
      "Instant, tamper-evident degree and marksheet verification utilizing SHA-256 document hashing for employers, higher education institutions, and embassies.",
    highlights: [
      "Zero-knowledge verifiable hash checks",
      "Instant PDF/certificate validation portal",
      "Immutable timestamped audit logs",
    ],
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative scroll-mt-20 border-t border-[#161f2e] bg-[#060709] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1f2838] bg-[#0c1017] px-3 py-1 text-[11px] font-mono font-medium text-emerald-400 uppercase">
            <span>Core Capabilities</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Intelligent Student Data Ecosystem
          </h2>
          <p className="mt-2.5 text-xs text-zinc-400 sm:text-sm">
            Purpose-built for regulatory rigor, institutional transparency, and zero-trust academic credential validation.
          </p>
        </div>

        {/* Features 2x2 Grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative flex flex-col justify-between rounded border border-[#182130] bg-[#0a0d14] p-6 transition-all duration-200 hover:border-[#28374e] hover:bg-[#0e121c]"
              >
                <div>
                  <div className="flex items-center space-x-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#1e283d] bg-[#111724] text-zinc-300 transition group-hover:border-emerald-500/30 group-hover:text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">
                        {f.title}
                      </h3>
                      <p className="text-[11px] font-mono text-emerald-400">
                        {f.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-zinc-400">
                    {f.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#141b27] pt-4">
                  <div className="space-y-2">
                    {f.highlights.map((h) => (
                      <div key={h} className="flex items-center space-x-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
