import React from "react";
import { VerificationResult } from "@/types/verification";
import { formatDateTime } from "@/lib/utils";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Lock,
  Download,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface VerificationResultCardProps {
  result: VerificationResult;
  onOpenReceipt: () => void;
}

export const VerificationResultCard: React.FC<VerificationResultCardProps> = ({
  result,
  onOpenReceipt,
}) => {
  const isVerified = result.status === "Verified Authentic" || result.status === "Corrected & Cleared";
  const isAwaiting = result.status === "Awaiting Institutional Review";
  const isExpired = result.status === "Expired Reference" || result.isExpired;
  const isInvalid = result.status === "Invalid / Revoked";

  return (
    <GlassCard
      className="border border-white/10 shadow-2xl transition-all"
      tint="rgba(11, 16, 26, 0.75)"
      blur={18}
      radius={24}
      rimWidth={12}
      specular={true}
      interactive={true}
    >
      <div className="space-y-5">
      {/* Status Header Banner */}
      <div
        className={`rounded border p-4 text-xs ${
          isVerified
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : isAwaiting
            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
            : isExpired
            ? "border-zinc-700 bg-zinc-800/60 text-zinc-300"
            : "border-rose-500/30 bg-rose-500/10 text-rose-300"
        }`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {isVerified && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
            {isAwaiting && <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />}
            {isExpired && <AlertOctagon className="h-5 w-5 text-zinc-400 shrink-0" />}
            {isInvalid && <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0" />}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Verification Ledger Outcome
              </div>
              <div className="text-base font-bold font-mono uppercase">
                {result.status}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded border border-[#1e2738] bg-[#0c1017] px-2.5 py-1 font-mono text-[10px] text-zinc-300">
              Ref: <span className="font-bold text-white">{result.reference}</span>
            </span>
            <span className="rounded border border-[#1e2738] bg-[#0c1017] px-2.5 py-1 font-mono text-[10px] text-zinc-300 uppercase">
              Role: <span className="text-emerald-400 font-bold">{result.verifierRole}</span>
            </span>
          </div>
        </div>

        {/* Disclaimer subtext */}
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-300">
          {result.demoDisclaimer}
        </p>
      </div>

      {/* Main Attributes Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left Column: Academic Credentials */}
        <div className="rounded border border-[#161c28] bg-[#080b11] p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-[#141b27] pb-2 text-zinc-200 font-bold uppercase font-mono">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span>Academic Credential Profile</span>
          </div>

          <div className="space-y-2 font-mono">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Candidate Name:</span>
              <div className="font-semibold text-sm text-white">{result.studentName}</div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Issuing Institution:</span>
              <div className="text-zinc-200 font-medium">{result.institutionName}</div>
              <div className="text-[10px] text-zinc-400">AICTE Code: {result.institutionCode}</div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Programme & Degree:</span>
              <div className="text-zinc-200">{result.programmeName}</div>
              <div className="text-[10px] text-zinc-400">{result.degreeLevel} • AY {result.academicYear}</div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Verification Registry Timestamp:</span>
              <div className="text-zinc-300">{formatDateTime(result.verificationDate)}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Role-Permitted Fields & Access Control */}
        <div className="rounded border border-[#161c28] bg-[#080b11] p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
            <div className="flex items-center gap-2 text-zinc-200 font-bold uppercase font-mono">
              <Lock className="h-4 w-4 text-sky-400" />
              <span>Role-Permitted Disclosures</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Access Tier: {result.verifierRole}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {Object.entries(result.permittedFields).map(([key, val]) => (
              <div
                key={key}
                className="flex items-center justify-between py-1 border-b border-[#111724]"
              >
                <span className="text-zinc-400 text-[11px] capitalize">
                  {key.replace(/_/g, " ")}:
                </span>
                <span className="text-zinc-200 font-medium text-right max-w-[200px] truncate">
                  {String(val || "N/A")}
                </span>
              </div>
            ))}

            <div className="rounded border border-[#182333] bg-[#0a0e16] p-2 text-[10px] text-zinc-400 space-y-1">
              <span className="text-emerald-400 font-bold">Privacy Guard: </span>
              <span>
                Raw APAAR IDs, caste category certificates, and student biometric records are securely masked under AICTE data privacy mandates.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cryptographic Proof Digest */}
      <div className="rounded border border-[#161c28] bg-[#080b11] p-3.5 space-y-1 text-xs font-mono">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[10px] uppercase">Cryptographic Integrity Hash (SHA-256):</span>
          <span className="text-[10px] text-emerald-400">Immutable Proof</span>
        </div>
        <div className="text-[11px] text-emerald-300 break-all select-all">
          {result.cryptographicProofHash}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-[#141b27] pt-4">
        <div className="text-[11px] font-mono text-zinc-400">
          Issuing Authority: <span className="text-zinc-200">{result.issuingAuthority}</span>
        </div>

        <button
          onClick={onOpenReceipt}
          className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
        >
          <Download className="h-4 w-4 text-emerald-400" />
          <span>Download Verification Receipt</span>
        </button>
      </div>
      </div>
    </GlassCard>
  );
};
