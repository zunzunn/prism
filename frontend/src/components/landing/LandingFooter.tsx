import React from "react";
import { Link } from "react-router-dom";
import { Fingerprint, ExternalLink, ShieldCheck, ArrowUpRight, LogIn } from "lucide-react";

export const LandingFooter: React.FC = () => {
  const scrollToWorkflow = () => {
    const el = document.getElementById("workflow");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="security" className="relative z-20 border-t-2 border-[#2b3a54] bg-[#0c1320] text-zinc-100">
      {/* Top Emerald Gradient Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-90 shadow-sm shadow-emerald-400/50" />

      <div className="mx-auto max-w-7xl px-4 pt-14 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-14">
          
          {/* Brand & Purpose Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-emerald-400 bg-emerald-500/25 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <Fingerprint className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xl font-black tracking-widest text-white uppercase">
                  CREDEN
                </span>
                <span className="text-[10px] font-bold tracking-wider text-emerald-300 uppercase font-mono">
                  National Academic Governance Platform
                </span>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-100 font-medium">
              National Student Data Management & Academic Verification Platform. Built to enforce AICTE academic integrity, eliminate duplicate enrollments, and verify technical education credentials in real-time.
            </p>

            <div className="mt-5 inline-flex items-center gap-2.5 rounded-lg border-2 border-emerald-500/70 bg-emerald-950/90 px-4 py-2 text-xs font-mono font-bold text-emerald-200 shadow-md shadow-emerald-950/60">
              <ShieldCheck className="h-4 w-4 text-emerald-300 shrink-0" />
              <span>Standard: AICTE NEP-2020 / APAAR Architecture</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h3 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2 border-b border-[#23334d] pb-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>Platform Navigation</span>
            </h3>
            <ul className="mt-4 space-y-3 text-sm font-semibold">
              <li>
                <Link
                  to="/dashboard"
                  className="text-zinc-100 transition-colors hover:text-emerald-300 hover:underline inline-flex items-center gap-1.5"
                >
                  Explore Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={scrollToWorkflow}
                  className="text-zinc-100 transition-colors hover:text-emerald-300 hover:underline inline-flex items-center gap-1.5 text-left cursor-pointer"
                >
                  Workflow Architecture
                </button>
              </li>
              <li>
                <Link
                  to="/dashboard?demo=true"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-300 transition-colors hover:text-emerald-200 bg-emerald-950/60 border border-emerald-500/50 px-3 py-1.5 rounded-md shadow-sm"
                >
                  <span>Interactive Demo Mode</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-zinc-100 transition-colors hover:text-emerald-300 hover:underline inline-flex items-center gap-1.5"
                >
                  <LogIn className="h-4 w-4 text-emerald-400" />
                  <span>Terminal Sign In</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={scrollToTop}
                  className="text-zinc-200 transition-colors hover:text-white inline-flex items-center gap-1 text-left cursor-pointer"
                >
                  <span>Back to Top</span>
                  <span>↑</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Specifications */}
          <div>
            <h3 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2 border-b border-[#23334d] pb-2.5">
              <span className="h-2 w-2 rounded-full bg-sky-400"></span>
              <span>Technical Specs</span>
            </h3>
            <ul className="mt-4 space-y-2.5 font-mono text-xs">
              <li className="flex items-center justify-between rounded-md border border-[#253650] bg-[#101726] px-3 py-2">
                <span className="text-zinc-300 font-semibold">Hashing:</span>
                <span className="font-bold text-emerald-300 bg-[#172236] px-2 py-0.5 rounded border border-[#2b3c58]">SHA-256 Digest</span>
              </li>
              <li className="flex items-center justify-between rounded-md border border-[#253650] bg-[#101726] px-3 py-2">
                <span className="text-zinc-300 font-semibold">Identifier:</span>
                <span className="font-bold text-emerald-300 bg-[#172236] px-2 py-0.5 rounded border border-[#2b3c58]">12-Digit APAAR</span>
              </li>
              <li className="flex items-center justify-between rounded-md border border-[#253650] bg-[#101726] px-3 py-2">
                <span className="text-zinc-300 font-semibold">Sync Protocol:</span>
                <span className="font-bold text-emerald-300 bg-[#172236] px-2 py-0.5 rounded border border-[#2b3c58]">REST / TLS 1.3</span>
              </li>
              <li className="pt-2 font-sans">
                <a
                  href="/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-emerald-500/60 bg-emerald-950/80 px-3.5 py-2.5 text-xs font-bold text-emerald-200 hover:bg-emerald-900/80 hover:text-white transition-all shadow-sm"
                >
                  <span>Backend OpenAPI Docs</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & node badge */}
        <div className="mt-12 flex flex-col items-center justify-between border-t-2 border-[#1f2d45] pt-6 sm:flex-row gap-4">
          <p className="font-bold text-zinc-100 text-xs sm:text-sm text-center sm:text-left">
            © 2026 CREDEN. All India Council for Technical Education (AICTE).
          </p>
          <div className="flex items-center gap-2 rounded-full border border-[#283957] bg-[#101726] px-3.5 py-1 text-xs font-mono font-bold text-zinc-100 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Node DEL-01 (Active Production Prototype)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
