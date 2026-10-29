import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Fingerprint, ArrowRight, Menu, X, LogIn } from "lucide-react";

export const LandingNav: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-[#182030]/80 bg-[#060709]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="group flex items-center space-x-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-colors group-hover:border-emerald-500/50">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold tracking-wider text-zinc-100 uppercase">
              CREDEN
            </span>
            <span className="text-[9px] font-semibold tracking-tight text-zinc-400 uppercase">
              AICTE Platform
            </span>
          </div>
        </Link>

        {/* Center: Environment Indicator & Section Anchors */}
        <div className="hidden items-center space-x-6 md:flex">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            <span>DEMONSTRATION ENVIRONMENT</span>
          </div>

          <nav className="flex items-center space-x-5 text-xs font-medium text-zinc-400">
            <button
              onClick={() => scrollToSection("workflow")}
              className="transition-colors hover:text-zinc-100 focus:outline-none focus:text-zinc-100"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="transition-colors hover:text-zinc-100 focus:outline-none focus:text-zinc-100"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("security")}
              className="transition-colors hover:text-zinc-100 focus:outline-none focus:text-zinc-100"
            >
              Security
            </button>
          </nav>
        </div>

        {/* Right CTA */}
        <div className="hidden items-center space-x-3 sm:flex">
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded border border-[#222d3d] bg-[#0d121c] px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-[#2f3e55] hover:bg-[#141b27] hover:text-white"
          >
            <LogIn className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sign In</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 transition-all hover:border-emerald-500/60 hover:bg-emerald-500/20 hover:text-emerald-200"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded border border-[#1d273a] bg-[#0c1017] text-zinc-400 transition hover:text-zinc-100"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#182030] bg-[#07090e] px-4 py-4 sm:hidden">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>DEMONSTRATION ENVIRONMENT</span>
          </div>
          <div className="flex flex-col space-y-3 text-xs text-zinc-300">
            <button
              onClick={() => scrollToSection("workflow")}
              className="text-left py-1 text-zinc-300 hover:text-emerald-400"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-left py-1 text-zinc-300 hover:text-emerald-400"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("security")}
              className="text-left py-1 text-zinc-300 hover:text-emerald-400"
            >
              Security
            </button>
            <div className="mt-2 flex flex-col gap-2">
              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 rounded border border-[#222d3d] bg-[#0d121c] py-2 text-xs font-semibold text-zinc-200"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-300"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
