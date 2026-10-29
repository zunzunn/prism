import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  VerifierRole,
  VerificationResult,
  VerificationReceipt,
} from "@/types/verification";
import {
  verifyCredential,
  fetchVerificationReceipt,
  isValidReferenceFormat,
} from "@/services/verificationService";
import { VerificationResultCard } from "@/components/verification/VerificationResultCard";
import { QrScannerModal } from "@/components/verification/QrScannerModal";
import { VerificationReceiptModal } from "@/components/verification/VerificationReceiptModal";
import {
  SearchCheck,
  Camera,
  Search,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";

export const VerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [referenceInput, setReferenceInput] = useState(
    searchParams.get("ref") || "VRF-2026-V8892"
  );
  const [verifierRole, setVerifierRole] = useState<VerifierRole>("employer");
  const [verifierOrg, setVerifierOrg] = useState("Corporate Background Screening");
  const [purpose, setPurpose] = useState("Pre-Employment Credential Verification");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState<VerificationReceipt | null>(
    null
  );

  const handleVerify = async (refToVerify?: string) => {
    const targetRef = (refToVerify || referenceInput).trim().toUpperCase();
    if (!targetRef) return;

    if (!isValidReferenceFormat(targetRef)) {
      setError(
        `Invalid reference format: "${targetRef}". Opaque verification references must begin with "VRF-" (e.g. VRF-2026-V8892). Student records are not publicly searchable by raw APAAR numbers.`
      );
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await verifyCredential(
        targetRef,
        verifierRole,
        verifierOrg,
        purpose
      );
      setResult(res);
      setReferenceInput(targetRef);
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError(err.message || "Credential verification query failed.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialRef = searchParams.get("ref");
    if (initialRef) {
      handleVerify(initialRef);
    } else {
      // Auto verify demo default on mount for smooth demo experience
      handleVerify("VRF-2026-V8892");
    }
  }, []);

  const handleOpenReceipt = async () => {
    if (!result) return;
    try {
      const receipt = await fetchVerificationReceipt(
        result.reference,
        verifierRole
      );
      setReceiptModalData(receipt);
    } catch (err) {
      console.error("Receipt compilation failed:", err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AICTE Academic Credential Verification Portal
            </h1>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              Live Gateway v2.4
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Authorized employer and university portal for cryptographically verifying student academic identity and degrees via secure opaque references.
          </p>
        </div>
      </div>

      {/* Query Bar & Verifier Role Selector Card */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
        {/* Verification Role & Purpose Selector */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 border-b border-[#141b27] pb-4">
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Verifier Authorization Tier
            </label>
            <select
              value={verifierRole}
              onChange={(e) => setVerifierRole(e.target.value as VerifierRole)}
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Select Verifier Authorization Role"
            >
              <option value="employer">Authorized Employer / Screener</option>
              <option value="institution">University Registrar / Admissions</option>
              <option value="public">General Public Inquiry (Restricted)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Verifier Organization
            </label>
            <input
              type="text"
              value={verifierOrg}
              onChange={(e) => setVerifierOrg(e.target.value)}
              placeholder="e.g. Microsoft Recruiting"
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Verification Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Background Screening"
              className="w-full rounded border border-[#1b2333] bg-[#090d14] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Input & Camera Scan Action Bar */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={referenceInput}
              onChange={(e) => setReferenceInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder="Enter opaque verification reference (e.g. VRF-2026-V8892)..."
              className="w-full rounded border border-[#1b2333] bg-[#080b11] py-2.5 pr-4 pl-9 font-mono text-xs text-zinc-200 placeholder-zinc-500 transition focus:border-emerald-500/60 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded border border-[#1e2738] bg-[#080b11] px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-[#121926] hover:text-white"
            title="Scan QR Code via Camera"
          >
            <Camera className="h-4 w-4 text-emerald-400" />
            <span>Scan QR Code</span>
          </button>

          <button
            onClick={() => handleVerify()}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
            ) : (
              <SearchCheck className="h-4 w-4 text-emerald-400" />
            )}
            <span>Verify Reference</span>
          </button>
        </div>

        {/* Quick Demo Reference Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
          <span className="text-zinc-400">Quick Test Cases:</span>
          <button
            onClick={() => handleVerify("VRF-2026-V8892")}
            className="rounded border border-emerald-500/30 bg-[#080b11] px-2 py-0.5 text-emerald-400 hover:bg-[#101926]"
          >
            Valid Verified Pass (COEP)
          </button>
          <button
            onClick={() => handleVerify("VRF-2026-R4109")}
            className="rounded border border-amber-500/30 bg-[#080b11] px-2 py-0.5 text-amber-300 hover:bg-[#101926]"
          >
            Awaiting Review (DTU)
          </button>
          <button
            onClick={() => handleVerify("VRF-2026-D9901")}
            className="rounded border border-sky-500/30 bg-[#080b11] px-2 py-0.5 text-sky-400 hover:bg-[#101926]"
          >
            Resolved Duplicate Cleared
          </button>
          <button
            onClick={() => handleVerify("VRF-2026-X0012")}
            className="rounded border border-rose-500/30 bg-[#080b11] px-2 py-0.5 text-rose-400 hover:bg-[#101926]"
          >
            Invalid / Revoked
          </button>
          <button
            onClick={() => handleVerify("VRF-2025-EXP99")}
            className="rounded border border-zinc-700 bg-[#080b11] px-2 py-0.5 text-zinc-400 hover:bg-[#101926]"
          >
            Expired Reference
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-2.5 rounded border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300 font-mono">
          <AlertOctagon className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider">
              Verification Query Rejected
            </span>
            <p className="leading-relaxed text-rose-200">{error}</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <VerificationResultCard
          result={result}
          onOpenReceipt={handleOpenReceipt}
        />
      )}

      {/* QR Scanner Camera Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(scannedRef) => handleVerify(scannedRef)}
      />

      {/* Verification Receipt Modal */}
      <VerificationReceiptModal
        receipt={receiptModalData}
        isOpen={Boolean(receiptModalData)}
        onClose={() => setReceiptModalData(null)}
      />
    </div>
  );
};

export default VerificationPage;
