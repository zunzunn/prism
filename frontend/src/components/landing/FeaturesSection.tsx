import React from "react";
import {
  Users2,
  CopyCheck,
  BarChart3,
  LockKeyhole,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassFolder } from "@/components/ui/glass-folder-cards";

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
    <section id="features" className="relative scroll-mt-20 border-t border-[#1a2538] bg-[#060709] px-4 py-24 sm:px-6 lg:px-8">
      {/* Ambient background glow behind glass cards */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-emerald-300 uppercase backdrop-blur-md">
            <span>Glassmorphic Core Architecture</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Intelligent Student Data Ecosystem
          </h2>
          <p className="mt-3 text-sm text-zinc-300 sm:text-base max-w-2xl mx-auto leading-relaxed">
            Engineered with zero-trust glassmorphism: refractive transparency, physical depth, and cryptographic verification certainty.
          </p>
        </div>

        {/* Features 2x2 Grid with GlassCard */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <GlassCard
                key={f.title}
                className="h-full border border-white/10 hover:border-emerald-500/40 transition-all duration-300"
                tint="rgba(12, 18, 30, 0.65)"
                blur={16}
                radius={22}
                rimWidth={10}
                specular={true}
                interactive={true}
              >
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center space-x-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-950/40">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {f.title}
                        </h3>
                        <p className="text-xs font-mono font-semibold text-emerald-400">
                          {f.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-zinc-300 sm:text-sm">
                      {f.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="space-y-2">
                      {f.highlights.map((h) => (
                        <div key={h} className="flex items-center space-x-2 text-xs text-zinc-200">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Glass Folder Interactive Showcase */}
        <div className="mt-28">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3.5 py-1 text-xs font-mono font-semibold text-sky-300 uppercase backdrop-blur-md">
              <FolderOpen className="h-3.5 w-3.5 text-sky-400" />
              <span>Interactive Credential Dossiers</span>
            </div>
            <h3 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              Tactile Glass Academic Dossiers
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300">
              Interactive 3D glass folders containing live verified student transcripts, intake quotas, and SHA-256 tamper-evident credentials.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-10 lg:gap-14">
            {/* Folder 1: Student Academic Dossier */}
            <div className="flex flex-col items-center">
              <GlassFolder
                label="Student Identity Dossier"
                art="aurora"
                seed={5}
                tone="dark"
                width={330}
                appearDelay={0}
                files={[
                  { name: "Degree Certificate — Validated", meta: "SHA-256 Digest", art: "aurora" },
                  { name: "Academic Transcripts", meta: "COEP Pune · Sem I-VIII", art: "glacier" },
                  { name: "APAAR ID Account Card", meta: "12-Digit Verified" },
                ]}
              />
              <span className="mt-4 text-xs font-mono font-medium text-zinc-400">
                Persona: Enrolled Student Pass
              </span>
            </div>

            {/* Folder 2: Institutional Sanctions Archive */}
            <div className="flex flex-col items-center">
              <GlassFolder
                label="Institutional Quotas"
                art="verdant"
                seed={12}
                tone="dark"
                action="more"
                labelPlacement="top-left"
                width={330}
                appearDelay={140}
                files={[
                  { name: "Sanctioned Intake Quota 2026", meta: "120 Seats · Comp. Engg", art: "verdant" },
                  { name: "Supernumerary Allotments", meta: "EWS 10% · TFW 5%", art: "dusk" },
                  { name: "AICTE Accreditation Decree", meta: "Autonomous Campus" },
                ]}
                menu={[
                  { label: "Inspect Seat Matrix" },
                  { label: "Export Regulatory Audit" },
                  { label: "Revoke Over-Quota (Simulated)", danger: true },
                ]}
              />
              <span className="mt-4 text-xs font-mono font-medium text-zinc-400">
                Persona: Campus Registrar Ledger
              </span>
            </div>

            {/* Folder 3: Tamper-Evident Verification Ledger */}
            <div className="flex flex-col items-center">
              <GlassFolder
                label="Verification Ledger"
                art="ember"
                seed={23}
                tone="dark"
                action="none"
                labelPlacement="top-right"
                width={330}
                appearDelay={280}
                files={[
                  { name: "VRF-2024-00101 Receipt", meta: "Verified Authentic", art: "ember" },
                  { name: "Digital Signature Seal", meta: "SHA-256: 0x8a1f...3b12", art: "dusk" },
                  { name: "Employer Background Report", meta: "TCS HR Campus Desk" },
                ]}
              />
              <span className="mt-4 text-xs font-mono font-medium text-zinc-400">
                Persona: Authorized Verifier Archive
              </span>
            </div>
          </div>

          <p className="mt-10 text-center font-mono text-[11px] tracking-wider text-emerald-400/90 uppercase">
            ✦ Hover to lean glass toward you · Click to open & fan documents · Press + to insert file ✦
          </p>
        </div>
      </div>
    </section>
  );
};
