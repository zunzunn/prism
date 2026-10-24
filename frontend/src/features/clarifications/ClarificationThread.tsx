import React, { useState } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Ban,
  Paperclip,
  User,
  ShieldCheck,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClarificationRequestRead, DocumentRead } from '@/types';
import { formatDateTimeIST, formatDateIST, formatRelativeDays } from '@/lib/dates';
import { ClarificationReplyModal } from './ClarificationReplyModal';
import { ClarificationResolveModal } from './ClarificationResolveModal';
import { cn } from '@/lib/utils';

interface ClarificationThreadProps {
  clarification: ClarificationRequestRead;
  currentUserRole?: string;
  applicationDocuments?: DocumentRead[];
  onDocumentClick?: (docId: string) => void;
}

export const ClarificationThread: React.FC<ClarificationThreadProps> = ({
  clarification,
  currentUserRole,
  applicationDocuments = [],
  onDocumentClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isCancelMode, setIsCancelMode] = useState(false);

  const isOfficerOrAdmin = currentUserRole === 'officer' || currentUserRole === 'admin';
  const isClosed = clarification.status === 'resolved' || clarification.status === 'cancelled';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Awaiting Response
          </span>
        );
      case 'responded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <MessageSquare className="w-3 h-3" />
            Responded
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <ShieldCheck className="w-3 h-3" />
            Under Scrutiny
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-soft text-success border border-success/20">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-text-muted border border-border">
            <Ban className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-text-muted">
            {status}
          </span>
        );
    }
  };

  const isOverdue =
    clarification.due_date &&
    !isClosed &&
    new Date(clarification.due_date).getTime() < Date.now();

  return (
    <Card className="border border-border/80 overflow-hidden shadow-xs transition-all hover:border-border">
      {/* Thread Header */}
      <div className="p-4 bg-surface-2/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(clarification.status)}

            {clarification.rule_code && (
              <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent font-mono text-[11px] font-semibold border border-accent/20">
                Rule: {clarification.rule_code}
              </span>
            )}

            {clarification.finding_title && (
              <span className="px-2 py-0.5 rounded-md bg-warning-soft text-warning font-sans text-[11px] border border-warning/20 truncate max-w-xs">
                Ref Finding: {clarification.finding_title}
              </span>
            )}

            {clarification.due_date && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans border',
                  isOverdue
                    ? 'bg-danger-soft text-danger border-danger/30 font-semibold'
                    : 'bg-surface-2 text-text-muted border-border'
                )}
              >
                {isOverdue && <AlertTriangle className="w-3 h-3" />}
                Deadline: {formatDateIST(clarification.due_date)} ({formatRelativeDays(clarification.due_date)})
              </span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-text tracking-tight pt-1">
            {clarification.title}
          </h3>
          <p className="text-[11px] text-text-muted">
            Initiated by <span className="font-medium text-text">{clarification.requested_by_name}</span> on{' '}
            {formatDateTimeIST(clarification.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isClosed && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReplyOpen(true)}
                className="text-xs h-8 gap-1.5"
              >
                <Send className="w-3 h-3" />
                Reply
              </Button>

              {isOfficerOrAdmin && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsCancelMode(false);
                      setIsResolveOpen(true);
                    }}
                    className="text-xs h-8 gap-1.5 text-success hover:bg-success-soft hover:text-success border-success/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCancelMode(true);
                      setIsResolveOpen(true);
                    }}
                    className="text-xs h-8 text-text-muted hover:text-danger"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors ml-1"
            title={isExpanded ? 'Collapse thread' : 'Expand thread'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Thread Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Initial Regulatory Request */}
          <div className="p-3.5 rounded-lg bg-surface-2/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-text-muted border-b border-border/40 pb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span className="font-semibold text-text">{clarification.requested_by_name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-accent/10 text-accent font-medium">
                  Regulatory Officer
                </span>
              </div>
              <span className="text-[11px] font-mono">{formatDateTimeIST(clarification.created_at)}</span>
            </div>
            <p className="text-xs text-text leading-relaxed whitespace-pre-wrap">
              {clarification.description}
            </p>
          </div>

          {/* Conversation Responses Stream */}
          {clarification.responses && clarification.responses.length > 0 && (
            <div className="space-y-3 pl-4 border-l-2 border-border/80">
              {clarification.responses.map((resp) => {
                const isOfficerSender = resp.sender_role === 'officer' || resp.sender_role === 'admin';
                return (
                  <div
                    key={resp.id}
                    className={cn(
                      'p-3.5 rounded-lg border text-xs space-y-2',
                      isOfficerSender
                        ? 'bg-accent/5 border-accent/20'
                        : 'bg-surface-2/60 border-border'
                    )}
                  >
                    <div className="flex items-center justify-between text-text-muted border-b border-border/30 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-text-muted" />
                        <span className="font-semibold text-text">{resp.sender_name}</span>
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.2 rounded-full font-medium',
                            isOfficerSender
                              ? 'bg-accent/10 text-accent'
                              : 'bg-info/10 text-info'
                          )}
                        >
                          {isOfficerSender ? 'Scrutiny Officer' : 'Institution Authorized'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono">{formatDateTimeIST(resp.created_at)}</span>
                    </div>

                    <p className="text-text leading-relaxed whitespace-pre-wrap">{resp.message}</p>

                    {resp.document_id && (
                      <div className="pt-2 border-t border-border/30 flex items-center gap-2">
                        <span className="text-[10px] text-text-muted uppercase font-semibold">
                          Attached Evidence:
                        </span>
                        <button
                          type="button"
                          onClick={() => resp.document_id && onDocumentClick?.(resp.document_id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-border text-xs text-accent hover:underline font-sans"
                        >
                          <Paperclip className="w-3 h-3 text-accent" />
                          <span className="truncate max-w-xs">
                            {resp.document_name || `Document #${resp.document_id}`}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Resolution Card if resolved */}
          {clarification.status === 'resolved' && (
            <div className="p-3.5 rounded-lg bg-success-soft/20 border border-success/30 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-success font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Regulatory Resolution Confirmed</span>
                <span className="text-text-muted font-normal text-[11px]">
                  • by {clarification.resolved_by_name} ({clarification.resolved_at ? formatDateTimeIST(clarification.resolved_at) : ''})
                </span>
              </div>
              <p className="text-text font-medium leading-relaxed mt-1">
                {clarification.resolution_note || 'Inquiry certified as resolved by regulatory scrutiny officer.'}
              </p>
            </div>
          )}

          {/* Cancellation Card if cancelled */}
          {clarification.status === 'cancelled' && (
            <div className="p-3.5 rounded-lg bg-surface-2 border border-border text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-text-muted font-semibold">
                <Ban className="w-3.5 h-3.5" />
                <span>Clarification Request Cancelled</span>
                <span className="text-text-muted font-normal text-[11px]">
                  • by {clarification.resolved_by_name} ({clarification.resolved_at ? formatDateTimeIST(clarification.resolved_at) : ''})
                </span>
              </div>
              <p className="text-text-muted leading-relaxed mt-1">
                {clarification.resolution_note || 'Clarification inquiry withdrawn.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      <ClarificationReplyModal
        clarification={clarification}
        documents={applicationDocuments}
        isOpen={isReplyOpen}
        onClose={() => setIsReplyOpen(false)}
      />

      {/* Resolve / Cancel Modal */}
      <ClarificationResolveModal
        clarification={clarification}
        isOpen={isResolveOpen}
        isCancelMode={isCancelMode}
        onClose={() => setIsResolveOpen(false)}
      />
    </Card>
  );
};
