import React, { useState } from "react";
import {
  ReportType,
  GeneratedReportRecord,
} from "@/types/reports";
import { AcademicYear, StateUT } from "@/types/governance";
import {
  REPORT_DEFINITIONS,
  generateAndDownloadReport,
  getSessionReportHistory,
} from "@/services/reportService";
import { ReportConfigCard } from "@/components/reports/ReportConfigCard";
import { RecentExportsTable } from "@/components/reports/RecentExportsTable";
import { CheckCircle2 } from "lucide-react";

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<GeneratedReportRecord[]>(
    getSessionReportHistory()
  );
  const [generating, setGenerating] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleGenerateReport = async (options: {
    reportType: ReportType;
    academicYear?: AcademicYear | "All";
    state?: StateUT | "All";
    institutionCode?: string | "All";
  }) => {
    setGenerating(true);
    try {
      const record = await generateAndDownloadReport(
        options,
        "AICTE Authorized Compliance Officer"
      );
      setReports(getSessionReportHistory());
      setSuccessBanner(
        `Compiled "${record.title}" (${record.rowCount} records) and initiated browser download as "${record.filename}".`
      );
      setTimeout(() => setSuccessBanner(null), 6000);
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AICTE Compliance & Governance Reports
            </h1>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              Statutory Export Suite
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Compile and download standardized, auditable CSV datasets for intake capacity, anomaly findings, and enrollment reconciliations.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Report Generator Component */}
      <ReportConfigCard
        definitions={REPORT_DEFINITIONS}
        onGenerateReport={handleGenerateReport}
        generating={generating}
      />

      {/* Session Export History */}
      <RecentExportsTable reports={reports} />
    </div>
  );
};

export default ReportsPage;
