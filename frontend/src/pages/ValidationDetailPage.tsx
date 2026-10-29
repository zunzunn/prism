import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ValidationFinding, FindingReviewStatus } from "@/types/validation";
import { fetchFindingById, updateFindingStatus } from "@/services/validationService";
import { formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  AlertOctagon,
  AlertTriangle,
  Info,
  Building2,
  Users,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Send,
  History,
  ExternalLink,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

export const ValidationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [finding, setFinding] = useState<ValidationFinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionTab, setActionTab] = useState<
    "overview" | "request_explanation" | "resolve" | "dismiss"
  >("overview");
  const [reasonInput, setReasonInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  const loadFinding = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetchFindingById(id);
      setFinding(res);
    } catch (err) {
      console.error("Failed to load validation finding:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinding();
  }, [id]);

  const handleStatusChange = async (newStatus: FindingReviewStatus) => {
    if (!finding) return;

    if (newStatus === "Dismissed False Positive" && !reasonInput.trim()) {
      setValidationError(
        "Mandatory Justification Required: AICTE compliance rules mandate an explicit justification to dismiss an anomaly."
      );
      return;
    }

    setValidationError("");
    try {
      const updated = await updateFindingStatus(
        finding.id,
        newStatus,
        reasonInput.trim() || `Administrative transition to ${newStatus}`,
        "AICTE Governance Officer"
      );
      setFinding(updated);
      setReasonInput("");
      setActionTab("overview");
      setActionSuccessMessage(
        `Audit trail updated: finding status successfully changed to "${newStatus}".`
      );
      setTimeout(() => setActionSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Failed to update status:", err);
      setValidationError("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded border border-[#1f2838] bg-[#0c1017] px-4 py-2 text-xs text-zinc-300">
          <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
          <span>Loading validation diagnostic dossier...</span>
        </div>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="py-24 text-center space-y-4">
        <AlertOctagon className="mx-auto h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-zinc-200">Finding Not Found</h2>
        <p className="text-xs text-zinc-400">
          No diagnostic record exists for reference identifier "{id}".
        </p>
        <Link
          to="/validation"
          className="inline-flex items-center gap-2 rounded border border-[#1e2738] bg-[#0c1017] px-4 py-1.5 text-xs text-zinc-300 hover:bg-[#121926] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Validation Center</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b border-[#182130] pb-4">
        <div className="flex items-center space-x-2 text-xs">
          <Link
            to="/validation"
            className="flex items-center gap-1 text-zinc-400 transition hover:text-emerald-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Validation Center</span>
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="font-mono text-zinc-400">{finding.category}</span>
          <span className="text-zinc-600">/</span>
          <span className="font-mono font-medium text-emerald-400">
            {finding.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">
            Rule Ref: <span className="text-zinc-300">{finding.ruleId}</span>
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="rounded border border-[#182130] bg-[#0c1017] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-[#1e2738] bg-[#111724] px-2.5 py-0.5 font-mono text-[11px] text-zinc-300">
                {finding.category}
              </span>

              {finding.severity === "Critical" ? (
                <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-medium text-rose-400">
                  <AlertOctagon className="h-3.5 w-3.5" />
                  Critical Severity
                </span>
              ) : finding.severity === "Warning" ? (
                <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Warning
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-400">
                  <Info className="h-3.5 w-3.5" />
                  Informational
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase ${
                  finding.reviewStatus === "Resolved"
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : finding.reviewStatus === "Dismissed False Positive"
                    ? "border border-zinc-700 bg-zinc-800 text-zinc-400 line-through"
                    : finding.reviewStatus === "Explanation Requested"
                    ? "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border border-[#222f42] bg-[#111724] text-zinc-300"
                }`}
              >
                {finding.reviewStatus}
              </span>
            </div>

            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              {finding.ruleName}
            </h1>

            <p className="max-w-3xl text-xs text-zinc-300 sm:text-sm">
              {finding.explanation}
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 rounded border border-[#1b2333] bg-[#090d14] p-3 text-xs md:items-end">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
              Diagnostic Dossier ID
            </span>
            <span className="font-mono text-sm font-semibold text-emerald-400">
              {finding.id}
            </span>
            <span className="text-[10px] text-zinc-400">
              Logged: {formatDateTime(finding.createdAt)}
            </span>
            <span className="text-[10px] text-zinc-400">
              Updated: {formatDateTime(finding.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Details + Governance Resolution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Evidence & Context */}
        <div className="space-y-6 lg:col-span-2">
          {/* Matched Evidence Breakdown */}
          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#161c28] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Deterministic Heuristic Evidence
                </h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {finding.evidence.length} Matched Token(s)
              </span>
            </div>

            <div className="space-y-3">
              {finding.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="rounded border border-[#161c28] bg-[#080b11] p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-zinc-200">
                      Field: <span className="text-emerald-400">{ev.matchedField}</span>
                    </span>
                    {ev.normalizedToken && (
                      <span className="rounded bg-[#121926] px-2 py-0.5 font-mono text-[10px] text-zinc-400 border border-[#1e2738]">
                        Hash / Token: {ev.normalizedToken}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-1">
                    <div className="rounded bg-[#0c1017] p-2 border border-[#141b27]">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase">
                        Source Value
                      </div>
                      <div className="font-mono text-xs text-zinc-200 break-all">
                        {ev.sourceValue}
                      </div>
                    </div>

                    {ev.conflictingValue && (
                      <div className="rounded bg-[#0c1017] p-2 border border-[#141b27]">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">
                          Conflicting Value
                        </div>
                        <div className="font-mono text-xs text-rose-300 break-all">
                          {ev.conflictingValue}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 pt-1 border-t border-[#121722]">
                    <span className="text-zinc-300 font-medium">Context:</span>{" "}
                    {ev.ruleContext}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Student Record References */}
          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#161c28] pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Affected Student Records ({finding.affectedRecordReferences.length})
                </h2>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                Click reference to view full dossier
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {finding.affectedRecordReferences.map((refId) => (
                <div
                  key={refId}
                  className="flex items-center justify-between rounded border border-[#182130] bg-[#080b11] p-3 transition hover:border-emerald-500/40"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs font-semibold text-zinc-200">
                      {refId}
                    </div>
                    {finding.studentName && (
                      <div className="text-[11px] text-zinc-400">
                        Candidate: {finding.studentName}
                      </div>
                    )}
                    <div className="text-[10px] font-mono text-zinc-400">
                      Academic Year: {finding.academicYear}
                    </div>
                  </div>

                  <Link
                    to={`/students/${refId}`}
                    className="inline-flex items-center gap-1 rounded border border-[#1e2738] bg-[#0c1017] px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-[#121926] hover:text-white"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="h-3 w-3 text-emerald-400" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail & Governance Log */}
          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#161c28] pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Regulatory Audit Trail ({finding.auditTrail.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Immutable Log
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Under AICTE governance standards, every finding alteration, explanation request, and dismissal is cryptographically committed with actor attribution. Silent deletion is forbidden.
            </p>

            <div className="space-y-3 pt-2">
              {finding.auditTrail.map((audit) => (
                <div
                  key={audit.id}
                  className="rounded border border-[#161c28] bg-[#080b11] p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-200">
                      {audit.action}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {formatDateTime(audit.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-zinc-400">Actor:</span>
                    <span className="text-emerald-400 font-medium">{audit.actor}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">Transition:</span>
                    <span className="text-zinc-400 line-through">
                      {audit.previousStatus}
                    </span>
                    <span className="text-zinc-600">→</span>
                    <span className="text-zinc-200">{audit.newStatus}</span>
                  </div>

                  <div className="rounded bg-[#0c1017] p-2 text-[11px] text-zinc-300 border border-[#121824] font-mono">
                    <span className="text-zinc-400">Justification: </span>
                    {audit.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Institution Context & Action Center */}
        <div className="space-y-6">
          {/* Institution Context Card */}
          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#161c28] pb-3">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Institution Profile
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-sm font-semibold text-zinc-100">
                {finding.institutionName}
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                <span>Code: {finding.institutionCode}</span>
                {finding.state && (
                  <>
                    <span>•</span>
                    <span>State: {finding.state}</span>
                  </>
                )}
              </div>
            </div>

            <Link
              to={`/institutions/${finding.institutionCode}`}
              className="flex w-full items-center justify-center gap-1.5 rounded border border-[#1e2738] bg-[#080b11] px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-[#121824] hover:text-white"
            >
              <span>View Institution Details</span>
              <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
            </Link>
          </div>

          {/* Suggested Remediation */}
          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              <HelpCircle className="h-4 w-4" />
              Suggested Next Action
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {finding.suggestedAction}
            </p>
          </div>

          {/* Interactive Review Action Workflow */}
          <div className="rounded border border-[#1f2838] bg-[#0c1017] p-5 space-y-4">
            <div className="border-b border-[#161c28] pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Governance Actions
              </h2>
              <p className="text-[11px] text-zinc-400 mt-1">
                Take compliance action on this finding.
              </p>
            </div>

            {/* Action Mode Tabs */}
            <div className="grid grid-cols-2 gap-1.5 rounded bg-[#080b11] p-1 border border-[#161c28]">
              <button
                onClick={() => {
                  setActionTab("overview");
                  setValidationError("");
                }}
                className={`py-1 text-center font-mono text-[11px] rounded transition ${
                  actionTab === "overview"
                    ? "bg-[#141b27] text-white font-medium shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Workflow
              </button>
              <button
                onClick={() => {
                  setActionTab("request_explanation");
                  setValidationError("");
                }}
                className={`py-1 text-center font-mono text-[11px] rounded transition ${
                  actionTab === "request_explanation"
                    ? "bg-[#141b27] text-amber-300 font-medium shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Inquire
              </button>
              <button
                onClick={() => {
                  setActionTab("resolve");
                  setValidationError("");
                }}
                className={`py-1 text-center font-mono text-[11px] rounded transition ${
                  actionTab === "resolve"
                    ? "bg-[#141b27] text-emerald-300 font-medium shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Resolve
              </button>
              <button
                onClick={() => {
                  setActionTab("dismiss");
                  setValidationError("");
                }}
                className={`py-1 text-center font-mono text-[11px] rounded transition ${
                  actionTab === "dismiss"
                    ? "bg-[#141b27] text-rose-300 font-medium shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Dismiss FP
              </button>
            </div>

            {/* TAB CONTENT: Overview quick actions */}
            {actionTab === "overview" && (
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleStatusChange("Under Review")}
                  disabled={finding.reviewStatus === "Under Review"}
                  className="w-full flex items-center justify-center gap-2 rounded border border-[#222f42] bg-[#0e1420] px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-[#141d2e] disabled:opacity-40"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                  <span>Mark as Under Active Review</span>
                </button>

                <button
                  onClick={() => setActionTab("request_explanation")}
                  className="w-full flex items-center justify-center gap-2 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Request Institutional Explanation</span>
                </button>

                <button
                  onClick={() => setActionTab("resolve")}
                  className="w-full flex items-center justify-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Anomaly Resolved</span>
                </button>

                <button
                  onClick={() => setActionTab("dismiss")}
                  className="w-full flex items-center justify-center gap-2 rounded border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800"
                >
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
                  <span>Dismiss as False Positive</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT: Request Institutional Explanation */}
            {actionTab === "request_explanation" && (
              <div className="space-y-3 pt-2">
                <label className="text-xs text-zinc-300 font-medium block">
                  Official Ingestion Notice / Query to Institution:
                </label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Detail the clarification required regarding enrolment tokens or intake capacity..."
                  rows={3}
                  className="w-full rounded border border-[#1e2738] bg-[#080b11] p-2.5 font-mono text-xs text-zinc-200 placeholder-zinc-400 focus:border-amber-500/50 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange("Explanation Requested")}
                    className="flex-1 rounded border border-amber-500/40 bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/30"
                  >
                    Transmit Formal Request
                  </button>
                  <button
                    onClick={() => {
                      setActionTab("overview");
                      setReasonInput("");
                    }}
                    className="rounded border border-[#1e2738] bg-[#080b11] px-3 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Mark Resolved */}
            {actionTab === "resolve" && (
              <div className="space-y-3 pt-2">
                <label className="text-xs text-zinc-300 font-medium block">
                  Resolution Audit Notes:
                </label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Record resolution rationale (e.g., student canceled admission at Institute B, quota amended by state board)..."
                  rows={3}
                  className="w-full rounded border border-[#1e2738] bg-[#080b11] p-2.5 font-mono text-xs text-zinc-200 placeholder-zinc-400 focus:border-emerald-500/50 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange("Resolved")}
                    className="flex-1 rounded border border-emerald-500/40 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
                  >
                    Confirm Resolution
                  </button>
                  <button
                    onClick={() => {
                      setActionTab("overview");
                      setReasonInput("");
                    }}
                    className="rounded border border-[#1e2738] bg-[#080b11] px-3 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Dismiss as False Positive (Mandatory reason required) */}
            {actionTab === "dismiss" && (
              <div className="space-y-3 pt-2">
                <div className="rounded border border-rose-500/30 bg-rose-500/10 p-2.5 text-[11px] text-rose-300">
                  <span className="font-bold">Compliance Constraint:</span> A verifiable administrative justification is mandatory to dismiss an anomaly as a false positive.
                </div>
                <label className="text-xs text-zinc-300 font-medium block">
                  Mandatory Dismissal Justification:
                </label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => {
                    setReasonInput(e.target.value);
                    if (e.target.value.trim()) setValidationError("");
                  }}
                  placeholder="Specify why this detected anomaly is verified as legitimate (e.g. approved dual degree or valid lateral migration)..."
                  rows={3}
                  className="w-full rounded border border-rose-500/30 bg-[#080b11] p-2.5 font-mono text-xs text-zinc-200 placeholder-zinc-400 focus:border-rose-500/50 focus:outline-none"
                />
                {validationError && (
                  <p className="text-[11px] text-rose-400 font-mono">
                    {validationError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange("Dismissed False Positive")}
                    className="flex-1 rounded border border-rose-500/40 bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/30"
                  >
                    Confirm Dismissal
                  </button>
                  <button
                    onClick={() => {
                      setActionTab("overview");
                      setReasonInput("");
                      setValidationError("");
                    }}
                    className="rounded border border-[#1e2738] bg-[#080b11] px-3 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationDetailPage;