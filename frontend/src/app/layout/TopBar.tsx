import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, LogOut, RefreshCw } from 'lucide-react';
import { DemoPill } from '@/components/DemoPill';
import { ThemeMenu } from './ThemeMenu';
import { formatDateTimeIST } from '@/lib/dates';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onToggleSidebar: () => void;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, title = 'PRISM Workspace' }) => {
  const currentTime = formatDateTimeIST(new Date());
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeLabel = (role?: string) => {
    switch (role) {
      case 'institution_user':
        return 'Institution User';
      case 'officer':
        return 'Review Officer';
      case 'admin':
        return 'System Admin';
      default:
        return 'Demo User';
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'DU';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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

      {/* Right: Demo pill, Clock, Theme menu, Notifications, User Menu */}
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

        {/* Demo Identity Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              'flex items-center gap-2 pl-2 border-l border-border transition-colors group text-left',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-md'
            )}
          >
            <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-semibold shrink-0">
              {getUserInitials(user?.display_name)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-medium text-text group-hover:text-accent transition-colors truncate max-w-[140px]">
                {user?.display_name || 'Guest User'}
              </span>
              <span className="text-[10px] text-text-muted uppercase">
                {getRoleBadgeLabel(user?.role)}
              </span>
            </div>
          </button>

          {/* User Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg bg-surface border border-border shadow-md z-50 p-2 text-text animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-border mb-1">
                <div className="text-xs font-semibold text-text truncate">
                  {user?.display_name}
                </div>
                <div className="text-[11px] text-text-muted truncate">
                  {user?.email}
                </div>
                {user?.institution_name && (
                  <div className="text-[10px] text-accent font-medium mt-1 truncate">
                    {user.institution_name}
                  </div>
                )}
                <div className="mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-muted">
                    Role: {user?.role}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/signin');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs hover:bg-surface-2 transition-colors text-text"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
                  <span>Switch demo identity</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await logout();
                    navigate('/signin');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs hover:bg-danger-soft text-danger transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
