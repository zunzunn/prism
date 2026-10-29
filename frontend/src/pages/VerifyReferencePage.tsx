import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { VerificationReceiptModal } from "@/components/verification/VerificationReceiptModal";
import {
  ArrowLeft,
  AlertOctagon,
  RefreshCw,
  QrCode,
} from "lucide-react";

export const VerifyReferencePage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [role, setRole] = useState<VerifierRole>("employer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [receiptModalData, setReceiptModalData] = useState<VerificationReceipt | null>(
    null
  );

  const loadVerification = async (currentRole: VerifierRole) => {
    if (!reference) return;

    if (!isValidReferenceFormat(reference)) {
      setError(
        `Invalid reference format: "${reference}". References must be opaque identifiers (e.g. VRF-2026-V8892). Student records are not publicly searchable by raw APAAR numbers.`
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await verifyCredential(
        reference,
        currentRole,
        "QR Pass Verifier",
        "QR Credential Inspection"
      );
      setResult(res);
    } catch (err: any) {
      console.error("Controlled verification query failed:", err);
      setError(err.message || "Failed to verify credential reference.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerification(role);
  }, [reference, role]);

  const handleOpenReceipt = async () => {
    if (!result) return;
    try {
      const receipt = await fetchVerificationReceipt(result.reference, role);
      setReceiptModalData(receipt);
    } catch (err) {
      console.error("Failed to load receipt:", err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b border-[#182130] pb-4">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <Link
            to="/verification"
            className="flex items-center gap-1 text-zinc-400 transition hover:text-emerald-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Verification Portal</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400">QR Credential Inspection</span>
          <span className="text-zinc-600">/</span>
          <span className="font-bold text-emerald-400">{reference}</span>
        </div>

        <div className="flex items-center gap-1.5 rounded border border-[#1e2738] bg-[#0c1017] px-2.5 py-1 text-[11px] font-mono text-zinc-300">
          <QrCode className="h-3.5 w-3.5 text-emerald-400" />
          <span>QR Scanned Pass</span>
        </div>
      </div>

      {/* Role Access Level Toggle */}
      <div className="flex flex-col gap-3 rounded border border-[#182130] bg-[#0c1017] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider">
            Verifier Authorization Level
          </span>
          <p className="text-[11px] text-zinc-400">
            A valid reference does not grant unrestricted access; only fields permitted for your role are disclosed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as VerifierRole)}
            className="rounded border border-[#1b2333] bg-[#080b11] px-3 py-1.5 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
            aria-label="Select verifier role"
          >
            <option value="employer">Authorized Employer Tier</option>
            <option value="institution">University Registrar Tier</option>
            <option value="public">Public / General Tier</option>
          </select>

          <button
            onClick={() => loadVerification(role)}
            aria-label="Refresh verification"
            className="rounded border border-[#1e2738] bg-[#080b11] p-1.5 text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded border border-[#1f2838] bg-[#0c1017] px-4 py-2 text-xs text-zinc-300 font-mono">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
            <span>Resolving credential against national node...</span>
          </div>
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="rounded border border-rose-500/40 bg-[#0c1017] p-6 text-center space-y-4">
          <AlertOctagon className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="text-base font-bold text-white font-mono uppercase">
            Credential Reference Unverifiable
          </h2>
          <p className="max-w-md mx-auto text-xs text-zinc-300 font-mono leading-relaxed">
            {error}
          </p>
          <div className="pt-2">
            <Link
              to="/verification"
              className="inline-flex items-center gap-2 rounded border border-[#1e2738] bg-[#080b11] px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-[#121824] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Verification Portal</span>
            </Link>
          </div>
        </div>
      )}

      {/* Verification Result Dossier */}
      {result && !loading && (
        <VerificationResultCard
          result={result}
          onOpenReceipt={handleOpenReceipt}
        />
      )}

      {/* Receipt Modal */}
      <VerificationReceiptModal
        receipt={receiptModalData}
        isOpen={Boolean(receiptModalData)}
        onClose={() => setReceiptModalData(null)}
      />
    </div>
  );
};

export default VerifyReferencePage;
