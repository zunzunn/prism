import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Server, Layers, Sliders, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { apiClient } from '@/lib/api';
import { THEMES, Theme, applyTheme, getInitialTheme } from '@/lib/theme';
import { applyReduceMotion, getInitialReduceMotion } from '@/lib/motion';

interface HealthResponse {
  status: string;
  app: string;
  version: string;
}

export const FoundationReadinessPage: React.FC = () => {
  const [activeTheme, setActiveTheme] = React.useState<Theme>(getInitialTheme);
  const [reduceMotion, setReduceMotion] = React.useState<boolean>(getInitialReduceMotion);

  // Live backend health query
  const { data: health, isLoading: isHealthLoading, isError: isHealthError } = useQuery<HealthResponse>({
    queryKey: ['backend-health'],
    queryFn: () => apiClient<HealthResponse>('/api/health'),
    retry: 1,
  });

  const handleThemeChange = (newTheme: Theme) => {
    setActiveTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleToggleMotion = () => {
    const next = !reduceMotion;
    setReduceMotion(next);
    applyReduceMotion(next);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-text tracking-tight">Phase 1: Project Foundation</h1>
            <StatusBadge statusKey="on_track" label="Foundation Ready" />
          </div>
          <p className="text-sm text-text-muted mt-1">
            Verification harness for design tokens, theme system, application shell, and backend service connectivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleMotion}
          >
            <Sliders className="w-3.5 h-3.5 mr-1.5" />
            Motion: {reduceMotion ? 'Reduced' : 'Normal'}
          </Button>
        </div>
      </div>

      {/* Grid of validation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Backend Connection Status */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-text">Backend Service Status</h2>
            </div>
            {isHealthLoading ? (
              <StatusBadge statusKey="in_progress" label="Checking..." />
            ) : isHealthError ? (
              <StatusBadge statusKey="needs_attention" label="Offline / Standalone" />
            ) : (
              <StatusBadge statusKey="on_track" label="Connected" />
            )}
          </div>
          <p className="text-xs text-text-muted mb-4">
            Live health verification against the FastAPI service endpoint (<code className="font-mono text-text">/api/health</code>).
          </p>
          <div className="bg-surface-2 rounded-md p-3 text-xs font-mono space-y-1 border border-border">
            <div>status: <span className="text-accent">{health?.status || (isHealthLoading ? 'checking...' : 'disconnected')}</span></div>
            <div>app: <span className="text-text">{health?.app || 'PRISM API'}</span></div>
            <div>version: <span className="text-text">{health?.version || '0.1.0'}</span></div>
          </div>
        </Card>

        {/* Card 2: Status System Tokens */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h2 className="text-sm font-semibold text-text">Status System & Badges</h2>
          </div>
          <p className="text-xs text-text-muted mb-4">
            Standard status badges mapped via semantic statusMap tokens (never raw hex values).
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge statusKey="needs_attention" label="Needs attention" />
            <StatusBadge statusKey="warning" label="Warning / Due soon" />
            <StatusBadge statusKey="in_progress" label="In progress" />
            <StatusBadge statusKey="on_track" label="On track" />
            <StatusBadge statusKey="draft" label="Neutral / Draft" />
          </div>
        </Card>

        {/* Card 3: Tabular Numerals & Monospace */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-info" />
            <h2 className="text-sm font-semibold text-text">Typography & Numerals</h2>
          </div>
          <p className="text-xs text-text-muted mb-4">
            JetBrains Mono and Inter with <code className="font-mono text-text">tabular-nums</code> for consistent alignment.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-text-muted">Application Ref Format</span>
              <span className="font-mono text-accent">DEMO-APP-0001</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-text-muted">Metric Tabular Digits</span>
              <span className="font-mono tabular-nums text-text font-semibold">1,024,850.00</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-text-muted">Audit Hash Stamp</span>
              <span className="font-mono text-text-muted">#8f3a9d1</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Theme Matrix Section */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-text">Six Calm Ledger Semantic Themes</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Click any theme below to preview instant crossfade token switching and persistence.
            </p>
          </div>
          <div className="text-xs font-mono text-text-muted">
            Active: <span className="text-accent font-semibold">{activeTheme}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {THEMES.map((theme) => {
            const isSelected = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeChange(theme.id)}
                className={`p-3 rounded-md border text-left transition-all relative ${
                  isSelected
                    ? 'border-accent ring-1 ring-accent bg-surface-2'
                    : 'border-border bg-surface hover:bg-surface-2'
                }`}
              >
                <div
                  className="w-full h-8 rounded mb-2 border border-border flex items-center justify-end px-2"
                  style={{ backgroundColor: theme.previewBg }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: theme.previewAccent }}
                  />
                </div>
                <div className="font-medium text-xs text-text truncate">{theme.label}</div>
                <div className="text-[10px] text-text-muted truncate">{theme.category}</div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent text-accent-fg flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
