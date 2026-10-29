import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building,
  Users,
  SearchCheck,
  Scale,
  FileCheck2,
  FileText,
  Copy,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

interface StepGuide {
  step: number;
  title: string;
  route: string;
  role: "AICTE Admin" | "Institution Admin" | "Student" | "Authorized Verifier";
  icon: any;
  summary: string;
  talkingPoints: string[];
  testRecords?: { label: string; ref: string; note: string }[];
  actionLinkText: string;
}

const DEMO_STEPS: StepGuide[] = [
  {
    step: 1,
    title: "Public Landing Page & 3D Academic Identity Network",
    route: "/",
    role: "AICTE Admin",
    icon: ShieldCheck,
    summary:
      "Present CREDEN's mission of unified academic trust, showcasing the interactive 3D particle identity network, APAAR format validation, and intake compliance metrics.",
    talkingPoints: [
      "Highlight the dark futuristic enterprise aesthetic designed for high-stakes governance.",
      "Explain the 3 core pillars: APAAR Format Validation, Explainable Duplicate Detection, and Approved Intake Monitoring.",
      "Showcase the non-blocking Three.js identity network representing connected technical institutions across India.",
    ],
    actionLinkText: "View Landing Page",
  },
  {
    step: 2,
    title: "AICTE National Academic Governance Dashboard",
    route: "/dashboard",
    role: "AICTE Admin",
    icon: Building,
    summary:
      "Examine high-level statutory KPIs, state-wise intake utilization, duplicate detection alerts, and validation health breakdown across 3,824 technical institutions.",
    talkingPoints: [
      "Point to the national utilization rate: 1,522,000 enrolled / 1,600,000 approved capacity = 95.1% utilization.",
      "Demonstrate filtering by state (e.g. Maharashtra, Karnataka) and observation of localized metrics.",
      "Explain the explainable discrepancy alert feed and live recent verification queries.",
    ],
    actionLinkText: "Open Governance Dashboard",
  },
  {
    step: 3,
    title: "Institution Administrator Persona & CSV Batch Ingestion",
    route: "/students?institution=COEP",
    role: "Institution Admin",
    icon: Users,
    summary:
      "Switch to the Institution Admin persona (COEP Pune node 1-332901124), inspect campus-scoped students, and execute server-side CSV batch ingestion.",
    talkingPoints: [
      "Demonstrate the simulated Role Switcher in the top bar adapting the UI to the COEP institutional node.",
      "Open 'Import Student CSV', download the official AICTE template, and upload a batch.",
      "Show how server-side FastAPI validation diagnoses valid records, invalid APAAR lengths, and intra-batch duplicates.",
      "Verify that validated students immediately append to the registry table.",
    ],
    testRecords: [
      { label: "Valid Enrolment", ref: "982344129011", note: "Aarav Sharma (COEP CS)" },
      { label: "Format Error Row", ref: "INVALID-APAAR", note: "Rejects with 12-digit requirement" },
      { label: "Batch Roll Collision", ref: "COEP/2026/CS/042", note: "Flags duplicate roll in same batch" },
    ],
    actionLinkText: "Open Student Registry (COEP)",
  },
  {
    step: 4,
    title: "Validation Center & Explainable Discrepancy Triaging",
    route: "/validation",
    role: "AICTE Admin",
    icon: FileCheck2,
    summary:
      "Review explainable validation findings, inspect multi-signal duplicate conflicts, and simulate official administrative resolution workflows.",
    talkingPoints: [
      "Explain that duplicate matches are never treated as automatic proof of fraud; they undergo evidence triaging.",
      "Inspect cross-institutional duplicate flags (e.g. concurrent active enrollment between COEP and VJTI).",
      "Demonstrate official actions: Request Institutional Explanation, Dismiss with Reason, or Resolve Discrepancy.",
      "Show that all triaging actions write to an immutable audit trail.",
    ],
    actionLinkText: "Open Validation Center",
  },
  {
    step: 5,
    title: "Academic Intake Monitoring & Supernumerary Seat Adjustments",
    route: "/intake",
    role: "AICTE Admin",
    icon: Scale,
    summary:
      "Monitor statutory approved capacity vs reported enrolment with transparent mathematical denominators that correctly account for EWS (10%), TFW (5%), and PMSSS quotas.",
    talkingPoints: [
      "Explain the denominator formula: Base Approved Intake + Permitted Supernumerary Quotas.",
      "Demonstrate why admissions exceeding regular intake are NOT falsely flagged as violations if within approved supernumerary caps.",
      "Point out that missing policy parameters safely trigger 'Requires Review' rather than fabricating regulatory sanctions.",
    ],
    actionLinkText: "Open Intake Monitoring",
  },
  {
    step: 6,
    title: "Institutional Management & Compliance Deep Dive",
    route: "/institutions",
    role: "AICTE Admin",
    icon: Building,
    summary:
      "Inspect 12 technical institutions across states, examine detailed program breakdowns, accreditation status, and submission histories.",
    talkingPoints: [
      "Navigate to College of Engineering, Pune (COEP) [1-332901124] to view program allocations and supernumerary caps.",
      "Compare state autonomous, government-aided, and private institutions under unified AICTE oversight.",
    ],
    actionLinkText: "Inspect Institutions",
  },
  {
    step: 7,
    title: "Authorized Academic Verification Portal & Opaque References",
    route: "/verification",
    role: "Authorized Verifier",
    icon: SearchCheck,
    summary:
      "Demonstrate credential verification for background screeners and universities with role-based attribute restrictions and privacy guarantees.",
    talkingPoints: [
      "Emphasize that student records are NEVER publicly searchable by raw APAAR IDs.",
      "Test opaque references (VRF-2026-V8892, VRF-2026-R4109, VRF-2026-D9901, VRF-2026-X0012, VRF-2025-EXP99).",
      "Show how Employer vs Registrar vs Public roles reveal strictly permitted fields.",
      "Generate and download the cryptographically signed official verification receipt with SHA-256 seal.",
    ],
    testRecords: [
      { label: "Valid Verified", ref: "VRF-2026-V8892", note: "Authentic Degree (COEP)" },
      { label: "Awaiting Review", ref: "VRF-2026-R4109", note: "Dual-enrolment clearance pending (DTU)" },
      { label: "Corrected Duplicate", ref: "VRF-2026-D9901", note: "Cleared via State DTE order (COEP)" },
      { label: "Invalid / Revoked", ref: "VRF-2026-X0012", note: "Unapproved programme exceeding intake" },
      { label: "Expired Pass", ref: "VRF-2025-EXP99", note: "Verification window lapsed (PSG Tech)" },
    ],
    actionLinkText: "Open Verification Gateway",
  },
  {
    step: 8,
    title: "Student Academic Identity Self-Service Portal",
    route: "/student",
    role: "Student",
    icon: Users,
    summary:
      "Log in as student Aarav Sharma (STU-001) to view masked APAAR identity, resolve correction requests, generate QR credential pass, and inspect transparency audit ledger.",
    talkingPoints: [
      "Notice that APAAR ID remains masked (98••-••••-9011) to safeguard student privacy.",
      "Generate dynamic QR Credential Pass containing strictly the controlled verification route URL.",
      "Copy verification URL and download PNG Credential Pass.",
      "View transparency ledger showing every background screening firm that queried their credentials.",
    ],
    actionLinkText: "Open Student Portal",
  },
  {
    step: 9,
    title: "Statutory Reports & Immutable Audit Logs Ledger",
    route: "/reports",
    role: "AICTE Admin",
    icon: FileText,
    summary:
      "Export RFC-4180 compliant statutory CSV reports and inspect the tamper-evident cryptographic access audit ledger.",
    talkingPoints: [
      "Select statutory templates (Intake Compliance Audit, Discrepancy Reconciliation, Institutional Census).",
      "Export CSV and inspect formal AICTE metadata header comments and RFC-4180 cell escaping.",
      "Navigate to Audit Logs (/compliance) to review zero-PII security logging with hashed client IPs and SHA-256 seals.",
    ],
    actionLinkText: "Open Statutory Reports",
  },
];

export const DemoGuidePage: React.FC = () => {
  const { setRole } = useRole();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              CREDEN Hackathon Interactive Demonstration Guide
            </h1>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              Demo Script v2.4
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Step-by-step walkthrough sequence for presenting CREDEN to judges, evaluating governance flows, and testing synthetic scenarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
          >
            <span>Begin Demo Flow</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Presentation Best Practices Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded border border-[#1a2333] bg-[#090d14] p-3 text-xs">
          <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block mb-1">
            01. Privacy Guardrails
          </span>
          <p className="text-zinc-400">
            Raw APAAR IDs are never exposed in verification portals or QR payloads. Only opaque references (VRF-*) are queryable.
          </p>
        </div>
        <div className="rounded border border-[#1a2333] bg-[#090d14] p-3 text-xs">
          <span className="font-mono text-[10px] text-sky-400 uppercase font-bold block mb-1">
            02. Role Adaptability
          </span>
          <p className="text-zinc-400">
            Use the Quick Role Switcher in the top bar to swap between AICTE Admin, Institution Admin (COEP), Student, and Verifier.
          </p>
        </div>
        <div className="rounded border border-[#1a2333] bg-[#090d14] p-3 text-xs">
          <span className="font-mono text-[10px] text-amber-400 uppercase font-bold block mb-1">
            03. Deterministic Data
          </span>
          <p className="text-zinc-400">
            All 12 institutions, intake charts, and validation engines use consistent, mutually agreeing numbers without random drift.
          </p>
        </div>
      </div>

      {/* Step by Step Timeline */}
      <div className="space-y-4">
        {DEMO_STEPS.map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.step}
              className="rounded border border-[#182130] bg-[#0c1017] p-5 transition hover:border-[#222e44]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#1f2b3e] bg-[#101622] font-mono text-xs font-bold text-emerald-400">
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-100">{step.title}</h3>
                      <button
                        onClick={() => setRole(step.role)}
                        className="rounded border border-[#1b2536] bg-[#080c14] px-1.5 py-0.5 font-mono text-[9px] text-zinc-400 hover:text-white"
                        title="Click to switch persona"
                      >
                        Persona: {step.role}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                      {step.summary}
                    </p>
                  </div>
                </div>

                <Link
                  to={step.route}
                  onClick={() => setRole(step.role)}
                  className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-400 hover:bg-emerald-500/20 shrink-0 self-start"
                >
                  <span>{step.actionLinkText}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* Key Talking Points */}
              <div className="mt-3.5 border-t border-[#141b27] pt-3">
                <span className="font-mono text-[10px] uppercase text-zinc-500 block mb-1.5">
                  Key Demo Talking Points:
                </span>
                <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                  {step.talkingPoints.map((tp, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {tp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Test Scenario Pills if available */}
              {step.testRecords && (
                <div className="mt-3 border-t border-[#141b27] pt-3">
                  <span className="font-mono text-[10px] uppercase text-zinc-500 block mb-1.5">
                    Clickable Synthetic Test Records:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {step.testRecords.map((t) => (
                      <div
                        key={t.ref}
                        className="flex items-center gap-2 rounded border border-[#1c2738] bg-[#090d14] px-2.5 py-1 text-xs"
                      >
                        <span className="font-semibold text-zinc-300">{t.label}:</span>
                        <code className="font-mono text-emerald-400 text-[11px]">
                          {t.ref}
                        </code>
                        <span className="text-zinc-500 text-[11px]">({t.note})</span>
                        <button
                          onClick={() => copyToClipboard(t.ref)}
                          title="Copy reference"
                          aria-label={`Copy reference ${t.ref}`}
                          className="text-zinc-500 hover:text-zinc-200 transition"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        {step.route.includes("verification") && (
                          <Link
                            to={`/verification?ref=${t.ref}`}
                            className="text-[10px] font-mono text-sky-400 hover:underline"
                          >
                            Verify →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DemoGuidePage;
