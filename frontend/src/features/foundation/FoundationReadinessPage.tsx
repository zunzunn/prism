import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Server, Layers, Sliders, Palette } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { apiClient } from '@/lib/api';
import { applyReduceMotion, getInitialReduceMotion } from '@/lib/motion';

interface HealthResponse {
  status: string;
  app: string;
  version: string;
}

export const FoundationReadinessPage: React.FC = () => {
  const navigate = useNavigate();
  const [reduceMotion, setReduceMotion] = React.useState<boolean>(getInitialReduceMotion);

  // Live backend health query
  const { data: health, isLoading: isHealthLoading, isError: isHealthError } = useQuery<HealthResponse>({
    queryKey: ['backend-health'],
    queryFn: () => apiClient<HealthResponse>('/api/health'),
    retry: 1,
  });

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
            variant="primary"
            size="sm"
            onClick={() => navigate('/applications')}
          >
            Go to Applications
          </Button>
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

      {/* Six Calm Ledger Semantic Themes Section (Configured in Settings) */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-text">Six Calm Ledger Semantic Themes</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                WCAG 2.2 AA / AAA
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1 max-w-2xl">
              The 6 Calm Ledger semantic themes (Daylight, Dusk, Void, Paper, Contrast Light, and Contrast Dark), motion toggles, and display accessibility controls are now centralized in Settings.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/settings')}
            className="shrink-0 text-xs gap-1.5"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Manage Themes in Settings</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
