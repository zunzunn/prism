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
    <footer id="security" className="border-t border-[#161f2e] bg-[#05070a] px-4 pt-14 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <Fingerprint className="h-4 w-4" />
              </div>
              <span className="font-mono text-base font-bold tracking-wider text-zinc-100 uppercase">
                CREDEN
              </span>
            </div>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-zinc-400">
              National Student Data Management & Academic Verification Platform. Built to enforce AICTE academic integrity, eliminate duplicate enrollments, and verify technical education credentials in real-time.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Standard: AICTE NEP-2020 / APAAR Architecture</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-zinc-200 uppercase">
              Platform Navigation
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-zinc-400">
              <li>
                <Link
                  to="/dashboard"
                  className="transition hover:text-zinc-200 focus:outline-none focus:text-zinc-200"
                >
                  Explore Dashboard
                </Link>
              </li>
              <li>
                <button
                  onClick={scrollToWorkflow}
                  className="transition hover:text-zinc-200 focus:outline-none focus:text-zinc-200 text-left"
                >
                  Workflow Architecture
                </button>
              </li>
              <li>
                <Link
                  to="/dashboard?demo=true"
                  className="inline-flex items-center gap-1 text-emerald-400 transition hover:text-emerald-300 focus:outline-none focus:text-emerald-300"
                >
                  <span>Interactive Demo Mode</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <button
                  onClick={scrollToTop}
                  className="transition hover:text-zinc-200 focus:outline-none focus:text-zinc-200 text-left"
                >
                  Back to Top
                </button>
              </li>
            </ul>
          </div>

          {/* Regulatory & Specifications */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider text-zinc-200 uppercase">
              Technical Specs
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-zinc-400">
              <li className="font-mono text-[11px]">
                Hashing: SHA-256 Digest
              </li>
              <li className="font-mono text-[11px]">
                Identifier: 12-Digit APAAR
              </li>
              <li className="font-mono text-[11px]">
                Sync Protocol: REST / TLS 1.3
              </li>
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-300 hover:text-zinc-100"
                >
                  <span>Backend OpenAPI Docs</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-[#131a26] pt-6 text-[11px] text-zinc-400 sm:flex-row">
          <p>© 2026 CREDEN. All India Council for Technical Education (AICTE).</p>
          <p className="mt-2 font-mono sm:mt-0 text-zinc-400">
            Interactive Prototype Environment • Node DEL-01
          </p>
        </div>
      </div>
    </footer>
  );
};
