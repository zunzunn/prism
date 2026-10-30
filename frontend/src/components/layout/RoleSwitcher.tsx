import React, { useState } from "react";
import { UserRole } from "@/types/governance";
import { ChevronDown, Check, Shield } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ROLES: { role: UserRole; desc: string; badge: string }[] = [
  {
    role: "AICTE Admin",
    desc: "National governance, state audits & policy enforcement",
    badge: "Full Access",
  },
  {
    role: "Institution Admin",
    desc: "Nodal officer batch submissions & intake management",
    badge: "College Node",
  },
  {
    role: "Student",
    desc: "Personal APAAR identity, credits ledger & credentials",
    badge: "Identity Portal",
  },
  {
    role: "Authorized Verifier",
    desc: "Third-party employer & academic credential validation",
    badge: "Verifier Portal",
  },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white backdrop-blur-md shadow-sm"
        aria-label="Quick Role Switcher for demonstration"
        title="Demonstration Role Switcher (Simulated Persona)"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
          <Shield className="h-3 w-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400 font-mono uppercase">
            Role:
          </span>
          <span className="font-semibold text-white">{currentRole}</span>
        </div>
        <ChevronDown
          className={`h-3 w-3 text-zinc-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-40 w-72 rounded-2xl border border-white/15 bg-[#0a0e1a]/95 p-2.5 shadow-2xl backdrop-blur-2xl">
            <div className="mb-2 border-b border-white/10 px-2 pb-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
                <span className="text-emerald-400 font-bold">Simulated Persona Switcher</span>
                <span className="rounded border border-emerald-400/40 bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                  Demo Only
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-300">
                Preview how the governance platform adapts per stakeholder persona.
              </p>
            </div>

            <div className="space-y-1">
              {ROLES.map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    onRoleChange(item.role);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start justify-between rounded-xl p-2.5 text-left transition ${
                    currentRole === item.role
                      ? "bg-emerald-500/15 text-white border border-emerald-400/40 shadow-sm"
                      : "text-zinc-300 hover:bg-white/[0.06] hover:text-white border border-transparent hover:border-white/10"
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">{item.role}</span>
                      <span className={`rounded border px-1 text-[9px] font-mono uppercase font-bold ${
                        currentRole === item.role
                          ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-white/[0.05] text-zinc-400"
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-zinc-400">
                      {item.desc}
                    </p>
                  </div>
                  {currentRole === item.role && (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
