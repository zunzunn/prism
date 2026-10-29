import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  AlertTriangle,
  RefreshCw,
  Box,
  LogOut,
  Settings,
  BookOpen,
} from "lucide-react";
import { checkBackendHealth, HealthResponse } from "@/services/api";
import { RoleSwitcher } from "./RoleSwitcher";
import { UserRole } from "@/types/governance";
import { useRole } from "@/context/RoleContext";

interface TopBarProps {
  onToggleSidebar: () => void;
  activeRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  activeRole = "AICTE Admin",
  onRoleChange,
}) => {
  let roleContext: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    roleContext = useRole();
  } catch {
    // outside provider fallback
  }

  const effectiveRole = roleContext ? roleContext.currentRole : activeRole;
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    setHasError(false);
    try {
      const data = await checkBackendHealth();
      setHealth(data);
    } catch {
      setHasError(true);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    if (roleContext) {
      roleContext.setRole(role);
    }
    if (onRoleChange) {
      onRoleChange(role);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1a2130] bg-[#07090e]/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Hamburger & Search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="flex h-9 w-9 items-center justify-center rounded border border-[#1f2838] bg-[#0e121a] text-zinc-400 transition hover:bg-[#151c28] hover:text-zinc-200 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="relative hidden w-64 md:block lg:w-72">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search APAAR ID, College, Batch..."
            className="w-full rounded border border-[#1b2333] bg-[#0c1017] py-1.5 pr-3 pl-8.5 font-mono text-xs text-zinc-200 placeholder-zinc-400 transition focus:border-emerald-500/50 focus:bg-[#0e131d] focus:outline-none"
          />
        </div>
      </div>

      {/* Right: Indicators & Quick Role Switcher */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* DEMO ENVIRONMENT indicator */}
        <div className="inline-flex items-center gap-1.5 rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-mono font-semibold text-amber-400 uppercase tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>DEMO ENVIRONMENT</span>
        </div>

        {/* 3D Mode (Optimized) indicator */}
        <div className="hidden items-center gap-1.5 rounded border border-[#1b2333] bg-[#0c1017] px-2.5 py-1 text-[11px] text-zinc-300 md:flex">
          <Box className="h-3 w-3 text-emerald-400" />
          <span className="font-mono text-[10px] text-zinc-300">
            3D Mode (Optimized)
          </span>
        </div>

        {/* Backend API Health Status Indicator */}
        <div className="hidden sm:flex items-center">
          {loadingHealth && !health ? (
            <div className="flex items-center gap-1.5 rounded border border-[#1f2838] bg-[#0d121c] px-2 py-1 text-[10px] text-zinc-400">
              <RefreshCw className="h-2.5 w-2.5 animate-spin text-zinc-400" />
              <span>Checking...</span>
            </div>
          ) : hasError ? (
            <div
              onClick={fetchHealth}
              title="API offline (Click to retry)"
              className="flex cursor-pointer items-center gap-1.5 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[10px] text-rose-400 transition hover:bg-rose-500/20"
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              <span>Offline</span>
            </div>
          ) : (
            <div
              onClick={fetchHealth}
              title={`API ${health?.status || "online"}`}
              className="flex cursor-pointer items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-400 transition hover:bg-emerald-500/20"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-[9px] font-semibold uppercase">
                API ONLINE
              </span>
            </div>
          )}
        </div>

        {/* Quick Role Switcher */}
        <RoleSwitcher
          currentRole={effectiveRole}
          onRoleChange={handleRoleSelect}
        />

        {/* Notifications Icon */}
        <button
          aria-label="System notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded border border-[#1b2333] bg-[#0c1017] text-zinc-400 transition hover:bg-[#121824] hover:text-zinc-200"
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        </button>

        {/* Quick Direct Logout Icon */}
        <button
          onClick={() => {
            if (roleContext?.logout) {
              roleContext.logout();
            } else {
              navigate("/logout");
            }
          }}
          title="Sign Out of CREDEN"
          aria-label="Sign Out"
          className="flex h-8 w-8 items-center justify-center rounded border border-[#1b2333] bg-[#0c1017] text-zinc-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-label="User profile menu"
            className="flex h-8 w-8 items-center justify-center rounded border border-[#232d3f] bg-[#121824] text-xs font-semibold text-zinc-200 transition hover:border-emerald-500/50 hover:text-white cursor-pointer"
          >
            {roleContext?.currentUser?.avatarInitials || "AD"}
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-[#1f293d] bg-[#090d15] p-3 shadow-xl shadow-black/80 z-50">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#182030]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  {roleContext?.currentUser?.avatarInitials || "AD"}
                </div>
                <div className="truncate min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {roleContext?.currentUser?.name || "AICTE Administrator"}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate font-mono">
                    {roleContext?.currentUser?.email || "admin@aicte.gov.in"}
                  </p>
                </div>
              </div>

              <div className="py-2 text-xs space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Role: <span className="text-emerald-400 font-bold">{effectiveRole}</span>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-zinc-300 hover:bg-[#121926] hover:text-white transition"
                >
                  <Settings className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  to="/demo-guide"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded px-2 py-1.5 text-zinc-300 hover:bg-[#121926] hover:text-white transition"
                >
                  <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Demonstration Guide</span>
                </Link>
              </div>

              <div className="pt-2 border-t border-[#182030]">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    if (roleContext?.logout) {
                      roleContext.logout();
                    } else {
                      navigate("/logout");
                    }
                  }}
                  className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
