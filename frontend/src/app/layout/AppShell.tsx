import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PageTransition } from './PageTransition';
import { AlertTriangle } from 'lucide-react';

const SIDEBAR_STORAGE_KEY = 'prism.sidebar';

export const AppShell: React.FC = () => {
  const location = useLocation();

  // Initialize sidebar collapse: auto-collapse below 1440px, or restore saved preference
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    return window.innerWidth < 1440;
  });

  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1280;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1280);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  // Determine current page title from path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Foundation Readiness';
      case '/overview':
        return 'Overview';
      case '/applications':
        return 'Applications';
      case '/requirements':
        return 'Compliance Requirements';
      case '/deadlines-alerts':
        return 'Deadlines & Alerts';
      case '/analytics':
        return 'Analytics';
      case '/activity-history':
        return 'Activity History';
      case '/settings':
        return 'Settings';
      default:
        if (location.pathname.startsWith('/applications/')) {
          return 'Application Dossier';
        }
        return 'PRISM Workspace';
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      {/* Sidebar navigation */}
      <Sidebar
        collapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        {/* Viewport Warning Banner (<1280px) */}
        {isMobileViewport && (
          <div className="bg-warning-soft text-warning border-b border-warning/20 px-4 py-2 text-xs flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>PRISM is designed for desktop screens (1280 px or wider). Some layout elements may scroll horizontally.</span>
            </div>
          </div>
        )}

        {/* TopBar */}
        <TopBar
          title={getPageTitle()}
          onToggleSidebar={handleToggleCollapse}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none" tabIndex={-1}>
          <div className="max-w-content mx-auto w-full">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};
