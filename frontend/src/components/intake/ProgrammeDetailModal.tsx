import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProgrammeIntakeRow } from "@/types/intake";
import { fetchProgrammeIntakeDetail } from "@/services/intakeService";
import {
  X,
  Building2,
  Scale,
  Users,
  Layers,
  ExternalLink,
  AlertOctagon,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface ProgrammeDetailModalProps {
  programmeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProgrammeDetailModal: React.FC<ProgrammeDetailModalProps> = ({
  programmeId,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<{
    row: ProgrammeIntakeRow | null;
    enrolledStudentsCount: number;
    sampleStudents: Array<{ id: string; name: string; apaarId: string; category: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !programmeId) {
      setData(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchProgrammeIntakeDetail(programmeId);
        setData(res);
      } catch (err) {
        console.error("Failed to load programme intake detail:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, programmeId]);

  if (!isOpen || !programmeId) return null;

  const row = data?.row;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded border border-[#1f2838] bg-[#0c1017] p-6 shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#182132] pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">
                  {row?.programmeName || "Programme Intake Ledger"}
                </h2>
                <span className="rounded border border-[#1e2738] bg-[#111724] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                  {row?.degreeLevel}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {row?.institutionName} (Code: {row?.institutionCode}) • AY {row?.academicYear}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close programme detail modal"
            className="rounded p-1 text-zinc-400 transition hover:bg-[#121824] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading || !row ? (
          <div className="py-16 text-center text-xs text-zinc-400 font-mono">
            Loading regulatory intake parameters...
          </div>
        ) : (
          <div className="space-y-5 pt-4">
            {/* Status & Denominator Banner */}
            <div
              className={`rounded border p-4 text-xs ${
                row.complianceStatus === "Over Capacity Breach"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  : row.complianceStatus === "Requires Review"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : row.complianceStatus === "Near Capacity"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold font-mono uppercase tracking-wider">
                  {row.complianceStatus === "Over Capacity Breach" ? (
                    <AlertOctagon className="h-4 w-4 text-rose-400" />
                  ) : row.complianceStatus === "Requires Review" ? (
                    <HelpCircle className="h-4 w-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  <span>Status: {row.complianceStatus}</span>
                </div>
                <span className="font-mono text-[11px]">
                  Effective Utilization: {row.effectiveUtilizationRate}%
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-300">
                {row.statusReason}
              </p>
            </div>

            {/* Capacity Denominator Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded border border-[#161c28] bg-[#080b11] p-3 text-center">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">
                  Base Sanctioned
                </div>
                <div className="text-base font-bold font-mono text-white mt-1">
                  {row.baseApprovedIntake}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">Regular seats</div>
              </div>

              <div className="rounded border border-[#161c28] bg-[#080b11] p-3 text-center">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">
                  Supernumerary
                </div>
                <div className="text-base font-bold font-mono text-amber-300 mt-1">
                  +{row.supernumerary.totalSupernumeraryApproved}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">EWS + TFW + Special</div>
              </div>

              <div className="rounded border border-[#161c28] bg-[#080b11] p-3 text-center">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">
                  Max Permissible Cap
                </div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-1">
                  {row.totalPermissibleCapacity}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">Total denominator</div>
              </div>

              <div className="rounded border border-[#161c28] bg-[#080b11] p-3 text-center">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">
                  Reported Enrolment
                </div>
                <div className="text-base font-bold font-mono text-sky-300 mt-1">
                  {row.reportedEnrolment}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">Admitted students</div>
              </div>
            </div>

            {/* Supernumerary Allowances Detail Table */}
            <div className="rounded border border-[#161c28] bg-[#080b11] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 uppercase font-mono">
                  <Layers className="h-4 w-4 text-emerald-400" />
                  <span>Approved Supernumerary Quota Matrix</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  Ref: {row.approvalLetterRef}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 font-mono">
                <div className="rounded bg-[#0c1017] p-2 border border-[#131924]">
                  <span className="text-[10px] text-zinc-400">EWS Quota (10%):</span>
                  <div className="text-zinc-200 font-bold">{row.supernumerary.ews10Percent} seats</div>
                </div>
                <div className="rounded bg-[#0c1017] p-2 border border-[#131924]">
                  <span className="text-[10px] text-zinc-400">TFW Waiver (5%):</span>
                  <div className="text-zinc-200 font-bold">{row.supernumerary.tfw5Percent} seats</div>
                </div>
                <div className="rounded bg-[#0c1017] p-2 border border-[#131924]">
                  <span className="text-[10px] text-zinc-400">PMSSS (J&K):</span>
                  <div className="text-zinc-200 font-bold">{row.supernumerary.pmsss} seats</div>
                </div>
                <div className="rounded bg-[#0c1017] p-2 border border-[#131924]">
                  <span className="text-[10px] text-zinc-400">NRI / PIO:</span>
                  <div className="text-zinc-200 font-bold">{row.supernumerary.nriPio} seats</div>
                </div>
              </div>
            </div>

            {/* Sample Enrolled Candidates */}
            {data.sampleStudents.length > 0 && (
              <div className="rounded border border-[#161c28] bg-[#080b11] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#141b27] pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 uppercase font-mono">
                    <Users className="h-4 w-4 text-emerald-400" />
                    <span>Sample Enrolled Students In Registry</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Showing {data.sampleStudents.length} candidate(s)
                  </span>
                </div>

                <div className="divide-y divide-[#131924] text-xs">
                  {data.sampleStudents.map((stu) => (
                    <div
                      key={stu.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <span className="font-semibold text-zinc-200">{stu.name}</span>
                        <div className="text-[10px] font-mono text-zinc-400">
                          APAAR: {stu.apaarId} • Category: {stu.category}
                        </div>
                      </div>
                      <Link
                        to={`/students/${stu.id}`}
                        className="inline-flex items-center gap-1 rounded border border-[#1e2738] bg-[#0c1017] px-2 py-1 text-[11px] text-zinc-300 hover:text-white"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3 text-emerald-400" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-[#182132] pt-4">
              <Link
                to={`/institutions/${row.institutionCode}`}
                className="inline-flex items-center gap-1.5 rounded border border-[#1e2738] bg-[#0e131d] px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-[#141c2a] hover:text-white"
              >
                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Open Institution Profile</span>
              </Link>

              <button
                onClick={onClose}
                className="rounded border border-[#1e2738] bg-[#0c1017] px-4 py-1.5 text-xs text-zinc-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
