import React, { useState } from 'react';
import {
  ExternalLink,
  FileText,
  History,
  Scale,
  UserCheck,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { ComplianceBadge } from './ComplianceBadge';
import { RuleEvaluationRead } from '@/types';
import { formatDateTimeIST } from '@/lib/dates';
import { cn } from '@/lib/utils';

export interface ComplianceAuditHistoryProps {
  evaluations: RuleEvaluationRead[];
  onInspectDocument?: (documentId: string) => void;
}

export const ComplianceAuditHistory: React.FC<ComplianceAuditHistoryProps> = ({
  evaluations,
  onInspectDocument,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'deterministic' | 'manual_review'>('all');

  const filtered = evaluations.filter((e) => {
    if (filterType === 'all') return true;
    return e.evaluator_type === filterType;
  });

  return (
    <Card className="border border-border p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-text tracking-tight">
            Compliance Evaluation Audit Trail & Version Log
          </h3>
          <span className="text-xs font-mono text-text-muted bg-surface-2 px-2 py-0.5 rounded border border-border">
            {evaluations.length} {evaluations.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors text-xs font-medium',
              filterType === 'all'
                ? 'bg-accent text-accent-contrast'
                : 'bg-surface-2 text-text-muted hover:text-text'
            )}
          >
            All Logs
          </button>
          <button
            type="button"
            onClick={() => setFilterType('deterministic')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors text-xs font-medium',
              filterType === 'deterministic'
                ? 'bg-accent text-accent-contrast'
                : 'bg-surface-2 text-text-muted hover:text-text'
            )}
          >
            Automated Checks
          </button>
          <button
            type="button"
            onClick={() => setFilterType('manual_review')}
            className={cn(
              'px-2.5 py-1 rounded transition-colors text-xs font-medium',
              filterType === 'manual_review'
                ? 'bg-accent text-accent-contrast'
                : 'bg-surface-2 text-text-muted hover:text-text'
            )}
          >
            Officer Reviews
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-xs text-text-muted italic">
          No compliance evaluation records found for this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isManual = item.evaluator_type === 'manual_review';

            return (
              <div
                key={item.id}
                className={cn(
                  'p-3.5 rounded-lg border transition-all text-xs space-y-2',
                  isManual
                    ? 'bg-surface-2 border-accent/30'
                    : 'bg-surface border-border'
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-accent">
                      {item.rule_code} (v{item.rule_version})
                    </span>

                    <span
                      className={cn(
                        'text-[10px] font-semibold uppercase px-2 py-0.5 rounded border flex items-center gap-1',
                        isManual
                          ? 'bg-info-soft text-info border-info/30'
                          : 'bg-surface-3 text-text-muted border-border'
                      )}
                    >
                      {isManual ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          <span>Officer Review</span>
                        </>
                      ) : (
                        <>
                          <Scale className="w-3 h-3" />
                          <span>Deterministic Rule Check</span>
                        </>
                      )}
                    </span>

                    <span className="font-mono text-[10px] text-text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-border">
                      Run ID: {item.evaluation_batch_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-text-muted">
                      {formatDateTimeIST(item.evaluated_at)}
                    </span>
                    <ComplianceBadge status={item.status} />
                  </div>
                </div>

                <p className="text-text leading-relaxed font-sans">
                  {item.explanation}
                </p>

                {item.evidence_document_name && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-text-muted border-t border-border/60">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-accent" />
                      <span>{item.evidence_document_name}</span>
                      {item.evidence_page && <span>(Page {item.evidence_page})</span>}
                    </div>

                    {item.evidence_document_id && onInspectDocument && (
                      <button
                        type="button"
                        onClick={() => onInspectDocument(item.evidence_document_id!)}
                        className="text-accent hover:underline flex items-center gap-1"
                      >
                        <span>View File</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
