import React from 'react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Calendar } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  phaseScheduled: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  phaseScheduled,
  description,
}) => {
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-text tracking-tight">{title}</h1>
          <StatusBadge statusKey="draft" label={phaseScheduled} />
        </div>
        <p className="text-sm text-text-muted mt-1">{description}</p>
      </div>

      <Card className="max-w-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text">Scheduled for {phaseScheduled}</h2>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              This module route is established in the application shell and ready for implementation.
              In Phase 1, we focus strictly on the project foundation, design tokens, typography, and application shell.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
