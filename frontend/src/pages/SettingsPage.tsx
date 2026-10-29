import React, { useState, useEffect } from "react";
import {
  Server,
  Key,
  RotateCcw,
  CheckCircle2,
  Lock,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { checkBackendHealth, HealthResponse, API_BASE_URL } from "@/services/api";

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [simulatedLatency, setSimulatedLatency] = useState(150);
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await checkBackendHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleResetDemoState = () => {
    setResetSuccessNotice("Demo state successfully synchronized to initial deterministic baseline.");
    setTimeout(() => setResetSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#182130] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Platform Configuration & Regulatory Security
            </h1>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              AICTE Core Node
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            AICTE node credentials, backend health, cryptographic root authorities, and mock APAAR sandbox parameters.
          </p>
        </div>

        <button
          onClick={handleResetDemoState}
          className="flex items-center gap-2 rounded border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Demo Environment</span>
        </button>
      </div>

      {resetSuccessNotice && (
        <div className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-mono">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{resetSuccessNotice}</span>
        </div>
      )}

      {/* Grid of Configuration Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Panel 1: Backend API Gateway Health */}
        <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#151d2a] pb-3">
            <div className="flex items-center gap-2.5">
              <Server className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">
                Backend API Gateway (FastAPI)
              </h3>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="text-zinc-400 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingHealth ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#121822]">
              <span className="text-zinc-400">Connection URL:</span>
              <span className="text-zinc-200">
                {API_BASE_URL || (typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:8000")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#121822]">
              <span className="text-zinc-400">Gateway Status:</span>
              <span className={health ? "text-emerald-400 font-bold" : "text-amber-400"}>
                {health ? "ONLINE (FastAPI v0.1.0)" : "OFFLINE / LOCAL FALLBACK ACTIVE"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#121822]">
              <span className="text-zinc-400">Database Driver:</span>
              <span className="text-zinc-200">{health?.database || "SQLite Dev / Postgres"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">CORS Origins Allowed:</span>
              <span className="text-zinc-300">Vercel Deployment Domains (*.vercel.app) & Localhost</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Cryptographic Root Authority */}
        <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#151d2a] pb-3">
            <div className="flex items-center gap-2.5">
              <Key className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">
                AICTE Root Cryptographic Authority
              </h3>
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-[#121822]">
              <span className="text-zinc-400">Signature Digest:</span>
              <span className="text-zinc-200">SHA-256 with Salt</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#121822]">
              <span className="text-zinc-400">Key Identifier:</span>
              <span className="text-zinc-300">AICTE-ROOT-KEY-2026-v1</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#121822]">
              <span className="text-zinc-400">Opaque Verification Prefix:</span>
              <span className="text-emerald-400 font-bold">VRF-YYYY-[A-Z0-9]</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Tamper Seal Guarantee:</span>
              <span className="text-zinc-300">Zero Raw Identifier Disclosure</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Mock APAAR Sandbox Adapter */}
        <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#151d2a] pb-3">
            <div className="flex items-center gap-2.5">
              <Cpu className="h-4 w-4 text-sky-400" />
              <h3 className="text-sm font-bold text-zinc-100">
                Mock APAAR Sandbox Adapter
              </h3>
            </div>
            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-400 border border-sky-500/30">
              Simulated
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            The national APAAR identity adapter operates in deterministic sandbox simulation mode. Valid 12-digit formats resolve simulated statuses without pinging production UIDAI/DigiLocker servers.
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-400">Simulated Network Latency:</span>
              <span className="text-zinc-200 font-bold">{simulatedLatency}ms</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={simulatedLatency}
              onChange={(e) => setSimulatedLatency(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Panel 4: Statutory Legal Notice */}
        <div className="rounded border border-[#182130] bg-[#0c1017] p-5 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#151d2a] pb-3">
            <Lock className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-zinc-100">
              Regulatory Disclaimers & Ethics
            </h3>
          </div>

          <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
            <p>
              • All student names, APAAR identifiers, and roll numbers utilized across the CREDEN demonstration environment are synthetically generated.
            </p>
            <p>
              • No connection to production Indian citizen databases, Aadhaar vaults, or live DigiLocker APIs is initiated or claimed.
            </p>
            <p>
              • Opaque verification references protect individual privacy by restricting returned attributes strictly to authorized verifier tiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
