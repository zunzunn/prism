import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  HelpCircle,
  Slash,
  ShieldCheck,
} from 'lucide-react';
import { ObligationStatus } from '@/types';
import { cn } from '@/lib/utils';

export interface ComplianceBadgeProps {
  status: ObligationStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  const normalized = status?.toLowerCase() || '';

  const config: Record<
    string,
    { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
  > = {
    satisfied: {
      label: 'Satisfied',
      icon: CheckCircle2,
      bg: 'bg-success-soft',
      text: 'text-success',
      border: 'border-success/30',
    },
    not_satisfied: {
      label: 'Not Satisfied',
      icon: XCircle,
      bg: 'bg-danger-soft',
      text: 'text-danger',
      border: 'border-danger/30',
    },
    pending_evidence: {
      label: 'Pending Evidence',
      icon: Clock,
      bg: 'bg-warning-soft',
      text: 'text-warning',
      border: 'border-warning/30',
    },
    needs_review: {
      label: 'Needs Officer Review',
      icon: AlertTriangle,
      bg: 'bg-info-soft',
      text: 'text-info',
      border: 'border-info/30',
    },
    unable_to_evaluate: {
      label: 'Unable to Evaluate',
      icon: HelpCircle,
      bg: 'bg-danger-soft/70',
      text: 'text-danger',
      border: 'border-danger/40',
    },
    not_applicable: {
      label: 'Not Applicable',
      icon: Slash,
      bg: 'bg-surface-2',
      text: 'text-text-muted',
      border: 'border-border',
    },
    exception_granted: {
      label: 'Exception Granted',
      icon: ShieldCheck,
      bg: 'bg-accent-soft',
      text: 'text-accent',
      border: 'border-accent/30',
    },
  };

  const current = config[normalized] || {
    label: status.replace(/_/g, ' '),
    icon: HelpCircle,
    bg: 'bg-surface-2',
    text: 'text-text-muted',
    border: 'border-border',
  };

  const Icon = current.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{current.label}</span>
    </span>
  );
};
