import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Info,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ComplianceBadge } from './ComplianceBadge';
import { ComplianceObligationRead, UserRole } from '@/types';
import { formatDateTimeIST } from '@/lib/dates';
import { cn } from '@/lib/utils';

export interface ComplianceCardProps {
  obligation: ComplianceObligationRead;
  userRole?: UserRole;
  onReview?: (
    obligationId: string,
    reviewStatus: 'confirmed' | 'overridden',
    decision?: 'satisfied' | 'not_satisfied' | 'exception_granted',
    notes?: string
  ) => Promise<void>;
  onInspectDocument?: (documentId: string) => void;
  isReviewing?: boolean;
}

export const ComplianceCard: React.FC<ComplianceCardProps> = ({
  obligation,
  userRole,
  onReview,
  onInspectDocument,
  isReviewing = false,
}) => {
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideDecision, setOverrideDecision] = useState<'satisfied' | 'not_satisfied' | 'exception_granted'>('satisfied');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isOfficerOrAdmin = userRole === 'officer' || userRole === 'admin';
  const rule = obligation.rule_details;
  const evaluation = obligation.latest_evaluation;

  const handleQuickConfirm = async () => {
    if (!onReview) return;
    try {
      setIsSubmitting(true);
      setActionError(null);
      const confirmedDecision: 'satisfied' | 'not_satisfied' | 'exception_granted' =
        obligation.status === 'not_satisfied' ? 'not_satisfied' : 'satisfied';
      await onReview(
        obligation.id,
        'confirmed',
        confirmedDecision,
        'Compliance requirement verified and confirmed by authorized scrutiny officer.'
      );

    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to record confirmation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onReview) return;
    if (!reviewNotes.trim()) {
      setActionError('Review notes are required for accountability and regulatory audit trail.');
      return;
    }

    try {
      setIsSubmitting(true);
      setActionError(null);
      await onReview(
        obligation.id,
        'overridden',
        overrideDecision,
        reviewNotes.trim()
      );
      setShowOverrideForm(false);
      setReviewNotes('');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to record review determination');
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityTone = {
    high: 'text-danger bg-danger-soft border-danger/30',
    medium: 'text-warning bg-warning-soft border-warning/30',
    low: 'text-info bg-info-soft border-info/30',
  }[obligation.severity];

  return (
    <Card className="relative overflow-hidden border border-border bg-surface transition-all duration-200 hover:shadow-sm">
      {/* Top Accent Indicator based on evaluation status */}
      <div
        className={cn(
          'h-1 w-full',
          obligation.status === 'satisfied' && 'bg-success',
          obligation.status === 'not_satisfied' && 'bg-danger',
          obligation.status === 'pending_evidence' && 'bg-warning',
          obligation.status === 'needs_review' && 'bg-info',
          obligation.status === 'unable_to_evaluate' && 'bg-danger/80',
          obligation.status === 'exception_granted' && 'bg-accent'
        )}
      />

      <div className="p-5 space-y-4">
        {/* 1. Header: Rule Code + Citations + Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-accent bg-accent-soft/20 px-2 py-0.5 rounded border border-accent/20">
                {obligation.rule_code} (v{obligation.rule_version})
              </span>

              {/* Regulatory Citation Pill */}
              {rule?.is_synthetic ? (
                <span className="text-[11px] font-medium text-warning bg-warning-soft px-2 py-0.5 rounded border border-warning/20 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>Synthetic Demonstration Rule</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium text-text-muted bg-surface-2 px-2 py-0.5 rounded border border-border flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-accent" />
                  <span>{rule?.source_document || 'AICTE APH 2024–2027'}</span>
                  {rule?.source_section && (
                    <span className="text-text font-semibold">• {rule.source_section}</span>
                  )}
                </span>
              )}

              <span className="text-[11px] text-text-muted font-medium">
                • {obligation.category}
              </span>

              <span
                className={cn(
                  'text-[10px] font-semibold uppercase px-2 py-0.5 rounded border',
                  severityTone
                )}
              >
                {obligation.severity} Severity
              </span>

              {rule?.mandatory_review && (
                <span className="text-[10px] font-semibold text-info bg-info-soft px-2 py-0.5 rounded border border-info/30 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Mandatory Officer Review</span>
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-text tracking-tight">
              {obligation.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ComplianceBadge status={obligation.status} />
          </div>
        </div>

        {/* 2. Requirement Description */}
        {rule?.description && (
          <p className="text-xs text-text-muted leading-relaxed">
            {rule.description}
          </p>
        )}

        {/* 3. Explainability Box: Deterministic Evaluation Findings */}
        {evaluation ? (
          <div className="p-3.5 rounded-lg bg-surface-2 border border-border space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-text-muted">
              <span className="font-semibold uppercase tracking-wider text-text flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-accent" />
                Evidence-Based Determination Rationale
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border">
                  Batch: {evaluation.evaluation_batch_id}
                </span>
                <span>{formatDateTimeIST(evaluation.evaluated_at)}</span>
              </div>
            </div>

            {/* Plain-Language Explanation */}
            <p className="text-xs text-text leading-relaxed">
              {evaluation.explanation}
            </p>

            {/* Structured Comparison Grid */}
            {(evaluation.expected_value || evaluation.actual_value) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {evaluation.expected_value && (
                  <div className="p-2 rounded bg-surface border border-border">
                    <span className="text-[10px] font-medium text-text-muted uppercase block">
                      Required Condition
                    </span>
                    <span className="text-xs text-text font-mono font-medium">
                      {evaluation.expected_value}
                    </span>
                  </div>
                )}
                {evaluation.actual_value && (
                  <div className="p-2 rounded bg-surface border border-border">
                    <span className="text-[10px] font-medium text-text-muted uppercase block">
                      Actual Observed Evidence
                    </span>
                    <span
                      className={cn(
                        'text-xs font-mono font-medium',
                        obligation.status === 'satisfied' ? 'text-success' : 'text-danger'
                      )}
                    >
                      {evaluation.actual_value}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Supporting Evidence Reference */}
            {evaluation.evidence_document_name && (
              <div className="pt-1.5 flex items-center justify-between border-t border-border/60 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="font-medium text-text">
                    {evaluation.evidence_document_name}
                  </span>
                  {evaluation.evidence_page && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-3 border border-border text-text-muted font-mono">
                      Page {evaluation.evidence_page}
                    </span>
                  )}
                </div>

                {evaluation.evidence_document_id && onInspectDocument && (
                  <button
                    type="button"
                    onClick={() => onInspectDocument(evaluation.evidence_document_id!)}
                    className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline font-medium"
                  >
                    <span>View Evidence</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Verbatim Snippet */}
            {evaluation.evidence_snippet && (
              <div className="mt-1 p-2 rounded bg-surface border border-border text-xs font-mono text-text-muted italic border-l-2 border-l-accent">
                "{evaluation.evidence_snippet}"
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-surface-2 border border-border text-xs text-text-muted italic">
            This requirement has not yet undergone automated evidence evaluation. Click "Re-evaluate Compliance" to run checks.
          </div>
        )}

        {/* 4. Human Review & Audit Record */}
        <div className="p-3 rounded-lg bg-surface border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text">Officer Scrutiny Status:</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[11px] font-medium border capitalize',
                  obligation.review_status === 'confirmed' && 'bg-success-soft text-success border-success/30',
                  obligation.review_status === 'overridden' && 'bg-warning-soft text-warning border-warning/30',
                  obligation.review_status === 'unreviewed' && 'bg-surface-2 text-text-muted border-border'
                )}
              >
                {obligation.review_status}
              </span>
              {obligation.review_decision && obligation.review_status === 'overridden' && (
                <span className="text-[11px] text-text font-mono font-medium">
                  → Set to: {obligation.review_decision}
                </span>
              )}
            </div>

            {obligation.reviewed_by_name && (
              <p className="text-[11px] text-text-muted">
                Reviewed by {obligation.reviewed_by_name}
                {obligation.reviewed_at && ` on ${formatDateTimeIST(obligation.reviewed_at)}`}
              </p>
            )}

            {obligation.review_notes && (
              <p className="text-xs text-text italic mt-1 font-sans">
                "{obligation.review_notes}"
              </p>
            )}
          </div>

          {/* Officer Action Trigger Buttons */}
          {isOfficerOrAdmin && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {obligation.review_status === 'unreviewed' && obligation.status === 'satisfied' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleQuickConfirm}
                  disabled={isSubmitting || isReviewing}
                  className="text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  <span>Confirm Status</span>
                </Button>
              )}

              <Button
                type="button"
                variant={showOverrideForm ? 'ghost' : 'secondary'}
                size="sm"
                onClick={() => {
                  setShowOverrideForm(!showOverrideForm);
                  setActionError(null);
                }}
                disabled={isSubmitting || isReviewing}
                className="text-xs flex items-center gap-1.5 border-border"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>{showOverrideForm ? 'Cancel Decision' : 'Record Review Decision'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* 5. Inline Review Determination Form */}
        {showOverrideForm && (
          <form
            onSubmit={handleOverrideSubmit}
            className="p-4 rounded-lg bg-surface-2 border border-accent/30 space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-text flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-accent" />
                Record Authorized Officer Compliance Determination
              </span>
              <button
                type="button"
                onClick={() => setShowOverrideForm(false)}
                className="text-text-muted hover:text-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {actionError && (
              <div className="p-2 rounded bg-danger-soft border border-danger/30 text-xs text-danger">
                {actionError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                  Determination Decision
                </label>
                <select
                  value={overrideDecision}
                  onChange={(e) => setOverrideDecision(e.target.value as 'satisfied' | 'not_satisfied' | 'exception_granted')}
                  className="w-full text-xs p-2 rounded bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                >

                  <option value="satisfied">Satisfied (Requirement Met)</option>
                  <option value="not_satisfied">Not Satisfied (Requirement Breached)</option>
                  <option value="exception_granted">Exception Granted (Official Waiver)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                  Review Action Mode
                </label>
                <div className="p-2 rounded bg-surface border border-border text-xs text-text-muted">
                  Official Officer Scrutiny Determination (Overridden)
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                Mandatory Review Rationale & Handbook Citation Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Explain the legal or evidence basis for this determination (e.g. verified original stamp paper registration, manual surveyor report, or committee exemption)..."
                rows={3}
                className="w-full text-xs p-2.5 rounded bg-surface border border-border text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowOverrideForm(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                className="text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Recording Decision...' : 'Save Official Decision'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
};
