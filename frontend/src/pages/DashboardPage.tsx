import React from "react";
import { SystemStatusBanner } from "@/components/dashboard/SystemStatusBanner";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RecentVerificationsTable } from "@/components/dashboard/RecentVerificationsTable";
import { mockSystemMetrics, mockRecentVerifications } from "@/data/mockData";
import {
  FileCheck2,
  UploadCloud,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Protocol Status Banner */}
      <SystemStatusBanner />

      {/* KPI Metric Cards */}
      <MetricsGrid metrics={mockSystemMetrics} />

      {/* Action Bar / Quick Tools */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded border border-[#1b2333] bg-[#0c1017] p-4 transition hover:border-[#28364e]">
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-100">
                Single Credential Verification
              </h3>
              <p className="mt-1 text-[11px] text-zinc-400">
                Verify degree or diploma using APAAR ID or cryptographically sealed document hash.
              </p>
            </div>
          </div>
          <button className="mt-3.5 flex items-center justify-between border-t border-[#161c28] pt-2.5 text-xs font-medium text-emerald-400 transition hover:text-emerald-300">
            <span>Launch Verifier</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col justify-between rounded border border-[#1b2333] bg-[#0c1017] p-4 transition hover:border-[#28364e]">
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#202a3d] bg-[#111722] text-zinc-300">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-100">
                Bulk Batch Ingestion
              </h3>
              <p className="mt-1 text-[11px] text-zinc-400">
                Upload institutional student CSV/JSON payloads to trigger asynchronous hash generation.
              </p>
            </div>
          </div>
          <button className="mt-3.5 flex items-center justify-between border-t border-[#161c28] pt-2.5 text-xs font-medium text-zinc-300 transition hover:text-white">
            <span>Upload Dataset</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col justify-between rounded border border-[#1b2333] bg-[#0c1017] p-4 transition hover:border-[#28364e]">
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-100">
                Audit Discrepancy Queue
              </h3>
              <p className="mt-1 text-[11px] text-zinc-400">
                Review 1,600 flagged transcript anomalies flagged by AICTE automated rule engine.
              </p>
            </div>
          </div>
          <button className="mt-3.5 flex items-center justify-between border-t border-[#161c28] pt-2.5 text-xs font-medium text-rose-400 transition hover:text-rose-300">
            <span>Review Flags</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Live Recent Verifications */}
      <RecentVerificationsTable records={mockRecentVerifications} />
    </div>
  );
};
