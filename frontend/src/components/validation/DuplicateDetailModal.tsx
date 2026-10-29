import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ValidationFinding, FindingReviewStatus } from "@/types/validation";
import { formatDateTime } from "@/lib/utils";
import {
  X,
  AlertOctagon,
  Copy,
  ExternalLink,
  Send,
  CheckCircle2,
  History,
  Info,
} from "lucide-react";

interface DuplicateDetailModalProps {
  finding: ValidationFinding | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    findingId: string,
    newStatus: FindingReviewStatus,
    reason: string
  ) => void;
}

export const DuplicateDetailModal: React.FC<DuplicateDetailModalProps> = ({
  finding,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [actionTab, setActionTab] = useState<
    "overview" | "request_explanation" | "resolve" | "dismiss"
  >("overview");
  const [reasonInput, setReasonInput] = useState("");
  const [validationError, setValidationError] = useState("");

  if (!isOpen || !finding) return null;

  const handleActionSubmit = (newStatus: FindingReviewStatus) => {
    if (newStatus === "Dismissed False Positive" && !reasonInput.trim()) {
      setValidationError("Mandatory Reason Required: You must specify justification before dismissing an anomaly finding.");
      return;
    }
    setValidationError("");
    onUpdateStatus(
      finding.id,
      newStatus,
      reasonInput.trim() || `Status updated to ${newStatus}`
    );
    setReasonInput("");
    setActionTab("overview");
  };

  const isCrossInstitution = finding.ruleId === "RULE-DUP-003";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl rounded border border-[#1f2838] bg-[#0c1017] p-6 shadow-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#182132] pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <Copy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">
                  Duplicate Enrolments
                </h2>
                <span className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono text-rose-400">
                  Anomaly Ref: {finding.id}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Explainable heuristic anomaly diagnosis & cross-institutional resolution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close duplicate detail modal"
            className="rounded p-1 text-zinc-400 transition hover:bg-[#121824] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Diagnostic Metrics Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded border border-[#182130] bg-[#080b11] p-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                Total Conflicts
              </span>
              <span className="font-mono text-lg font-bold text-zinc-100">
                {finding.affectedRecordReferences.length} Records
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Overlapping nodes
              </span>
            </div>

            <div className="rounded border border-[#182130] bg-[#080b11] p-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                Conflict Class
              </span>
              <span
                className={`font-mono text-xs font-bold block mt-1 ${
                  isCrossInstitution ? "text-rose-400" : "text-amber-400"
                }`}
              >
                {isCrossInstitution
                  ? "Cross-Institution"
                  : "Intra-Institution"}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Classification
              </span>
            </div>

            <div className="rounded border border-[#182130] bg-[#080b11] p-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                Detection Method
              </span>
              <span className="font-mono text-xs font-semibold text-emerald-400 block mt-1">
                Deterministic Token
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Normalized Hash
              </span>
            </div>

            <div className="rounded border border-[#182130] bg-[#080b11] p-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                Investigation Status
              </span>
              <span className="rounded border border-[#232f45] bg-[#101521] px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 block mt-1 w-fit">
                {finding.reviewStatus}
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Current status
              </span>
            </div>
          </div>

          {/* Explainable Diagnostic Banner */}
          <div className="rounded border border-[#1a2334] bg-[#090d14] p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
              <span>Explainable Rule Result ({finding.ruleId})</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-300">
              {finding.explanation}
            </p>
            <div className="rounded bg-[#06080d] p-2.5 border border-[#141b27] text-[11px] text-zinc-400 flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong>Compliance Note:</strong> Detection of a duplicate identifier
                does not automatically designate fraudulent enrollment. It may reflect
                unrecorded transfers, dual seat counseling offers, or administrative
                migration delays.
              </span>
            </div>
          </div>

          {/* Evidence Panel: Why Records Matched */}
          <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-3">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">
              Evidence Supporting Finding
            </span>

            <div className="space-y-2">
              {finding.evidence.map((ev, i) => (
                <div
                  key={i}
                  className="rounded border border-[#17202e] bg-[#080b10] p-3 text-xs space-y-1.5 font-mono"
                >
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">Matched Field:</span>
                    <span className="text-emerald-400 font-bold">{ev.matchedField}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-400">Primary Record:</span>
                    <span className="text-zinc-200">{ev.sourceValue}</span>
                  </div>
                  {ev.conflictingValue && (
                    <div className="flex justify-between text-zinc-300">
                      <span className="text-zinc-400">Conflicting Record:</span>
                      <span className="text-rose-400">{ev.conflictingValue}</span>
                    </div>
                  )}
                  {ev.normalizedToken && (
                    <div className="flex justify-between text-[10px] text-zinc-400 border-t border-[#141b27] pt-1">
                      <span>Normalized Token:</span>
                      <span>{ev.normalizedToken}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Tabs & Controls */}
          <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-[#161c28] pb-2.5 gap-2">
              <span className="text-xs font-bold text-zinc-200">
                Governance Resolution Actions
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActionTab("overview")}
                  className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                    actionTab === "overview"
                      ? "bg-[#141b27] text-white border border-[#222e42]"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActionTab("request_explanation")}
                  className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                    actionTab === "request_explanation"
                      ? "bg-[#141b27] text-white border border-[#222e42]"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Request Explanation
                </button>
                <button
                  onClick={() => setActionTab("resolve")}
                  className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                    actionTab === "resolve"
                      ? "bg-[#141b27] text-white border border-[#222e42]"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Resolve Conflict
                </button>
                <button
                  onClick={() => setActionTab("dismiss")}
                  className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                    actionTab === "dismiss"
                      ? "bg-[#141b27] text-rose-300 border border-rose-500/30"
                      : "text-zinc-400 hover:text-rose-400"
                  }`}
                >
                  Dismiss False Positive
                </button>
              </div>
            </div>

            {/* Action Sub-Panels */}
            {actionTab === "overview" && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-zinc-400">
                  Select an action to transition this duplicate finding. Every review action
                  generates an immutable cryptographic audit record.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      handleActionSubmit("Under Review")
                    }
                    className="flex items-center gap-1.5 rounded border border-[#222d3f] bg-[#111724] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-[#161e2e]"
                  >
                    <span>Mark as Under Review</span>
                  </button>
                  {finding.affectedRecordReferences.map((ref) => (
                    <Link
                      key={ref}
                      to={`/students/${ref}`}
                      className="inline-flex items-center gap-1 rounded border border-[#1e2738] bg-[#0d121c] px-3 py-1.5 text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      <span>Open Record {ref}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {actionTab === "request_explanation" && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-zinc-300">
                  Dispatch official AICTE clarification notice to the institution nodal officer(s).
                </p>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Enter clarification notice instructions (e.g. Please provide formal transfer certificate or seat allotment proof within 7 days)..."
                  className="w-full rounded border border-[#1b2333] bg-[#090d14] p-2.5 text-xs text-zinc-200 focus:border-emerald-500/50 focus:outline-none"
                  rows={3}
                />
                <button
                  onClick={() =>
                    handleActionSubmit("Explanation Requested")
                  }
                  className="flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-500/20 px-4 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Institutional Notice</span>
                </button>
              </div>
            )}

            {actionTab === "resolve" && (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-zinc-300">
                  Mark this anomaly as resolved following nodal officer clarification or seat cancellation.
                </p>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Enter resolution notes (e.g. Migration certificate verified; secondary seat cancelled on 29 Oct 2026)..."
                  className="w-full rounded border border-[#1b2333] bg-[#090d14] p-2.5 text-xs text-zinc-200 focus:border-emerald-500/50 focus:outline-none"
                  rows={3}
                />
                <button
                  onClick={() => handleActionSubmit("Resolved")}
                  className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Confirm Resolution</span>
                </button>
              </div>
            )}

            {actionTab === "dismiss" && (
              <div className="space-y-3 pt-1">
                <div className="rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  <strong>Mandatory Justification Required:</strong> You must supply
                  an explainable administrative justification to dismiss this anomaly as a false positive.
                </div>
                {validationError && (
                  <p className="text-xs text-rose-400 font-semibold">{validationError}</p>
                )}
                <textarea
                  value={reasonInput}
                  onChange={(e) => {
                    setReasonInput(e.target.value);
                    if (e.target.value.trim()) setValidationError("");
                  }}
                  placeholder="Specify mandatory reason for false positive dismissal (e.g. Dual enrollment is permitted lateral diploma migration with state approval reference #2910)..."
                  className="w-full rounded border border-[#1b2333] bg-[#090d14] p-2.5 text-xs text-zinc-200 focus:border-rose-500/50 focus:outline-none"
                  rows={3}
                />
                <button
                  onClick={() =>
                    handleActionSubmit("Dismissed False Positive")
                  }
                  className="flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-500/20 px-4 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
                >
                  <span>Dismiss as False Positive</span>
                </button>
              </div>
            )}
          </div>

          {/* Audit Trail Section */}
          <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-zinc-200">
              <History className="h-4 w-4 text-emerald-400" />
              <span>Immutable Governance Audit Trail</span>
            </div>

            <div className="space-y-2">
              {finding.auditTrail.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded border border-[#17202e] bg-[#080b10] p-2.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="font-semibold text-emerald-400">{ev.action}</span>
                    <span className="text-[10px] text-zinc-400">
                      {formatDateTime(ev.timestamp)}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-400">
                    {ev.reason} (by {ev.actor})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#182132] pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded border border-[#1f2838] bg-[#0e131d] px-5 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
          >
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
};
