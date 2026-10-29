import React from "react";
import { Link } from "react-router-dom";
import { Fingerprint, ExternalLink, ShieldCheck, ArrowUpRight } from "lucide-react";

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
    <footer id="security" className="border-t border-[#222f44] bg-[#080c14] px-4 pt-14 pb-8 sm:px-6 lg:px-8 text-zinc-100">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-900/30">
                <Fingerprint className="h-5 w-5" />
              </div>
              <span className="font-mono text-lg font-bold tracking-wider text-white uppercase">
                CREDEN
              </span>
            </div>
            <p className="mt-3.5 max-w-md text-sm leading-relaxed text-zinc-100 font-normal">
              National Student Data Management & Academic Verification Platform. Built to enforce AICTE academic integrity, eliminate duplicate enrollments, and verify technical education credentials in real-time.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-mono font-medium text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Standard: AICTE NEP-2020 / APAAR Architecture</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase">
              Platform Navigation
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-xs font-medium">
              <li>
                <Link
                  to="/dashboard"
                  className="text-zinc-200 transition-colors hover:text-white hover:underline focus:outline-none focus:text-white"
                >
                  Explore Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={scrollToWorkflow}
                  className="text-zinc-200 transition-colors hover:text-white hover:underline focus:outline-none focus:text-white text-left"
                >
                  Workflow Architecture
                </button>
              </li>
              <li>
                <Link
                  to="/dashboard?demo=true"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-300 transition-colors hover:text-emerald-200 focus:outline-none focus:text-emerald-200"
                >
                  <span>Interactive Demo Mode</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <button
                  onClick={scrollToTop}
                  className="text-zinc-200 transition-colors hover:text-white hover:underline focus:outline-none focus:text-white text-left"
                >
                  Back to Top
                </button>
              </li>
            </ul>
          </div>

          {/* Regulatory & Specifications */}
          <div>
            <h3 className="text-xs font-bold tracking-wider text-white uppercase">
              Technical Specs
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-xs font-mono">
              <li className="flex items-center gap-1.5">
                <span className="text-zinc-400">Hashing:</span>
                <span className="font-semibold text-zinc-100">SHA-256 Digest</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-zinc-400">Identifier:</span>
                <span className="font-semibold text-zinc-100">12-Digit APAAR</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-zinc-400">Sync Protocol:</span>
                <span className="font-semibold text-zinc-100">REST / TLS 1.3</span>
              </li>
              <li className="pt-1 font-sans">
                <a
                  href="/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  <span>Backend OpenAPI Docs</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-[#1e2a3d] pt-6 text-xs text-zinc-300 sm:flex-row">
          <p className="font-medium text-zinc-200">© 2026 CREDEN. All India Council for Technical Education (AICTE).</p>
          <p className="mt-2 font-mono sm:mt-0 text-zinc-300">
            Interactive Prototype Environment • Node DEL-01
          </p>
        </div>
      </div>
    </footer>
  );
};
