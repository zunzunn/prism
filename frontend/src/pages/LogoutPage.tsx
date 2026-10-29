import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  Home,
  RefreshCw,
  Clock,
  Key,
} from "lucide-react";

export const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(12);
  const [isCancelled, setIsCancelled] = useState(false);
  const [logoutTimestamp] = useState(() =>
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  );
  const [sessionHash] = useState(() =>
    "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
  );

  useEffect(() => {
    if (isCancelled) return;

    if (countdown <= 0) {
      navigate("/");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isCancelled, navigate]);

  return (
    <div className="min-h-screen bg-[#05070a] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <header className="border-b border-[#182030] bg-[#07090e]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/70 transition-colors">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
                CREDEN
              </span>
              <span className="text-[9px] font-semibold tracking-tight text-zinc-400 uppercase">
                AICTE Governance
              </span>
            </div>
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In Again</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-12 sm:px-6 overflow-hidden">
        {/* Ambient backlight glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="rounded-2xl border border-white/10 bg-[#0c1424]/75 p-8 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] text-center">
            {/* Status Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-white">
              Successfully Signed Out
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm mx-auto">
              Your active session and cryptographic authorization token have been securely cleared from this terminal.
            </p>

            {/* Session Invalidation Receipt */}
            <div className="mt-6 rounded-lg border border-[#1b2333] bg-[#070b12] p-4 text-left font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#141b27]">
                <span className="text-zinc-400">Security Event:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  SESSION_REVOKED
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Timestamp:
                </span>
                <span className="text-zinc-200">{logoutTimestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Key className="h-3 w-3" /> Session Hash:
                </span>
                <span className="text-zinc-300 truncate max-w-[180px]">{sessionHash}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Terminal Cache:</span>
                <span className="text-zinc-200">Purged & Secured</span>
              </div>
            </div>

            {/* Auto Redirect Countdown */}
            {!isCancelled && (
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400">
                <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                <span>Redirecting to homepage in {countdown}s...</span>
                <button
                  type="button"
                  onClick={() => setIsCancelled(true)}
                  className="ml-1 text-emerald-400 underline hover:text-emerald-300"
                >
                  Stay here
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 shadow-md shadow-emerald-950/40"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In Again</span>
              </Link>

              <Link
                to="/"
                className="flex items-center justify-center gap-2 rounded-lg border border-[#26344b] bg-[#0e1420] px-4 py-2.5 text-xs font-semibold text-zinc-200 transition hover:border-[#384a6b] hover:bg-[#141b2b] hover:text-white"
              >
                <Home className="h-4 w-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#182030] bg-[#07090e] px-6 py-4 text-xs text-zinc-300 text-center">
        <p>© 2026 CREDEN — All India Council for Technical Education. Safe session closure verified.</p>
      </footer>
    </div>
  );
};
