import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { THEMES, Theme, applyTheme, getInitialTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export const ThemeMenu: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(getInitialTheme);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (themeId: Theme) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        aria-expanded={isOpen}
        className={cn(
          'inline-flex items-center justify-center w-8 h-8 rounded-md',
          'bg-surface border border-border text-text hover:bg-surface-2 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring'
        )}
      >
        <Palette className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg bg-surface border border-border shadow-md z-50 p-2 text-text animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 text-xs font-semibold text-text-muted border-b border-border mb-1">
            Theme Selection (6 Themes)
          </div>
          <div className="space-y-1">
            {THEMES.map((theme) => {
              const isActive = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors',
                    isActive ? 'bg-accent-soft text-accent font-medium' : 'hover:bg-surface-2 text-text'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full border border-border shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: theme.previewBg }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.previewAccent }}
                      />
                    </div>
                    <div className="text-left">
                      <div>{theme.label}</div>
                      <div className="text-[10px] text-text-muted">{theme.category}</div>
                    </div>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
