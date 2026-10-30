import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { ArrowRight, Building, UserCheck, ShieldCheck } from "lucide-react";

const AppShellInner: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentRole, resetToAicteAdmin, scopedInstitution } = useRole();

  return (
    <div className="relative min-h-screen bg-[#060709] text-zinc-100 flex overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Subtle ambient light mesh for glassmorphism refraction */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[160px]" />
        <div className="absolute top-1/3 -right-32 h-[550px] w-[550px] rounded-full bg-sky-500/5 blur-[180px]" />
        <div className="absolute -bottom-32 left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[160px]" />
      </div>

      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main layout container with left offset for desktop sidebar */}
      <div className="relative z-10 flex flex-1 flex-col lg:pl-64 min-w-0">
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Persona Scope Notification Banners with Glassmorphism */}
        {currentRole === "Institution Admin" && (
          <div className="border-b border-sky-400/20 bg-[#0c1626]/70 px-4 py-2 text-xs sm:px-8 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
                  <Building className="h-3 w-3" />
                </div>
                <span className="rounded border border-sky-400/40 bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-sky-300">
                  Institution Node
                </span>
                <span className="font-semibold text-zinc-100">
                  {scopedInstitution.name}
                </span>
                <span className="font-mono text-[11px] text-zinc-300">
                  [{scopedInstitution.code}]
                </span>
                <span className="hidden text-zinc-500 md:inline">•</span>
                <span className="hidden text-zinc-300 md:inline">
                  Registry & batch submissions scoped to this campus.
                </span>
              </div>
              <button
                onClick={resetToAicteAdmin}
                className="flex items-center gap-1 font-mono text-[11px] text-sky-300 underline underline-offset-2 hover:text-white shrink-0 cursor-pointer"
              >
                <span>Return to AICTE Admin</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {currentRole === "Student" && (
          <div className="border-b border-emerald-400/20 bg-[#0c1a14]/70 px-4 py-2 text-xs sm:px-8 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  <UserCheck className="h-3 w-3" />
                </div>
                <span className="rounded border border-emerald-400/40 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-emerald-300">
                  Student Persona
                </span>
                <span className="font-semibold text-zinc-100">
                  Aarav Sharma [STU-001]
                </span>
                <span className="font-mono text-[11px] text-zinc-300">
                  APAAR: 98••-••••-9011
                </span>
                <span className="hidden text-zinc-500 md:inline">•</span>
                <span className="hidden text-zinc-300 md:inline">
                  Personal credentials, QR pass & transparency ledger.
                </span>
              </div>
              <button
                onClick={resetToAicteAdmin}
                className="flex items-center gap-1 font-mono text-[11px] text-emerald-300 underline underline-offset-2 hover:text-white shrink-0 cursor-pointer"
              >
                <span>Return to AICTE Admin</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {currentRole === "Authorized Verifier" && (
          <div className="border-b border-purple-400/20 bg-[#160f24]/70 px-4 py-2 text-xs sm:px-8 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-400/30">
                  <ShieldCheck className="h-3 w-3" />
                </div>
                <span className="rounded border border-purple-400/40 bg-purple-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-purple-300">
                  Verifier Persona
                </span>
                <span className="font-semibold text-zinc-100">
                  Authorized Employer / Screening Agency
                </span>
                <span className="hidden text-zinc-500 md:inline">•</span>
                <span className="hidden text-zinc-300 md:inline">
                  Restricted attribute disclosure via opaque verification reference.
                </span>
              </div>
              <button
                onClick={resetToAicteAdmin}
                className="flex items-center gap-1 font-mono text-[11px] text-purple-300 underline underline-offset-2 hover:text-white shrink-0 cursor-pointer"
              >
                <span>Return to AICTE Admin</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#161c28] bg-[#07090e] px-4 py-3 text-xs text-zinc-400 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-400">CREDEN</span>
              <span>•</span>
              <span>All India Council for Technical Education (AICTE)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
              <span>Security Level: High (AES-256 / SHA-256)</span>
              <span>APAAR Sync: Active</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const AppShell: React.FC = () => {
  return (
    <RoleProvider>
      <AppShellInner />
    </RoleProvider>
  );
};
