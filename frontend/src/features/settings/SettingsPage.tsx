import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Palette,
  Check,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { THEMES, Theme, applyTheme, getInitialTheme } from '@/lib/theme';
import { applyReduceMotion, getInitialReduceMotion } from '@/lib/motion';
import { apiClient } from '@/lib/api';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTheme, setActiveTheme] = useState<Theme>(getInitialTheme);
  const [reduceMotion, setReduceMotion] = useState<boolean>(getInitialReduceMotion);
  const [dueSoonWindow, setDueSoonWindow] = useState<string>('7');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleThemeChange = (newTheme: Theme) => {
    setActiveTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleToggleMotion = () => {
    const next = !reduceMotion;
    setReduceMotion(next);
    applyReduceMotion(next);
  };

  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiClient<{ message: string }>('/api/demo/reset', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      setResetSuccess(data.message || 'Demo database reset successfully.');
      setResetError(null);
      setResetConfirmOpen(false);
      queryClient.invalidateQueries();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      setResetError(msg);
      setResetSuccess(null);
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-semibold text-text tracking-tight">Settings & Preferences</h1>
        </div>
        <p className="text-xs text-text-muted mt-1">
          Customize visual themes, motion behavior, regulatory operational thresholds, and demo environment data.
        </p>
      </div>

      {/* Six Calm Ledger Semantic Themes Section */}
      <Card className="border border-border space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-text">Six Calm Ledger Semantic Themes</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                WCAG 2.2 AA / AAA
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Calm, editorial, ledger-like aesthetic designed for regulatory scrutiny. Select a theme below to activate instantaneous crossfade switching with persistent local storage.
            </p>
          </div>
          <div className="text-xs font-mono text-text-muted shrink-0">
            Active: <span className="text-accent font-semibold">{activeTheme}</span>
          </div>
        </div>

        {/* 6 Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {THEMES.map((theme) => {
            const isSelected = activeTheme === theme.id;
            const isHighContrast = theme.category === 'High Contrast';

            return (
              <div
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-accent ring-2 ring-accent/30 bg-accent-soft/10 shadow-sm'
                    : 'border-border bg-surface hover:bg-surface-2 hover:border-border-strong'
                }`}
              >
                <div>
                  {/* Theme Color Palette Preview Bar */}
                  <div
                    className="w-full h-12 rounded-lg mb-3 border border-border flex items-center justify-between px-3 shadow-2xs"
                    style={{ backgroundColor: theme.previewBg }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: theme.previewAccent }}
                      />
                      <span
                        className="text-[11px] font-mono font-medium"
                        style={{
                          color:
                            theme.id === 'dusk' || theme.id === 'void' || theme.id === 'contrast-dark'
                              ? '#E2E8F0'
                              : '#1E293B',
                        }}
                      >
                        Aa
                      </span>
                    </div>

                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: theme.previewAccent }}
                    >
                      {theme.previewAccent}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-xs text-text">{theme.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isHighContrast
                          ? 'bg-accent/10 text-accent font-bold border border-accent/20'
                          : 'bg-surface-2 text-text-muted border border-border'
                      }`}
                    >
                      {theme.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed">
                    {theme.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-[10px]">
                  <span className="text-text-muted font-mono">
                    {isHighContrast ? 'Contrast: AAA (≥7:1)' : 'Contrast: AA (≥4.5:1)'}
                  </span>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-accent font-semibold">
                      <Check className="w-3 h-3" />
                      Active Theme
                    </span>
                  ) : (
                    <span className="text-text-muted hover:text-text">Click to Apply</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Accessibility & Motion Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border border-border p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text">Display & Motion Accessibility</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            PRISM employs quiet micro-interactions (150ms–250ms) conforming to Calm Ledger guidelines. You can enable reduced motion to disable non-essential animations.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            <div>
              <span className="text-xs font-medium text-text block">Motion Mode</span>
              <span className="text-[11px] text-text-muted">
                {reduceMotion ? 'Reduced animations active' : 'Standard quiet transitions'}
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleMotion}
              className="text-xs h-8 gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{reduceMotion ? 'Enable Full Motion' : 'Reduce Motion'}</span>
            </Button>
          </div>
        </Card>

        {/* Operational Deadlines Warning Threshold */}
        <Card className="border border-border p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text">Regulatory Deadline Warning Window</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Configure the advance notification horizon for approaching procedural deadlines across all active dossiers.
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            <div>
              <span className="text-xs font-medium text-text block">Due-Soon Threshold</span>
              <span className="text-[11px] text-text-muted">
                Flag applications with deadlines within {dueSoonWindow} calendar days
              </span>
            </div>

            <select
              value={dueSoonWindow}
              onChange={(e) => setDueSoonWindow(e.target.value)}
              className="h-8 px-2.5 rounded-md bg-surface-2 border border-border text-xs text-text focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="3">3 Days</option>
              <option value="7">7 Days (Default)</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Demo Environment Management & Data Reset */}
      <Card className="border border-border p-5 space-y-3 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold text-text">Demo Environment & Data Management</h3>
          </div>
          <StatusBadge statusKey="draft" label="Local SQLite Engine" />
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          Restore the local SQLite database to its clean, deterministic seed state. Re-populates 12 diverse sample applications across 8 regulatory approval stages with relative deadlines, documents, compliance rules, and clarification threads.
        </p>

        {resetSuccess && (
          <div className="p-3 rounded-lg bg-success-soft/20 border border-success/30 text-success text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{resetSuccess}</span>
          </div>
        )}

        {resetError && (
          <div className="p-3 rounded-lg bg-danger-soft/20 border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{resetError}</span>
          </div>
        )}

        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-text block">Seed State Reset</span>
            <span className="text-[11px] text-text-muted">
              Calls <code className="font-mono text-accent">POST /api/demo/reset</code>
            </span>
          </div>

          {!resetConfirmOpen ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setResetConfirmOpen(true)}
              className="text-xs h-8 text-warning hover:bg-warning-soft hover:text-warning"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Demo Data
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResetConfirmOpen(false)}
                className="text-xs h-8 text-text-muted"
                disabled={resetMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
                className="text-xs h-8"
              >
                {resetMutation.isPending ? 'Resetting...' : 'Confirm Reset'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Governance & About Card */}
      <Card className="border border-border p-5 space-y-2 bg-surface-2/30">
        <div className="flex items-center gap-2 text-xs font-semibold text-text">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>PRISM Regulatory Governance & System Integrity</span>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          PRISM (Proactive Regulatory Intelligence & Status Monitoring) is an institutional regulatory intelligence platform. All compliance evaluations, document extractions, and verification checks are deterministic evidence assessments governed by official AICTE Approval Process Handbook (APH 2024–2027) standards. Automated processes flag possible issues for human scrutiny and never make legally binding autonomous decisions.
        </p>
        <div className="pt-1 flex flex-wrap gap-4 text-[11px] font-mono text-text-muted">
          <span>Version: 0.1.0</span>
          <span>•</span>
          <span>Timezone: IST (UTC+05:30)</span>
          <span>•</span>
          <span>Storage: Local Sanitized Binary Storage</span>
        </div>
      </Card>
    </div>
  );
};
