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
        className="flex items-center gap-2 rounded border border-[#1f2838] bg-[#0c1017] px-2.5 py-1.5 text-xs text-zinc-300 transition hover:border-[#2b374e] hover:bg-[#111722] hover:text-white"
        aria-label="Quick Role Switcher for demonstration"
        title="Demonstration Role Switcher (Simulated Persona)"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/10 text-emerald-400">
          <Shield className="h-3 w-3" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400 font-mono uppercase">
            Role:
          </span>
          <span className="font-semibold text-zinc-200">{currentRole}</span>
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
          <div className="absolute right-0 mt-1.5 z-40 w-72 rounded border border-[#1e2738] bg-[#0c1017] p-2 shadow-2xl backdrop-blur-md">
            <div className="mb-2 border-b border-[#182030] px-2 pb-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
                <span>Simulated Persona Switcher</span>
                <span className="rounded bg-[#161f2e] px-1 py-0.5 text-emerald-400">
                  Demo Only
                </span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
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
                  className={`flex w-full items-start justify-between rounded p-2 text-left transition ${
                    currentRole === item.role
                      ? "bg-[#131b28] text-white border border-emerald-500/30"
                      : "text-zinc-300 hover:bg-[#101520] hover:text-white"
                  }`}
                >
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{item.role}</span>
                      <span className="rounded border border-[#1c2638] bg-[#080b11] px-1 text-[9px] text-zinc-400">
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
