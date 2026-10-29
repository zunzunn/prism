import React, { useState } from "react";
import {
  ReportType,
  ReportDefinition,
} from "@/types/reports";
import { AcademicYear, StateUT } from "@/types/governance";
import { ACADEMIC_YEARS, STATE_LIST } from "@/data/governanceData";
import { MOCK_INSTITUTIONS } from "@/data/institutionsData";
import {
  Download,
  Filter,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";

interface ReportConfigCardProps {
  definitions: ReportDefinition[];
  onGenerateReport: (options: {
    reportType: ReportType;
    academicYear?: AcademicYear | "All";
    state?: StateUT | "All";
    institutionCode?: string | "All";
  }) => Promise<void>;
  generating: boolean;
}

export const ReportConfigCard: React.FC<ReportConfigCardProps> = ({
  definitions,
  onGenerateReport,
  generating,
}) => {
  const [selectedType, setSelectedType] = useState<ReportType>("intake_utilization");
  const [academicYear, setAcademicYear] = useState<AcademicYear | "All">("All");
  const [state, setState] = useState<StateUT | "All">("All");
  const [institutionCode, setInstitutionCode] = useState<string | "All">("All");

  const currentDef = definitions.find((d) => d.type === selectedType) || definitions[0]!;

  const handleDownloadClick = async () => {
    await onGenerateReport({
      reportType: selectedType,
      academicYear,
      state,
      institutionCode,
    });
  };

  return (
    <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-[#141b27] pb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Statutory CSV Report Generator
          </h2>
        </div>
        <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
          RFC-4180 Formatted
        </span>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {definitions.map((def) => {
          const isSelected = def.type === selectedType;
          return (
            <button
              key={def.type}
              onClick={() => setSelectedType(def.type)}
              className={`rounded border p-2.5 text-left transition ${
                isSelected
                  ? "border-emerald-500/50 bg-[#101724] text-white shadow-sm"
                  : "border-[#182130] bg-[#080b11] text-zinc-400 hover:border-[#222f42] hover:text-zinc-200"
              }`}
            >
              <div className="font-mono text-[10px] uppercase text-zinc-400">
                {def.category}
              </div>
              <div className="font-semibold text-xs mt-1 truncate">
                {def.title.split(" ")[0]} {def.title.split(" ")[1]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Report Detailed Profile */}
      <div className="rounded border border-[#161c28] bg-[#080b11] p-4 space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-bold text-white">
            {currentDef.title}
          </h3>
          <span className="font-mono text-[11px] text-zinc-400">
            Export Target: <span className="text-emerald-400">{currentDef.filenamePrefix}-*.csv</span>
          </span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {currentDef.description}
        </p>

        {/* Columns Included Preview */}
        <div className="pt-1">
          <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
            Included Schema Columns ({currentDef.expectedColumns.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentDef.expectedColumns.map((col, idx) => (
              <span
                key={idx}
                className="rounded border border-[#1b2333] bg-[#0c1017] px-2 py-0.5 font-mono text-[10px] text-zinc-300"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Disclaimer Warning */}
        <div className="rounded border border-[#1e2738] bg-[#0c1017] p-2.5 text-[11px] text-zinc-400 font-mono">
          <span className="text-amber-400 font-bold">Metadata Banner: </span>
          {currentDef.complianceNotice} Each generated file embeds export timestamp, operator identity, and environment disclaimer comments.
        </div>
      </div>

      {/* Active Export Filter Parameters */}
      <div className="rounded border border-[#182130] bg-[#080b11] p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 uppercase font-mono">
          <Filter className="h-3.5 w-3.5 text-emerald-400" />
          <span>Apply Active Report Filters</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Academic Year */}
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value as AcademicYear | "All")}
              className="w-full rounded border border-[#1b2333] bg-[#0c1017] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter Academic Year"
            >
              <option value="All">All Academic Years</option>
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  AY {yr}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              State / Union Territory
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as StateUT | "All")}
              className="w-full rounded border border-[#1b2333] bg-[#0c1017] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter State"
            >
              <option value="All">All States / UTs</option>
              {STATE_LIST.filter((s) => s !== "All States / UTs").map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Institution Filter */}
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
              Specific Institution
            </label>
            <select
              value={institutionCode}
              onChange={(e) => setInstitutionCode(e.target.value)}
              className="w-full rounded border border-[#1b2333] bg-[#0c1017] py-1.5 px-3 font-mono text-xs text-zinc-300 focus:border-emerald-500/50 focus:outline-none"
              aria-label="Filter Institution"
            >
              <option value="All">All Institutions</option>
              {MOCK_INSTITUTIONS.map((inst) => (
                <option key={inst.id} value={inst.code}>
                  {inst.code} ({inst.name.split(" ")[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Download Action Button */}
      <div className="flex items-center justify-between border-t border-[#141b27] pt-4">
        <div className="text-xs text-zinc-400 font-mono">
          Format: <span className="text-zinc-200">RFC-4180 CSV with UTF-8 BOM</span>
        </div>

        <button
          onClick={handleDownloadClick}
          disabled={generating}
          className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
        >
          {generating ? (
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
          ) : (
            <Download className="h-4 w-4 text-emerald-400" />
          )}
          <span>{generating ? "Exporting CSV..." : "Generate & Download CSV"}</span>
        </button>
      </div>
    </div>
  );
};
