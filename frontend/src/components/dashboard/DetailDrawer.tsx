import React from "react";
import { DuplicateAlertRecord } from "@/types/governance";
import {
  X,
  AlertTriangle,
  Building2,
  Calendar,
  Send,
  CheckCircle,
} from "lucide-react";

interface DetailDrawerProps {
  alert: DuplicateAlertRecord | null;
  onClose: () => void;
  onResolve?: (id: string, action: string) => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  alert,
  onClose,
  onResolve,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md border-l border-[#1f2838] bg-[#090c12] p-6 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#182132] pb-4">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded border ${
                    alert.severity === "Critical"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    Duplicate Enrolment Detail
                  </h3>
                  <span className="font-mono text-[10px] text-zinc-400">
                    Anomaly Ref: {alert.id}
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

            {/* Student & Confidence Card */}
            <div className="mt-5 rounded border border-[#1a2334] bg-[#0c1017] p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-100">
                    {alert.studentName}
                  </h4>
                  <p className="font-mono text-[11px] text-emerald-400">
                    APAAR: {alert.apaarId}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-rose-400">
                    {alert.confidenceScore}%
                  </span>
                  <span className="block text-[9px] font-mono uppercase text-zinc-400">
                    Confidence
                  </span>
                </div>
              </div>

              <div className="mt-3 border-t border-[#161c28] pt-2 text-[11px] text-zinc-400">
                <span>Program: </span>
                <span className="text-zinc-200">{alert.program}</span>
              </div>
            </div>

            {/* Overlapping Institutional Nodes */}
            <div className="mt-4 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Conflicting Institutional Nodes
              </span>

              <div className="rounded border border-[#1b2536] bg-[#0d121c] p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Primary Node (Reported First)</span>
                </div>
                <p className="mt-1 text-xs text-zinc-300 font-medium">
                  {alert.primaryInstitution}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                  <Calendar className="h-3 w-3" />
                  <span>Overlap: {alert.overlapPeriod}</span>
                </div>
              </div>

              <div className="rounded border border-[#2a1d24] bg-[#140e13] p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                  <Building2 className="h-3.5 w-3.5 text-rose-400" />
                  <span>Conflicting Secondary Node</span>
                </div>
                <p className="mt-1 text-xs text-zinc-300 font-medium">
                  {alert.conflictingInstitution}
                </p>
                <div className="mt-1.5 text-[10px] font-mono text-zinc-400">
                  <span>State: {alert.state}</span>
                </div>
              </div>
            </div>

            {/* Algorithmic Explanation */}
            <div className="mt-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Explainable Algorithmic Diagnosis
              </span>
              <p className="mt-1.5 rounded border border-[#17202e] bg-[#080b10] p-3 text-xs leading-relaxed text-zinc-300">
                {alert.explanation}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 border-t border-[#182132] pt-4 space-y-2">
            <button
              onClick={() => {
                if (onResolve) onResolve(alert.id, "Notice Issued");
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded border border-rose-500/40 bg-rose-500/15 py-2.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/25"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Issue Discrepancy Notice to Nodes</span>
            </button>

            <button
              onClick={() => {
                if (onResolve) onResolve(alert.id, "Resolved");
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded border border-[#1f2838] bg-[#0d121c] py-2 text-xs font-medium text-zinc-300 transition hover:bg-[#121926] hover:text-white"
            >
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Mark as Verified Transfer (False Positive)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
