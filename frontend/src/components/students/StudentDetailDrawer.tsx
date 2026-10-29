import React, { useState } from "react";
import { StudentRecordDetail } from "@/types/students";
import { maskApaarId } from "@/services/studentService";
import { formatDateTime } from "@/lib/utils";
import {
  X,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

interface StudentDetailDrawerProps {
  student: StudentRecordDetail | null;
  onClose: () => void;
}

export const StudentDetailDrawer: React.FC<StudentDetailDrawerProps> = ({
  student,
  onClose,
}) => {
  const [revealApaar, setRevealApaar] = useState(false);
  const [auditLogNotice, setAuditLogNotice] = useState(false);

  if (!student) return null;

  const toggleApaarReveal = () => {
    if (!revealApaar) {
      setAuditLogNotice(true);
      setTimeout(() => setAuditLogNotice(false), 4000);
    }
    setRevealApaar(!revealApaar);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg border-l border-[#1f2838] bg-[#090c12] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#182132] pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-[#1e2738] bg-[#111724] text-emerald-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    {student.fullName}
                  </h3>
                  <span className="font-mono text-[11px] text-zinc-400">
                    Roll No: {student.institutionStudentId}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded p-1 text-zinc-400 transition hover:bg-[#121824] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Audit log banner on reveal */}
            {auditLogNotice && (
              <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300">
                <span className="font-semibold">Security Audit:</span> Full APAAR
                ID view request logged under active officer session.
              </div>
            )}

            {/* Identity Card */}
            <div className="rounded border border-[#1b2536] bg-[#0c1017] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400">
                    12-Digit National APAAR ID
                  </span>
                  <div className="mt-0.5 font-mono text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <span>
                      {revealApaar
                        ? student.apaarId
                        : maskApaarId(student.apaarId)}
                    </span>
                    <button
                      onClick={toggleApaarReveal}
                      aria-label="Toggle APAAR Visibility"
                      className="rounded p-1 text-zinc-400 hover:text-zinc-200 hover:bg-[#141b27]"
                    >
                      {revealApaar ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                    Validation Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold uppercase mt-0.5 ${
                      student.validationStatus === "Verified"
                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : student.validationStatus === "Flagged Duplicate"
                        ? "border border-rose-500/30 bg-rose-500/10 text-rose-400"
                        : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {student.validationStatus}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#161c28] pt-2.5 flex items-center justify-between text-xs text-zinc-300">
                <span className="text-zinc-400">Enrolment Status:</span>
                <span className="font-medium text-emerald-400">
                  {student.enrolmentStatus}
                </span>
              </div>
            </div>

            {/* Institution & Programme Details */}
            <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-2.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                Academic Enrollment Details
              </span>

              <div className="flex items-start justify-between">
                <span className="text-zinc-400">Institution:</span>
                <span className="font-medium text-zinc-200 text-right max-w-[260px]">
                  {student.institutionName} ({student.institutionCode})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Programme:</span>
                <span className="font-medium text-zinc-200">{student.programme}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Academic Year:</span>
                <span className="font-mono text-zinc-200">{student.academicYear}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Admission Date:</span>
                <span className="font-mono text-zinc-200">{student.admissionDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Intake Quota Reference:</span>
                <span className="font-mono text-[11px] text-zinc-300">
                  {student.approvedIntakeReference}
                </span>
              </div>
            </div>

            {/* Admission & Supernumerary Categories */}
            <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-2.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                Quota & Categorization
              </span>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Admission Category:</span>
                <span className="font-medium text-zinc-200">
                  {student.admissionCategory}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Supernumerary Quota:</span>
                <span className="font-medium text-sky-400">
                  {student.supernumeraryCategory}
                </span>
              </div>

              <div className="pt-2 border-t border-[#161c28] grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="rounded border border-[#1a2334] bg-[#090d14] p-1.5">
                  <span className="text-zinc-400 block">NRI Quota</span>
                  <span className={student.isNri ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                    {student.isNri ? "YES" : "NO"}
                  </span>
                </div>
                <div className="rounded border border-[#1a2334] bg-[#090d14] p-1.5">
                  <span className="text-zinc-400 block">OCI Cardholder</span>
                  <span className={student.isOci ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                    {student.isOci ? "YES" : "NO"}
                  </span>
                </div>
                <div className="rounded border border-[#1a2334] bg-[#090d14] p-1.5">
                  <span className="text-zinc-400 block">Foreign National</span>
                  <span className={student.isForeignNational ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                    {student.isForeignNational ? "YES" : "NO"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Hash & Ledger Audit Trail */}
            <div className="rounded border border-[#182130] bg-[#0c1017] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-400">
                  Cryptographic Integrity Seal
                </span>
                <span className="font-mono text-[10px] text-emerald-400">SHA-256</span>
              </div>

              <div className="rounded bg-[#080b11] p-2 font-mono text-[10px] text-zinc-400 break-all border border-[#151d2a]">
                {student.integrityHash}
              </div>

              <div className="space-y-2 pt-2 border-t border-[#161c28]">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">
                  Immutable Audit Trail
                </span>
                {student.auditTrail.map((ev, i) => (
                  <div key={i} className="text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>{ev.event}</span>
                    </div>
                    <div className="font-mono text-[10px] text-zinc-400">
                      {formatDateTime(ev.timestamp)} • by {ev.actor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-6 border-t border-[#182132] pt-4">
            <button
              onClick={onClose}
              className="w-full rounded border border-[#1f2838] bg-[#0e131d] py-2 text-xs font-semibold text-zinc-200 hover:bg-[#121926] hover:text-white"
            >
              Close Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
