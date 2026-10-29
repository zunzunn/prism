import React from "react";
import { VerificationReceipt } from "@/types/verification";
import { formatDateTime } from "@/lib/utils";
import {
  X,
  Printer,
  ShieldCheck,
  Download,
} from "lucide-react";

interface VerificationReceiptModalProps {
  receipt: VerificationReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationReceiptModal: React.FC<VerificationReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceiptJson = () => {
    const jsonStr = JSON.stringify(receipt, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receipt.receiptId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded border border-[#1f2838] bg-[#0c1017] p-6 shadow-2xl z-10 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto print:border-none print:bg-white print:text-black">
        {/* Receipt Header */}
        <div className="flex items-center justify-between border-b border-[#182132] pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                Official Credential Verification Receipt
              </div>
              <h2 className="text-base font-bold text-white font-mono">
                {receipt.receiptId}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrint}
              aria-label="Print receipt"
              className="rounded border border-[#1e2738] bg-[#0e131d] p-1.5 text-zinc-300 hover:text-white"
              title="Print Receipt"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-zinc-400 hover:bg-[#121824] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Official AICTE Sandbox Watermark Banner */}
        <div className="rounded border border-[#1c2637] bg-[#080b11] p-3 text-center space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
          </span>
          <div className="text-xs text-zinc-300 font-medium">
            National Academic Identity & Credential Registry Node
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">
            {receipt.disclaimer}
          </p>
        </div>

        {/* Receipt Key-Value Grid */}
        <div className="space-y-3 rounded border border-[#161c28] bg-[#080b11] p-4 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
            <span className="text-zinc-400">Verification Reference:</span>
            <span className="font-bold text-emerald-400">{receipt.reference}</span>
          </div>

          <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
            <span className="text-zinc-400">Candidate Name:</span>
            <span className="text-zinc-100 font-semibold">{receipt.studentName}</span>
          </div>

          <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
            <span className="text-zinc-400">Issuing Institution:</span>
            <span className="text-zinc-200 text-right max-w-[260px] truncate">
              {receipt.institutionName}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
            <span className="text-zinc-400">Programme:</span>
            <span className="text-zinc-200">{receipt.programmeName}</span>
          </div>

          <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
            <span className="text-zinc-400">Degree Level & AY:</span>
            <span className="text-zinc-300">
              {receipt.degreeLevel} • AY {receipt.academicYear}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
            <span className="text-zinc-400">Verification Outcome:</span>
            <span className="text-emerald-400 font-bold uppercase">
              {receipt.status}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
            <span className="text-zinc-400">Timestamp (UTC):</span>
            <span className="text-zinc-300">{formatDateTime(receipt.verifiedAt)}</span>
          </div>

          <div className="space-y-1 pt-1">
            <span className="text-[10px] text-zinc-400">
              Cryptographic Digital Seal Digest (SHA-256):
            </span>
            <div className="rounded bg-[#0c1017] p-2 text-[10px] text-emerald-300 break-all border border-[#141c2a]">
              {receipt.digitalSignatureHash}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#182132] pt-3 print:hidden">
          <button
            onClick={handleDownloadReceiptJson}
            className="flex items-center gap-1.5 rounded border border-[#1e2738] bg-[#0c1017] px-3.5 py-1.5 text-xs text-zinc-200 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Download JSON Receipt</span>
          </button>

          <button
            onClick={onClose}
            className="rounded border border-[#1e2738] bg-[#0c1017] px-4 py-1.5 text-xs text-zinc-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
