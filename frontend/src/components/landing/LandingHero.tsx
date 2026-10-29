import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  PlayCircle,
  FileCheck2,
  ShieldAlert,
  Scale,
  Compass,
} from "lucide-react";

export const LandingHero: React.FC = () => {
  const scrollToWorkflow = () => {
    const el = document.getElementById("workflow");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* 1. Small demonstration pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Interactive Demonstration Environment</span>
        </div>

        {/* 2. Large headline */}
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          <span className="block text-zinc-100">Every Student.</span>
          <span className="block bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            One Trusted Academic Identity.
          </span>
        </h1>

        {/* 3. Supporting copy */}
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Connecting institutions, validating academic identities, detecting enrolment
          inconsistencies, and enabling secure verification through an intelligent
          student data ecosystem.
        </p>

        {/* 4. Three buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          {/* Button 1: Explore Dashboard */}
          <Link
            to="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/15 px-6 py-3 text-xs font-semibold text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-200 hover:border-emerald-500/60 hover:bg-emerald-500/25 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 sm:w-auto"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Button 2: Discover How It Works */}
          <button
            onClick={scrollToWorkflow}
            className="flex w-full items-center justify-center gap-2 rounded border border-[#222c3f] bg-[#0c1017] px-5 py-3 text-xs font-semibold text-zinc-300 transition-all duration-200 hover:border-[#32405a] hover:bg-[#121824] hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600 sm:w-auto"
          >
            <Compass className="h-4 w-4 text-zinc-400" />
            <span>Discover How It Works</span>
          </button>

          {/* Button 3: Launch Interactive Demo */}
          <Link
            to="/dashboard?demo=true"
            className="flex w-full items-center justify-center gap-2 rounded border border-[#1f2838] bg-[#0a0d14] px-5 py-3 text-xs font-semibold text-zinc-400 transition-all duration-200 hover:border-[#2a364d] hover:bg-[#0f141f] hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-600 sm:w-auto"
          >
            <PlayCircle className="h-4 w-4 text-emerald-400" />
            <span>Launch Interactive Demo</span>
          </Link>
        </div>

        {/* 5. Thin horizontal divider */}
        <div className="mx-auto mt-12 max-w-2xl border-t border-[#182132]" />

        {/* 6. Three compact feature indicators */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="flex items-center justify-center gap-2.5 rounded border border-[#182132] bg-[#090c12]/80 px-3.5 py-2.5 text-xs text-zinc-300 backdrop-blur-sm">
            <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="font-medium tracking-tight">APAAR Format Validation</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 rounded border border-[#182132] bg-[#090c12]/80 px-3.5 py-2.5 text-xs text-zinc-300 backdrop-blur-sm">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="font-medium tracking-tight">Explainable Duplicate Detection</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 rounded border border-[#182132] bg-[#090c12]/80 px-3.5 py-2.5 text-xs text-zinc-300 backdrop-blur-sm">
            <Scale className="h-4 w-4 shrink-0 text-sky-400" />
            <span className="font-medium tracking-tight">Approved Intake Monitoring</span>
          </div>
        </div>
      </div>
    </section>
  );
};
