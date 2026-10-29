import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileCheck2,
  ShieldAlert,
  SearchCheck,
  Settings,
  Database,
  ExternalLink,
  Fingerprint,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    name: "Student Registry",
    path: "/students",
    icon: Users,
    badge: "142k",
  },
  {
    name: "Institutions",
    path: "/institutions",
    icon: Building2,
    badge: "3.8k",
  },
  {
    name: "Academic Verification",
    path: "/verification",
    icon: SearchCheck,
    badge: "Live",
  },
  {
    name: "Batch Validation",
    path: "/validation",
    icon: FileCheck2,
    badge: undefined,
  },
  {
    name: "Compliance & Audits",
    path: "/compliance",
    icon: ShieldAlert,
    badge: "AICTE",
  },
];

const secondaryNav = [
  {
    name: "Data Pipelines",
    path: "/pipelines",
    icon: Database,
  },
  {
    name: "System Settings",
    path: "/settings",
    icon: Settings,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-[#1a2130] bg-[#07090e] transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo Area */}
        <div className="flex h-16 items-center justify-between border-b border-[#1a2130] px-5">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wider text-zinc-100 uppercase">
                CREDEN
              </span>
              <span className="text-[10px] font-medium tracking-tight text-zinc-400">
                AICTE VERIFICATION ENGINE
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-zinc-300 uppercase">
            Platform Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "border border-emerald-500/30 bg-[#121926] text-emerald-400"
                        : "text-zinc-400 hover:border hover:border-[#20293a] hover:bg-[#0d121c] hover:text-zinc-200"
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="h-4 w-4 shrink-0 transition-colors group-hover:text-zinc-200" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                        item.badge === "Live"
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border border-[#20293a] bg-[#101520] text-zinc-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-8 mb-2 px-3 text-[10px] font-semibold tracking-wider text-zinc-300 uppercase">
            Administration
          </div>
          <nav className="space-y-1">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center space-x-2.5 rounded px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "border border-emerald-500/30 bg-[#121926] text-emerald-400"
                        : "text-zinc-400 hover:border hover:border-[#20293a] hover:bg-[#0d121c] hover:text-zinc-200"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Regulatory & Institutional Node Badge */}
        <div className="border-t border-[#1a2130] p-3">
          <div className="rounded border border-[#1b2333] bg-[#0c1017] p-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-zinc-300">Regulatory Node</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                SYNCED
              </span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-zinc-400">
              AICTE-CENTRAL-DELHI-01
            </p>
            <div className="mt-2 flex items-center justify-between border-t border-[#161d2a] pt-2 text-[10px] text-zinc-400">
              <span>Protocol v2.4</span>
              <a
                href="https://aicte-india.org"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-zinc-200"
              >
                AICTE Portal <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
