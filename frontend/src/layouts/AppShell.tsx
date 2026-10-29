import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060709] text-zinc-100 flex">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main layout container with left offset for desktop sidebar */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

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
