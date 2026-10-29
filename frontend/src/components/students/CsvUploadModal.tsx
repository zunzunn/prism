import React, { useState, useRef } from "react";
import { CsvImportSummary } from "@/types/students";
import { validateParsedCsvRows } from "@/services/studentService";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertOctagon,
  ArrowRight,
} from "lucide-react";

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (summary: CsvImportSummary) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "processing" | "results">(
    "upload"
  );
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<CsvImportSummary | null>(null);
  const [selectedResultFilter, setSelectedResultFilter] = useState<
    "All" | "Rejected" | "Warning" | "Valid"
  >("All");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download sample CSV template
  const handleDownloadTemplate = () => {
    const csvContent =
      "apaar_id,student_id,full_name,programme,academic_year,admission_category,supernumerary_quota,nri_status\n" +
      "982344129011,COEP/2026/CS/042,Aarav Sharma,Computer Science & Engineering,2026-27,General,None,No\n" +
      "481077213490,COEP/2026/CS/043,Priya Sundaram,Computer Science & Engineering,2026-27,OBC,Tuition Fee Waiver,No\n" +
      "INVALID-APAAR,COEP/2026/CS/044,Test Invalid Student,Mechanical Engineering,2026-27,SC,None,No\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "aicte_student_enrollment_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Parse CSV File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length > 0 && lines[0]) {
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        setParsedHeaders(headers);

        const rows: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i];
          if (!currentLine) continue;
          const cols = currentLine.split(",").map((c) => c.trim());
          const rowObj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = cols[idx] || "";
          });
          rows.push(rowObj);
        }

        setParsedRows(rows);
        setStep("preview");
      }
    };

    reader.readAsText(uploadedFile);
  };

  // 3. Process Validation
  const handleStartValidation = () => {
    if (!file) return;
    setStep("processing");
    setProgress(15);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          // Run actual schema validator
          const res = validateParsedCsvRows(parsedHeaders, parsedRows, file.name);
          setSummary(res);
          setStep("results");
          if (onImportComplete) {
            onImportComplete(res);
          }
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  // 4. Download Validation Error Report
  const handleDownloadErrorReport = () => {
    if (!summary) return;

    let csvContent = "row_number,student_id,apaar_id,status,errors,warnings\n";
    summary.rowResults.forEach((r) => {
      if (r.status !== "Valid") {
        const rowErr = r.errors.join("; ").replace(/"/g, '""');
        const rowWarn = r.warnings.join("; ").replace(/"/g, '""');
        const sId = r.data["student_id"] || "";
        const apaar = r.data["apaar_id"] || "";
        csvContent += `${r.rowNumber},"${sId}","${apaar}",${r.status},"${rowErr}","${rowWarn}"\n`;
      }
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `validation_errors_${summary.fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setFile(null);
    setParsedHeaders([]);
    setParsedRows([]);
    setStep("upload");
    setProgress(0);
    setSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredResults =
    summary?.rowResults.filter((r) =>
      selectedResultFilter === "All" ? true : r.status === selectedResultFilter
    ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl rounded border border-[#1f2838] bg-[#0c1017] p-6 shadow-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#182132] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Institutional Student CSV Batch Ingestion
              </h3>
              <p className="text-[11px] text-zinc-400">
                High-throughput APAAR validation & intake quota verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded p-1 text-zinc-400 transition hover:bg-[#121824] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* STEP 1: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded border border-[#1b2536] bg-[#090d14] p-4 text-xs">
                <div>
                  <h4 className="font-semibold text-zinc-200">
                    AICTE Standard Ingestion Schema
                  </h4>
                  <p className="mt-0.5 text-zinc-400">
                    Use our template to prevent schema mapping anomalies and format rejections.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download CSV Template</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded border-2 border-dashed border-[#1f293d] bg-[#080b11] p-10 text-center cursor-pointer transition hover:border-emerald-500/50 hover:bg-[#0a0e16]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#232f45] bg-[#111724] text-emerald-400 mb-3">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold text-zinc-200">
                  Select or Drag & Drop Student Enrollment CSV
                </span>
                <span className="mt-1 text-xs text-zinc-400">
                  Supported format: .csv with comma separation (up to 5,000 rows per batch)
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Column Mapping */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#161c28] pb-3 text-xs">
                <div>
                  <span className="font-semibold text-zinc-200">
                    File: {file?.name}
                  </span>{" "}
                  <span className="text-zinc-400 font-mono">
                    ({parsedRows.length} student rows detected)
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Choose another file
                </button>
              </div>

              {/* Check Missing Headers */}
              {(() => {
                const required = [
                  "apaar_id",
                  "student_id",
                  "full_name",
                  "programme",
                  "academic_year",
                ];
                const missing = required.filter(
                  (req) => !parsedHeaders.includes(req)
                );

                if (missing.length > 0) {
                  return (
                    <div className="rounded border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertOctagon className="h-4 w-4 text-rose-400" />
                        <span>Column Mapping Error: Missing Required Headers</span>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-300">
                        The CSV is missing required columns:{" "}
                        <strong className="text-rose-400">
                          {missing.join(", ")}
                        </strong>
                        . Please correct your header names or use the AICTE template.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>
                      Schema Mapping Validated: All 5 required AICTE enrollment headers detected.
                    </span>
                  </div>
                );
              })()}

              {/* Preview Table First 5 rows */}
              <div>
                <span className="text-[11px] font-mono uppercase text-zinc-400">
                  Data Preview (First 5 Rows)
                </span>
                <div className="mt-1.5 overflow-x-auto rounded border border-[#192333] bg-[#080b11]">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#161c28] bg-[#0c1017] text-[10px] font-mono uppercase text-zinc-400">
                      <tr>
                        <th className="p-2">Row</th>
                        {parsedHeaders.map((h) => (
                          <th key={h} className="p-2 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141b27]">
                      {parsedRows.slice(0, 5).map((r, i) => (
                        <tr key={i} className="hover:bg-[#0f141f]">
                          <td className="p-2 font-mono text-[11px] text-zinc-400">
                            #{i + 1}
                          </td>
                          {parsedHeaders.map((h) => (
                            <td
                              key={h}
                              className="p-2 font-mono text-[11px] text-zinc-300 whitespace-nowrap"
                            >
                              {r[h] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="rounded border border-[#1f2838] bg-[#0d121c] px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartValidation}
                  className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                >
                  <span>Submit Batch for Validation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Progress Indicator */}
          {step === "processing" && (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-zinc-100">
                Executing Algorithmic Validation Pipeline...
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Validating 12-digit APAAR format checksums, scanning for cross-institutional duplicate enrollments, and checking program intake caps.
              </p>

              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>Validation Progress</span>
                  <span className="text-emerald-400">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded bg-[#161c28]">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-emerald-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Validation Results */}
          {step === "results" && summary && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
                  <span className="block font-mono text-xl font-bold text-emerald-400">
                    {summary.validRowsCount}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-emerald-400">
                    Valid Records
                  </span>
                </div>

                <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                  <span className="block font-mono text-xl font-bold text-amber-400">
                    {summary.warningRowsCount}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-amber-400">
                    Warnings
                  </span>
                </div>

                <div className="rounded border border-rose-500/30 bg-rose-500/10 p-3 text-center">
                  <span className="block font-mono text-xl font-bold text-rose-400">
                    {summary.rejectedRowsCount}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-rose-400">
                    Rejected Rows
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between border-b border-[#161c28] pb-3 text-xs">
                <div className="flex items-center space-x-1">
                  {(["All", "Rejected", "Warning", "Valid"] as const).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedResultFilter(tab)}
                        className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                          selectedResultFilter === tab
                            ? "bg-[#141b27] text-white border border-[#222e42]"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>

                {summary.rejectedRowsCount > 0 && (
                  <button
                    onClick={handleDownloadErrorReport}
                    className="flex items-center gap-1.5 rounded border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download Error Report (.csv)</span>
                  </button>
                )}
              </div>

              {/* Row Breakdown Table */}
              <div className="overflow-x-auto rounded border border-[#182130] bg-[#080b11] max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-[#161c28] bg-[#0c1017] text-[10px] font-mono uppercase text-zinc-400">
                    <tr>
                      <th className="p-2">Row #</th>
                      <th className="p-2">Student ID</th>
                      <th className="p-2">APAAR ID</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Actionable Diagnostic / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141b27]">
                    {filteredResults.map((res) => (
                      <tr key={res.rowNumber} className="hover:bg-[#0f141f]">
                        <td className="p-2 font-mono text-[11px] text-zinc-400">
                          #{res.rowNumber}
                        </td>
                        <td className="p-2 font-mono text-[11px] text-zinc-200">
                          {res.data["student_id"] || "-"}
                        </td>
                        <td className="p-2 font-mono text-[11px] text-zinc-200">
                          {res.data["apaar_id"] || "-"}
                        </td>
                        <td className="p-2">
                          {res.status === "Valid" ? (
                            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                              PASS
                            </span>
                          ) : res.status === "Warning" ? (
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-mono text-amber-400 border border-amber-500/30">
                              WARN
                            </span>
                          ) : (
                            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-mono text-rose-400 border border-rose-500/30">
                              REJECT
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-xs">
                          {res.errors.length > 0 && (
                            <span className="text-rose-400">
                              {res.errors.join("; ")}
                            </span>
                          )}
                          {res.warnings.length > 0 && (
                            <span className="text-amber-400">
                              {res.warnings.join("; ")}
                            </span>
                          )}
                          {res.errors.length === 0 &&
                            res.warnings.length === 0 && (
                              <span className="text-zinc-500">
                                Fully verified and format compliant
                              </span>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Close / Done */}
              <div className="flex items-center justify-between border-t border-[#161c28] pt-3">
                <span className="text-[11px] text-zinc-400">
                  {summary.validRowsCount} records ready to commit to AICTE registry
                </span>
                <button
                  onClick={onClose}
                  className="rounded border border-emerald-500/40 bg-emerald-500/20 px-5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
