import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileCheck2,
  Scale,
  SearchCheck,
  BarChart2,
  FileText,
  ShieldAlert,
  Settings,
  BookOpen,
  Fingerprint,
  ExternalLink,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const mainNavItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    name: "Institutions",
    path: "/institutions",
    icon: Building2,
    badge: "3.8k",
  },
  {
    name: "Student Records",
    path: "/students",
    icon: Users,
    badge: "1.4M",
  },
  {
    name: "Validation Center",
    path: "/validation",
    icon: FileCheck2,
    badge: undefined,
  },
  {
    name: "Intake Monitoring",
    path: "/intake",
    icon: Scale,
    badge: "AICTE",
  },
  {
    name: "Academic Verification",
    path: "/verification",
    icon: SearchCheck,
    badge: "Live",
  },
  {
    name: "Analytics & Forecast",
    path: "/analytics",
    icon: BarChart2,
    badge: undefined,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: FileText,
    badge: undefined,
  },
  {
    name: "Audit Logs",
    path: "/compliance",
    icon: ShieldAlert,
    badge: undefined,
  },
];

const secondaryNavItems = [
  {
    name: "Student Portal",
    path: "/student",
    icon: Fingerprint,
    badge: "QR Pass",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    name: "Demo Guide",
    path: "/demo-guide",
    icon: BookOpen,
  },
  {
    name: "Sign Out",
    path: "/logout",
    icon: LogOut,
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#070a10]/85 backdrop-blur-2xl transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo Area */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5 bg-white/[0.02]">
          <NavLink
            to="/"
            className="flex items-center space-x-3 transition hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-950/40">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
                CREDEN
              </span>
              <span className="text-[9px] font-semibold tracking-tight text-emerald-400/90 uppercase font-mono">
                AICTE Governance
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            National Modules
          </div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_2px_10px_rgba(16,185,129,0.15)] font-semibold"
                        : "text-zinc-300 border border-transparent hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="h-4 w-4 shrink-0 transition-colors group-hover:text-emerald-400" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider font-mono ${
                        item.badge === "Live"
                          ? "border border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                          : item.badge === "AICTE"
                          ? "border border-sky-400/40 bg-sky-500/20 text-sky-300"
                          : "border border-white/10 bg-white/[0.06] text-zinc-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 mb-2 px-3 text-[10px] font-mono font-semibold tracking-wider text-zinc-400 uppercase">
            Operations & Support
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] font-semibold"
                        : "text-zinc-300 border border-transparent hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0 transition-colors group-hover:text-emerald-400" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Regulatory & Institutional Node Badge */}
        <div className="border-t border-white/10 p-3 bg-white/[0.01]">
          <div className="rounded-xl border border-white/10 bg-[#0d1424]/80 p-3 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-zinc-200">Regulatory Node</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-zinc-300">
              AICTE-CENTRAL-DELHI-01
            </p>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-zinc-400">
              <span>Protocol v2.4</span>
              <a
                href="https://aicte-india.org"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-emerald-300 transition-colors"
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
