import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  UserCheck,
  ExternalLink,
  MessageSquare,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { FindingRead, UserRole } from '@/types';
import { formatDateTimeIST } from '@/lib/dates';
import { cn } from '@/lib/utils';

export interface FindingCardProps {
  finding: FindingRead;
  userRole?: UserRole;
  onReview?: (findingId: string, state: 'confirmed' | 'dismissed', note?: string) => Promise<void>;
  onInspectDocument?: (documentId: string) => void;
  onRequestClarification?: (finding: FindingRead) => void;
  isReviewing?: boolean;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  userRole,
  onReview,
  onInspectDocument,
  onRequestClarification,
  isReviewing = false,
}) => {
  const [reviewModalState, setReviewModalState] = useState<'confirmed' | 'dismissed' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOfficerOrAdmin = userRole === 'officer' || userRole === 'admin';

  const severityTone = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }[finding.severity] as 'danger' | 'warning' | 'info';

  const handleConfirmSubmit = async () => {
    if (!reviewModalState || !onReview) return;
    try {
      setIsSubmitting(true);
      await onReview(finding.id, reviewModalState, reviewNote.trim() || undefined);
      setReviewModalState(null);
      setReviewNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border border-border bg-surface transition-all duration-200 hover:shadow-sm">
      {/* Top Accent Indicator */}
      <div
        className={cn(
          'h-1 w-full',
          finding.severity === 'high' && 'bg-danger',
          finding.severity === 'medium' && 'bg-warning',
          finding.severity === 'low' && 'bg-info'
        )}
      />

      <div className="p-5 space-y-4">
        {/* 1. Header: Severity + Title + Review State */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge
                statusKey={finding.severity}
                label={`${finding.severity.toUpperCase()} SEVERITY`}
                tone={severityTone}
              />
              <span className="text-xs font-mono text-text-muted px-2 py-0.5 rounded bg-surface-2 border border-border">
                {finding.check_id}
              </span>
              <span className="text-xs text-text-muted font-medium">
                • {finding.category}
              </span>
            </div>
            <h4 className="text-base font-semibold text-text tracking-tight mt-1">
              {finding.title}
            </h4>
          </div>

          <StatusBadge statusKey={finding.review_state} />
        </div>

        {/* 2. Plain-Language Explanation */}
        <p className="text-sm text-text-muted leading-relaxed">
          {finding.explanation}
        </p>

        {/* 3. Evidence Block */}
        {(finding.evidence_snippet || finding.extracted_value || finding.expected_value) && (
          <div className="rounded-lg bg-surface-2/60 border border-border p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5" />
                {finding.document_name ? (
                  <button
                    type="button"
                    onClick={() => finding.document_id && onInspectDocument?.(finding.document_id)}
                    className="text-accent hover:underline font-mono inline-flex items-center gap-1"
                  >
                    {finding.document_name}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : (
                  <span>Application record data</span>
                )}
                {finding.page_number && (
                  <span className="text-text-muted">• Page {finding.page_number}</span>
                )}
              </div>
            </div>

            {/* Comparison Grid */}
            {(finding.extracted_value || finding.expected_value) && (
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-mono">
                {finding.extracted_value && (
                  <div className="p-2 rounded bg-surface border border-border">
                    <span className="text-text-muted block text-[11px] font-sans font-medium mb-0.5">
                      Extracted Value
                    </span>
                    <span className="text-danger font-semibold break-all">
                      {finding.extracted_value}
                    </span>
                  </div>
                )}
                {finding.expected_value && (
                  <div className="p-2 rounded bg-surface border border-border">
                    <span className="text-text-muted block text-[11px] font-sans font-medium mb-0.5">
                      Expected / Comparison Value
                    </span>
                    <span className="text-success font-semibold break-all">
                      {finding.expected_value}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Verbatim Snippet */}
            {finding.evidence_snippet && (
              <div className="mt-1.5">
                <div className="text-[11px] font-medium text-text-muted mb-1">
                  Verbatim Document Excerpt:
                </div>
                <div className="p-2.5 rounded bg-surface border border-border font-mono text-xs text-text leading-relaxed whitespace-pre-wrap break-words">
                  "{finding.evidence_snippet}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Meta Row: Source Label, Confidence, and Review History */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs text-text-muted flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-surface-2 border border-border font-medium">
              Source: {finding.source === 'rule' ? 'Deterministic Rule' : 'AI Analysis (Mocked)'}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-2 border border-border font-medium">
              Confidence: {finding.confidence === 'high' ? 'High' : finding.confidence === 'medium' ? 'Medium' : 'Low'}
            </span>
          </div>

          {/* Review Details if already reviewed */}
          {finding.review_state !== 'needs_review' && finding.reviewed_by_name && (
            <div className="flex items-center gap-1.5 text-xs text-text font-medium bg-surface-2 px-2.5 py-1 rounded-full border border-border">
              <UserCheck className="w-3.5 h-3.5 text-accent" />
              <span>
                {finding.review_state === 'confirmed' ? 'Confirmed by' : 'Dismissed by'}{' '}
                <strong>{finding.reviewed_by_name}</strong>
              </span>
              {finding.reviewed_at && (
                <span className="text-text-muted font-normal">
                  on {formatDateTimeIST(finding.reviewed_at)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Display Review Note if available */}
        {finding.note && (
          <div className="text-xs bg-surface-2/40 border border-border/80 rounded p-2 text-text">
            <span className="font-semibold text-text-muted">Review note: </span>
            {finding.note}
          </div>
        )}

        {/* 5. Officer & Admin Actions */}
        {isOfficerOrAdmin && (
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onRequestClarification?.(finding)}
              className="text-xs h-8 gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Request clarification
            </Button>

            {finding.review_state !== 'dismissed' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReviewModalState('dismissed')}
                disabled={isReviewing}
                className="text-xs h-8 text-text-muted hover:text-danger hover:border-danger/30"
              >
                Dismiss finding
              </Button>
            )}

            {finding.review_state !== 'confirmed' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setReviewModalState('confirmed')}
                disabled={isReviewing}
                className="text-xs h-8 gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm issue
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Review Confirmation Modal */}
      {reviewModalState && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md bg-surface rounded-xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text flex items-center gap-2">
                {reviewModalState === 'confirmed' ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning" />
                )}
                {reviewModalState === 'confirmed' ? 'Confirm Regulatory Finding' : 'Dismiss Finding'}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalState(null)}
                className="text-text-muted hover:text-text p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-text-muted">
              {reviewModalState === 'confirmed'
                ? `You are confirming "${finding.title}". This will record an official finding requiring resolution before terminal approval.`
                : `You are dismissing "${finding.title}". This finding will no longer block stage advancement.`}
            </p>

            <div className="space-y-1.5">
              <label htmlFor="review-note" className="text-xs font-medium text-text">
                Review justification note (optional):
              </label>
              <textarea
                id="review-note"
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add audit rationale or context for this decision..."
                className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-2 focus:ring-2 focus:ring-focus-ring focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReviewModalState(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant={reviewModalState === 'confirmed' ? 'primary' : 'danger'}
                size="sm"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving decision...'
                  : reviewModalState === 'confirmed'
                  ? 'Confirm Finding'
                  : 'Dismiss Finding'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
