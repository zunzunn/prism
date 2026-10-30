import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  KeyRound,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Building2,
} from "lucide-react";
import { verifyCredential } from "@/services/verificationService";
import { VerificationResult } from "@/types/verification";
import { GlassCard } from "@/components/ui/glass-card";
import { formatDateTime } from "@/lib/utils";

const SAMPLE_REFERENCES = [
  { ref: "VRF-2024-00101", label: "COEP Degree (Valid)" },
  { ref: "VRF-2024-00102", label: "DTU Enrolment (Valid)" },
  { ref: "VRF-2024-00103", label: "Jadavpur (Under Review)" },
];

export const QuickVerificationGlassWidget: React.FC = () => {
  const [referenceInput, setReferenceInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async (refToVerify: string) => {
    const trimmed = refToVerify.trim();
    if (!trimmed) return;
    setReferenceInput(trimmed);
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await verifyCredential(trimmed, "institution", "AICTE National Node", "Live Dashboard Rapid Audit");
      setResult(res);
    } catch {
      setErrorMsg("Failed to query verification registry for this reference token.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1424]/75 p-6 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-950/40">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Live Cryptographic Credential Verifier
              </h2>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-mono text-emerald-300 font-bold uppercase">
                Zero-Trust
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              Query opaque references (`VRF-YYYY-XXXXX`) without exposing raw APAAR biometrics.
            </p>
          </div>
        </div>

        <Link
          to="/verification"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors self-start sm:self-auto"
        >
          <span>Open Full Verification Desk</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Input Search Row & Sample Chips */}
      <div className="mt-5 space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(referenceInput);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value)}
              placeholder="Enter opaque reference (e.g. VRF-2024-00101)..."
              className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2.5 pr-4 pl-10 font-mono text-xs text-white placeholder-zinc-400 transition focus:border-emerald-500/60 focus:bg-white/[0.08] focus:outline-none backdrop-blur-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !referenceInput.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-950/40"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Verify Token</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Test Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-400" /> Demo References:
          </span>
          {SAMPLE_REFERENCES.map((sample) => (
            <button
              key={sample.ref}
              type="button"
              onClick={() => handleVerify(sample.ref)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300 transition cursor-pointer"
            >
              {sample.ref} <span className="text-zinc-500">({sample.label.split(" ")[0]})</span>
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs text-rose-300 font-mono">
          {errorMsg}
        </div>
      )}

      {/* Result Card Preview */}
      {result && (
        <div className="mt-6">
          <GlassCard
            className="border border-white/15"
            tint="rgba(9, 14, 24, 0.7)"
            blur={14}
            radius={18}
            rimWidth={8}
            specular={true}
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3 gap-2">
                <div className="flex items-center gap-2.5">
                  {result.status === "Verified Authentic" || result.status === "Corrected & Cleared" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : result.status === "Awaiting Institutional Review" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                  ) : (
                    <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                      Ledger Status
                    </span>
                    <h3 className="text-sm font-bold text-white font-mono">
                      {result.status}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 text-zinc-300">
                    Ref: <strong className="text-white">{result.reference}</strong>
                  </span>
                  <Link
                    to={`/verify/${result.reference}`}
                    className="flex items-center gap-1 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-emerald-300 hover:bg-emerald-500/25 transition"
                  >
                    <span>Full Ledger</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-[10px] text-zinc-400 uppercase">Candidate</span>
                  <p className="font-bold text-white text-sm truncate mt-0.5">{result.studentName}</p>
                  <p className="text-[10px] text-zinc-400">{result.degreeLevel}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-[10px] text-zinc-400 uppercase flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-emerald-400" /> Campus
                  </span>
                  <p className="font-semibold text-zinc-200 truncate mt-0.5">{result.institutionName}</p>
                  <p className="text-[10px] text-zinc-400">{result.institutionCode}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-[10px] text-zinc-400 uppercase">Programme & Year</span>
                  <p className="font-semibold text-zinc-200 truncate mt-0.5">{result.programmeName}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">AY {result.academicYear}</p>
                </div>
              </div>

              {/* SHA-256 Seal */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px] font-mono text-zinc-400">
                <span className="truncate max-w-xl">
                  SHA-256 Proof: <span className="text-emerald-300 select-all">{result.cryptographicProofHash}</span>
                </span>
                <span className="text-zinc-400 shrink-0">
                  Verified: {formatDateTime(result.verificationDate)}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
