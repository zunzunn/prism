import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { StudentRecordDetail } from "@/types/students";
import { fetchStudentById, maskApaarId } from "@/services/studentService";
import { formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealApaar, setRevealApaar] = useState(false);
  const [auditLogNotice, setAuditLogNotice] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetchStudentById(id);
        setStudent(res);
      } catch (err) {
        console.error("Failed to load student detail:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const toggleApaarReveal = () => {
    if (!revealApaar) {
      setAuditLogNotice(true);
      setTimeout(() => setAuditLogNotice(false), 4000);
    }
    setRevealApaar(!revealApaar);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded border border-[#1f2838] bg-[#0c1017] px-4 py-2 text-xs text-zinc-300">
          <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
          <span>Loading student record...</span>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-24 text-center space-y-4">
        <User className="mx-auto h-10 w-10 text-zinc-500" />
        <h2 className="text-base font-bold text-zinc-200">
          Student Record Not Found
        </h2>
        <p className="text-xs text-zinc-400">
          No registered student record matches reference `{id}`.
        </p>
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 rounded border border-[#1e2738] bg-[#0c1017] px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Student Registry</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14">
      {/* Back Link & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div className="flex items-center space-x-3">
          <Link
            to="/students"
            aria-label="Back to Student Registry"
            className="flex h-9 w-9 items-center justify-center rounded border border-[#1e2838] bg-[#0c1017] text-zinc-400 transition hover:bg-[#121926] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-2xl font-bold text-white">
                {student.fullName}
              </h1>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                  student.validationStatus === "Verified"
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : student.validationStatus === "Flagged Duplicate"
                    ? "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                    : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {student.validationStatus}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
              <span>Roll No: {student.institutionStudentId}</span>
              <span>•</span>
              <span>{student.institutionName}</span>
              <span>•</span>
              <span>AY {student.academicYear}</span>
            </div>
          </div>
        </div>
      </div>

      {auditLogNotice && (
        <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          <span className="font-semibold">Security Audit:</span> Full APAAR ID view
          request logged under active officer session.
        </div>
      )}

      {/* Grid of Student Details */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left Column: Academic & APAAR Identity */}
        <div className="space-y-5">
          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
              Identity & Credential Record
            </h3>

            <div className="flex items-center justify-between border-b border-[#161c28] pb-3">
              <div>
                <span className="text-[11px] text-zinc-400">
                  National APAAR ID (Masked)
                </span>
                <div className="mt-0.5 font-mono text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span>
                    {revealApaar
                      ? student.apaarId
                      : maskApaarId(student.apaarId)}
                  </span>
                  <button
                    onClick={toggleApaarReveal}
                    className="rounded p-1 text-zinc-400 hover:text-zinc-200 hover:bg-[#141b27]"
                    title="Toggle APAAR Reveal"
                  >
                    {revealApaar ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block">Enrolment Status</span>
                <span className="font-semibold text-emerald-400 text-xs">
                  {student.enrolmentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Programme:</span>
                <span className="font-medium text-zinc-200">{student.programme}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Degree Level:</span>
                <span className="text-zinc-300">{student.degreeLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Admission Date:</span>
                <span className="font-mono text-zinc-300">{student.admissionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Approved Quota Ref:</span>
                <span className="font-mono text-zinc-300">
                  {student.approvedIntakeReference}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
              Categorization & Quota Eligibility
            </h3>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Admission Category:</span>
              <span className="font-medium text-zinc-200">{student.admissionCategory}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Supernumerary Category:</span>
              <span className="font-medium text-sky-400">{student.supernumeraryCategory}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#161c28] text-center font-mono text-[10px]">
              <div className="rounded border border-[#1a2334] bg-[#090d14] p-2">
                <span className="text-zinc-400 block">NRI Quota</span>
                <span className={student.isNri ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                  {student.isNri ? "YES" : "NO"}
                </span>
              </div>
              <div className="rounded border border-[#1a2334] bg-[#090d14] p-2">
                <span className="text-zinc-400 block">OCI Card</span>
                <span className={student.isOci ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                  {student.isOci ? "YES" : "NO"}
                </span>
              </div>
              <div className="rounded border border-[#1a2334] bg-[#090d14] p-2">
                <span className="text-zinc-400 block">Foreign National</span>
                <span className={student.isForeignNational ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                  {student.isForeignNational ? "YES" : "NO"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cryptographic Proof & Audit Trail */}
        <div className="space-y-5">
          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                Cryptographic Integrity Hash
              </h3>
              <span className="font-mono text-[10px] text-emerald-400">SHA-256</span>
            </div>

            <div className="rounded bg-[#080b11] p-3 font-mono text-xs text-zinc-300 break-all border border-[#151d2a]">
              {student.integrityHash}
            </div>
            <p className="text-[11px] text-zinc-400">
              Deterministic digest calculated from student biometrics, admission registry record, and AICTE approval certificate.
            </p>
          </div>

          <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-3">
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
              Immutable Governance Audit Trail
            </h3>

            <div className="space-y-3">
              {student.auditTrail.map((ev, i) => (
                <div key={i} className="rounded border border-[#17202e] bg-[#080b10] p-3 text-xs">
                  <div className="flex items-center justify-between text-zinc-200 font-semibold">
                    <span>{ev.event}</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-zinc-400 flex items-center justify-between">
                    <span>Recorded by: {ev.actor}</span>
                    <span>{formatDateTime(ev.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
