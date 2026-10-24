import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComplianceSummaryRead } from '@/types';
import { formatDateTimeIST } from '@/lib/dates';
import { cn } from '@/lib/utils';


export interface ComplianceSummaryCardsProps {
  summary: ComplianceSummaryRead;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  onReevaluate: () => void;
  isEvaluating?: boolean;
}

export const ComplianceSummaryCards: React.FC<ComplianceSummaryCardsProps> = ({
  summary,
  selectedFilter,
  onSelectFilter,
  onReevaluate,
  isEvaluating = false,
}) => {
  const cards: Array<{
    id: string;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    borderClass: string;
    bgClass: string;
    badgeBg: string;
  }> = [
    {
      id: 'satisfied',
      label: 'Satisfied Requirements',
      count: summary.satisfied_count,
      icon: CheckCircle2,
      colorClass: 'text-success',
      borderClass: 'border-success/30',
      bgClass: 'bg-success-soft/20 hover:bg-success-soft/40',
      badgeBg: 'bg-success-soft text-success',
    },
    {
      id: 'needs_review',
      label: 'Needs Officer Review',
      count: summary.needs_review_count,
      icon: AlertTriangle,
      colorClass: 'text-info',
      borderClass: 'border-info/30',
      bgClass: 'bg-info-soft/20 hover:bg-info-soft/40',
      badgeBg: 'bg-info-soft text-info',
    },
    {
      id: 'pending_evidence',
      label: 'Pending Evidence',
      count: summary.pending_evidence_count,
      icon: Clock,
      colorClass: 'text-warning',
      borderClass: 'border-warning/30',
      bgClass: 'bg-warning-soft/20 hover:bg-warning-soft/40',
      badgeBg: 'bg-warning-soft text-warning',
    },
    {
      id: 'not_satisfied',
      label: 'Not Satisfied / Breached',
      count: summary.not_satisfied_count,
      icon: XCircle,
      colorClass: 'text-danger',
      borderClass: 'border-danger/30',
      bgClass: 'bg-danger-soft/20 hover:bg-danger-soft/40',
      badgeBg: 'bg-danger-soft text-danger',
    },
    {
      id: 'unable_to_evaluate',
      label: 'Unable to Evaluate',
      count: summary.unable_to_evaluate_count,
      icon: HelpCircle,
      colorClass: 'text-danger',
      borderClass: 'border-danger/40',
      bgClass: 'bg-surface-2 hover:bg-surface-3',
      badgeBg: 'bg-danger-soft/50 text-danger',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header bar: Explanatory note & Re-evaluate trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-surface-2 border border-border">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Evidence-Based Compliance Assessment
            </span>
            <span className="text-xs font-mono font-medium text-text bg-surface px-2 py-0.5 rounded border border-border">
              {summary.total_obligations} Total Obligations
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Evaluated against official AICTE Approval Process Handbook (APH 2024–2027) regulatory standards.
            {summary.last_evaluated_at && (
              <span className="ml-1 text-text-muted">
                • Last evaluated: {formatDateTimeIST(summary.last_evaluated_at)}
              </span>
            )}
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onReevaluate}
          disabled={isEvaluating}
          className="shrink-0 flex items-center gap-2 border-border hover:border-accent text-xs"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', isEvaluating && 'animate-spin text-accent')} />
          <span>{isEvaluating ? 'Evaluating Evidence...' : 'Re-evaluate Compliance'}</span>
        </Button>
      </div>

      {/* Distinct Status Metric Cards (Never collapsed into a single percentage) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => {
          const isSelected = selectedFilter === card.id;
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectFilter(isSelected ? 'all' : card.id)}
              className={cn(
                'text-left p-3.5 rounded-lg border transition-all relative overflow-hidden',
                card.bgClass,
                isSelected
                  ? 'border-accent ring-1 ring-accent shadow-sm'
                  : card.borderClass
              )}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[2px] prism-gradient-bg" />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-text-muted">
                  {card.label}
                </span>
                <Icon className={cn('w-4 h-4', card.colorClass)} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-mono tracking-tight text-text">
                  {card.count}
                </span>
                <span className="text-[11px] text-text-muted">
                  / {summary.total_obligations}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
