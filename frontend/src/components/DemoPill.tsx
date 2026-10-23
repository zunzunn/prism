import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DemoPillProps {
  className?: string;
}

export const DemoPill: React.FC<DemoPillProps> = ({ className }) => {
  return (
    <div
      title="All data is fictional sample data"
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        'bg-surface-2 text-text-muted border border-border select-none cursor-help',
        className
      )}
    >
      <Info className="w-3 h-3 text-text-muted shrink-0" />
      <span>Demo environment · Sample data</span>
    </div>
  );
};
