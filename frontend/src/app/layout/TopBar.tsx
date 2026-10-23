import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { DemoPill } from '@/components/DemoPill';
import { ThemeMenu } from './ThemeMenu';
import { formatDateTimeIST } from '@/lib/dates';

interface TopBarProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, title = 'Project Foundation' }) => {
  const currentTime = formatDateTimeIST(new Date());

  return (
    <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between gap-4 shrink-0 z-10">
      {/* Left: Sidebar toggle & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors lg:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-text">{title}</span>
        </div>
      </div>

      {/* Middle: Command Palette hint (search trigger) */}
      <div className="hidden md:flex items-center">
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-2 border border-border text-xs text-text-muted hover:text-text transition-colors"
          title="Command palette (Phase 4)"
        >
          <Search className="w-3.5 h-3.5 text-text-muted" />
          <span>Quick search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Demo pill, Clock, Theme menu, Notifications */}
      <div className="flex items-center gap-3">
        {/* Persistent Demo Environment pill */}
        <DemoPill />

        {/* IST Clock */}
        <div className="hidden xl:block text-xs font-mono text-text-muted select-none" title="IST Timezone">
          {currentTime} IST
        </div>

        {/* Theme Selector */}
        <ThemeMenu />

        {/* Notification Bell (Phase 1 placeholder indicator) */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex items-center justify-center w-8 h-8 rounded-md border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
        </button>

        {/* Demo Identity Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-semibold">
            AU
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium text-text">Authorized User</span>
            <span className="text-[10px] text-text-muted uppercase">Officer</span>
          </div>
        </div>
      </div>
    </header>
  );
};
