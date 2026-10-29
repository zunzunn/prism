import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  StudentPortalRecord,
  StudentLifecycleStage,
} from "@/types/verification";
import {
  fetchStudentPortalRecord,
  getAllStudentDemoAccounts,
  generateSecureQrCodeDataUrl,
  resolveStudentCorrectionIssue,
} from "@/services/verificationService";
import { formatDateTime } from "@/lib/utils";
import {
  User,
  QrCode,
  FileCheck2,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  History,
  Lock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const LIFECYCLE_STAGES: StudentLifecycleStage[] = [
  "Institution-submitted",
  "Format-validated",
  "Externally verified",
  "Under review",
  "Rejected",
  "Corrected",
];

export const StudentPortalPage: React.FC = () => {
  const [activeStudentId, setActiveStudentId] = useState<string>("STU-001");
  const [student, setStudent] = useState<StudentPortalRecord | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(
    null
  );

  const demoAccounts = getAllStudentDemoAccounts();

  const loadStudentData = async (stuId: string) => {
    setLoading(true);
    try {
      const data = await fetchStudentPortalRecord(stuId);
      setStudent(data);
      if (data) {
        const qrUrl = await generateSecureQrCodeDataUrl(
          data.verificationReference
        );
        setQrCodeDataUrl(qrUrl);
      }
    } catch (err) {
      console.error("Failed to load student record:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData(activeStudentId);
  }, [activeStudentId]);

  const handleCopyLink = () => {
    if (!student) return;
    const url = `${window.location.origin}/verify/${student.verificationReference}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl || !student) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = `CREDEN-PASS-${student.verificationReference}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleResolveIssue = async (issueId: string) => {
    if (!student) return;
    try {
      const updated = await resolveStudentCorrectionIssue(
        student.studentId,
        issueId
      );
      setStudent(updated);
      setActionSuccessNotice(
        "Document uploaded & verified. Anomaly cleared in institutional registry."
      );
      setTimeout(() => setActionSuccessNotice(null), 5000);
    } catch (err) {
      console.error("Failed to resolve issue:", err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Student Academic Identity Portal
            </h1>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              National Registry Node
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Self-service dashboard for inspecting academic identity, resolving compliance queries, and generating privacy-preserving QR credentials.
          </p>
        </div>

        {/* Demo Candidate Switcher */}
        <div className="flex items-center gap-2 self-start">
          <label className="text-[10px] font-mono uppercase text-zinc-400 whitespace-nowrap">
            Demo Profile:
          </label>
          <select
            value={activeStudentId}
            onChange={(e) => setActiveStudentId(e.target.value)}
            className="rounded border border-[#1b2333] bg-[#0c1017] px-3 py-1.5 font-mono text-xs text-zinc-200 focus:border-emerald-500/50 focus:outline-none"
            aria-label="Switch synthetic student account"
          >
            {demoAccounts.map((acc) => (
              <option key={acc.studentId} value={acc.studentId}>
                {acc.fullName} ({acc.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {loading || !student ? (
        <div className="py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded border border-[#1f2838] bg-[#0c1017] px-4 py-2 text-xs text-zinc-300 font-mono">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
            <span>Loading student profile and verification pass...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 6-Stage Lifecycle Progress Bar */}
          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
              <span className="text-[11px] font-mono uppercase font-bold text-zinc-300 tracking-wider">
                Academic Identity Lifecycle State
              </span>
              <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 font-bold uppercase">
                Active: {student.lifecycleStage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 pt-1">
              {LIFECYCLE_STAGES.map((stage) => {
                const isActive = stage === student.lifecycleStage;
                const isResolved =
                  (stage === "Institution-submitted" ||
                    stage === "Format-validated") &&
                  student.lifecycleStage !== "Rejected";

                return (
                  <div
                    key={stage}
                    className={`rounded border p-2 text-center text-xs font-mono transition ${
                      isActive
                        ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 font-bold"
                        : isResolved
                        ? "border-[#1e2738] bg-[#090d14] text-zinc-400"
                        : "border-[#141b24] bg-[#070a0e] text-zinc-500"
                    }`}
                  >
                    <div className="text-[10px] uppercase">{stage}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Grid: Profile & QR Credential Pass */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Academic Profile + Compliance Action Cards */}
            <div className="space-y-6 lg:col-span-2">
              {/* Profile Card */}
              <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#141b27] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white font-mono">
                        {student.fullName}
                      </h2>
                      <div className="text-xs text-zinc-400 font-mono">
                        Masked APAAR:{" "}
                        <span className="text-emerald-400 font-semibold">
                          {student.maskedApaarId}
                        </span>{" "}
                        • Roll No: {student.institutionStudentId}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`self-start inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-mono font-bold uppercase ${
                      student.verificationStatus === "Verified Authentic"
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : student.verificationStatus === "Awaiting Institutional Review"
                        ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                        : student.verificationStatus === "Corrected & Cleared"
                        ? "border border-sky-500/30 bg-sky-500/10 text-sky-400"
                        : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {student.verificationStatus === "Verified Authentic" && (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {student.verificationStatus === "Awaiting Institutional Review" && (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    )}
                    {student.verificationStatus === "Invalid / Revoked" && (
                      <AlertOctagon className="h-3.5 w-3.5" />
                    )}
                    <span>{student.verificationStatus}</span>
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs font-mono">
                  <div className="rounded bg-[#080b11] p-3 border border-[#141b27]">
                    <span className="text-[10px] text-zinc-400 uppercase">
                      Institution Name
                    </span>
                    <div className="font-semibold text-zinc-200 mt-1 truncate">
                      {student.institutionName}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Code: {student.institutionCode}
                    </div>
                  </div>

                  <div className="rounded bg-[#080b11] p-3 border border-[#141b27]">
                    <span className="text-[10px] text-zinc-400 uppercase">
                      Programme & Level
                    </span>
                    <div className="font-semibold text-zinc-200 mt-1 truncate">
                      {student.programme}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {student.degreeLevel}
                    </div>
                  </div>

                  <div className="rounded bg-[#080b11] p-3 border border-[#141b27]">
                    <span className="text-[10px] text-zinc-400 uppercase">
                      Enrolment Status
                    </span>
                    <div className="font-semibold text-emerald-400 mt-1">
                      {student.enrolmentStatus}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      AY {student.academicYear}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Issues Requiring Correction */}
              <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#141b27] pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      Validation Queries & Required Corrections ({student.validationIssues.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Self-Service Resolution
                  </span>
                </div>

                {student.validationIssues.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-400 font-mono">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                    All academic validation checks satisfied. No pending institutional queries.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {student.validationIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className={`rounded border p-4 text-xs font-mono space-y-2 ${
                          issue.resolved
                            ? "border-emerald-500/30 bg-emerald-500/5 text-zinc-300"
                            : issue.severity === "Critical"
                            ? "border-rose-500/30 bg-rose-500/5 text-zinc-200"
                            : "border-amber-500/30 bg-amber-500/5 text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">
                            {issue.title}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              issue.resolved
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : issue.severity === "Critical"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {issue.resolved ? "Resolved" : issue.severity}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {issue.description}
                        </p>

                        {!issue.resolved ? (
                          <div className="pt-1">
                            <button
                              onClick={() => handleResolveIssue(issue.id)}
                              className="inline-flex items-center gap-1.5 rounded border border-[#1e2738] bg-[#0c1017] px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:border-emerald-500/50 hover:bg-[#121926]"
                            >
                              <span>{issue.actionLabel}</span>
                              <ArrowRight className="h-3 w-3 text-emerald-400" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-400">
                            Resolution recorded at {formatDateTime(issue.resolvedAt || "")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Verifier Transparency History (Who verified the student) */}
              <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#141b27] pb-3">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      Third-Party Verification Audit Ledger ({student.verifierHistory.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Candidate Privacy Transparency
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Under AICTE student privacy mandates, every external employer or university inquiry against your credential reference is logged with verifier organization identity and disclosed field manifests.
                </p>

                <div className="space-y-2.5 pt-1">
                  {student.verifierHistory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded border border-[#161c28] bg-[#080b11] p-3 text-xs font-mono space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-200">
                          {item.verifierOrganization}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {formatDateTime(item.accessedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span className="text-emerald-400 uppercase font-semibold">
                          {item.verifierRole} tier
                        </span>
                        <span>•</span>
                        <span>Purpose: {item.purpose}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        <span className="text-[10px] text-zinc-400">
                          Permitted Fields Disclosed:
                        </span>
                        {item.fieldsDisclosed.map((f, i) => (
                          <span
                            key={i}
                            className="rounded bg-[#0c1017] px-1.5 py-0.5 text-[9px] text-zinc-300 border border-[#141b27]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: QR Credential Pass */}
            <div className="space-y-6">
              <div className="rounded border border-[#1f2838] bg-[#0c1017] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#141b27] pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      Digital QR Credential Pass
                    </h3>
                  </div>
                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                    Opaque Token
                  </span>
                </div>

                <div className="rounded border border-[#182333] bg-[#080b11] p-4 text-center space-y-3">
                  {qrCodeDataUrl ? (
                    <div className="inline-block rounded border-4 border-white bg-white p-2">
                      <img
                        src={qrCodeDataUrl}
                        alt="Verification QR Code"
                        className="h-48 w-48 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-48 mx-auto flex items-center justify-center bg-[#05080e] rounded">
                      <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
                    </div>
                  )}

                  <div className="space-y-1 font-mono">
                    <div className="text-[10px] text-zinc-400 uppercase">
                      Reference Code
                    </div>
                    <div className="text-sm font-bold text-emerald-400">
                      {student.verificationReference}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Expires: {formatDateTime(student.credentialExpiresAt)}
                    </div>
                  </div>
                </div>

                {/* Privacy Guarantee Notice */}
                <div className="rounded border border-[#182333] bg-[#080b11] p-3 text-[11px] text-zinc-300 space-y-1 font-mono">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Cryptographic Privacy Guarantee</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    This QR pass contains ONLY the secure link to the controlled verification gateway. Your raw APAAR ID, passwords, and sensitive identity tokens are NEVER encoded into the QR image.
                  </p>
                </div>

                {/* Pass Actions */}
                <div className="space-y-2 pt-1 font-mono text-xs">
                  <button
                    onClick={handleCopyLink}
                    className="flex w-full items-center justify-center gap-2 rounded border border-[#1e2738] bg-[#080b11] px-4 py-2 text-zinc-200 transition hover:bg-[#121926] hover:text-white"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Link Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copy Verification Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadQr}
                    className="flex w-full items-center justify-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download QR Pass (PNG)</span>
                  </button>

                  <Link
                    to={`/verify/${student.verificationReference}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded border border-[#1e2738] bg-[#0c1017] px-4 py-2 text-zinc-400 hover:text-white hover:bg-[#101724]"
                  >
                    <span>Inspect Public Gateway View</span>
                    <ExternalLink className="h-3 w-3 text-emerald-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortalPage;
