import React from 'react';
import { AlertCircle, AlertTriangle, CircleDashed, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusConfig, StatusTone } from '@/lib/statusMap';

export interface StatusBadgeProps {
  statusKey: string;
  label?: string;
  tone?: StatusTone;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  statusKey,
  label: customLabel,
  tone: customTone,
  className,
}) => {
  const config = getStatusConfig(statusKey, customLabel);
  const tone = customTone || config.tone;
  const label = customLabel || config.label;

  const toneClasses = {
    danger: 'bg-danger-soft text-danger border-danger/20',
    warning: 'bg-warning-soft text-warning border-warning/20',
    info: 'bg-info-soft text-info border-info/20',
    success: 'bg-success-soft text-success border-success/20',
    neutral: 'bg-surface-2 text-text-muted border-border',
  };

  const IconComponent = () => {
    switch (config.iconName) {
      case 'alert-circle':
        return <AlertCircle className="w-3 h-3 stroke-[2]" />;
      case 'alert-triangle':
        return <AlertTriangle className="w-3 h-3 stroke-[2]" />;
      case 'circle-dashed':
        return <CircleDashed className="w-3 h-3 stroke-[2] animate-spin-slow" />;
      case 'circle-check':
        return <CheckCircle2 className="w-3 h-3 stroke-[2]" />;
      case 'circle':
      default:
        return <Circle className="w-2.5 h-2.5 fill-current opacity-60" />;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        toneClasses[tone],
        className
      )}
    >
      <IconComponent />
      <span>{label}</span>
    </span>
  );
};
