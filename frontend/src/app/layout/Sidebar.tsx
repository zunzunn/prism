import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  BellRing,
  BarChart3,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'WORKSPACE',
    items: [
      { label: 'Overview', path: '/', icon: LayoutDashboard },
      { label: 'Applications', path: '/applications', icon: FolderKanban },
    ],
  },
  {
    groupName: 'COMPLIANCE',
    items: [
      { label: 'Requirements', path: '/requirements', icon: FileCheck2 },
      { label: 'Deadlines & alerts', path: '/deadlines-alerts', icon: BellRing },
    ],
  },
  {
    groupName: 'INSIGHTS',
    items: [
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    ],
  },
  {
    groupName: 'ADMINISTRATION',
    items: [
      { label: 'Activity history', path: '/activity-history', icon: History },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r border-border bg-surface select-none transition-all duration-base shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center h-14 px-4 border-b border-border gap-3">
        {/* Prism Delta Logo Mark */}
        <div
          className="relative flex items-center justify-center w-8 h-8 rounded-md bg-surface-2 border border-border shrink-0 overflow-hidden"
          title="PRISM: Proactive Regulatory Intelligence & Status Monitoring"
        >
          {/* 2px Prism Gradient Top/Left Edge Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] prism-gradient-bg" />
          <span className="text-base font-bold text-accent">Δ</span>
        </div>

        {!collapsed && (
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="font-semibold text-sm tracking-tight text-text truncate">
              PRISM
            </span>
            <span className="text-[10px] text-text-muted truncate">
              Regulatory intelligence
            </span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.groupName} className="space-y-1">
            {!collapsed && (
              <div className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
                {group.groupName}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent-soft text-accent'
                        : 'text-text-muted hover:text-text hover:bg-surface-2',
                      collapsed && 'justify-center px-0'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-accent" />
                      )}
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-fg font-mono">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="p-2 border-t border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 text-xs text-text-muted truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">Phase 1 Foundation</span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'inline-flex items-center justify-center w-8 h-8 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors',
            collapsed && 'w-full'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
