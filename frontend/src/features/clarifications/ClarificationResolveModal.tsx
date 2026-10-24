import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, Ban, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { ClarificationRequestRead, ClarificationResolveRequest, ClarificationCancelRequest } from '@/types';

interface ClarificationResolveModalProps {
  clarification: ClarificationRequestRead | null;
  isOpen: boolean;
  isCancelMode?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClarificationResolveModal: React.FC<ClarificationResolveModalProps> = ({
  clarification,
  isOpen,
  isCancelMode = false,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resolveMutation = useMutation({
    mutationFn: async (payload: ClarificationResolveRequest) => {
      if (!clarification) throw new Error('No clarification selected');
      return apiClient<ClarificationRequestRead>(`/api/clarifications/${clarification.id}/resolve`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      if (clarification) {
        queryClient.invalidateQueries({ queryKey: ['clarifications', clarification.application_id] });
        queryClient.invalidateQueries({ queryKey: ['application-readiness', clarification.application_id] });
        queryClient.invalidateQueries({ queryKey: ['application-detail', clarification.application_id] });
      }
      handleClose();
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setError(msg);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (payload: ClarificationCancelRequest) => {
      if (!clarification) throw new Error('No clarification selected');
      return apiClient<ClarificationRequestRead>(`/api/clarifications/${clarification.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      if (clarification) {
        queryClient.invalidateQueries({ queryKey: ['clarifications', clarification.application_id] });
        queryClient.invalidateQueries({ queryKey: ['application-readiness', clarification.application_id] });
        queryClient.invalidateQueries({ queryKey: ['application-detail', clarification.application_id] });
      }
      handleClose();
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setError(msg);
    },
  });

  if (!isOpen || !clarification) return null;

  const handleClose = () => {
    setNote('');
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!note.trim()) {
      setError(isCancelMode ? 'Cancellation justification is required' : 'Resolution verification note is required');
      return;
    }

    if (isCancelMode) {
      cancelMutation.mutate({ reason: note.trim() });
    } else {
      resolveMutation.mutate({ resolution_note: note.trim() });
    }
  };

  const isPending = resolveMutation.isPending || cancelMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-2/50">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isCancelMode ? 'bg-danger-soft text-danger' : 'bg-success-soft text-success'
              }`}
            >
              {isCancelMode ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">
                {isCancelMode ? 'Cancel Clarification Request' : 'Mark Clarification Resolved'}
              </h2>
              <p className="text-[11px] text-text-muted truncate max-w-xs">{clarification.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-text-muted">
            {isCancelMode
              ? 'Cancelling this clarification will withdraw the inquiry and release any associated stage blockers. Please record an audit reason.'
              : 'Record your official officer verification assessment. Confirming resolution certifies that the institution has satisfactorily resolved the regulatory inquiry.'}
          </p>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              {isCancelMode ? 'Cancellation Justification' : 'Resolution Verification Note'}{' '}
              <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isCancelMode
                  ? 'e.g. Requirement superseded by municipal council revision certificate uploaded in Document #4...'
                  : 'e.g. Verified against local municipal planning authority registration portal. Document matches required AICTE norm...'
              }
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant={isCancelMode ? 'danger' : 'primary'}
              size="sm"
              disabled={isPending}
              className={!isCancelMode ? 'prism-gradient-bg text-white' : ''}
            >
              {isPending
                ? 'Processing...'
                : isCancelMode
                ? 'Confirm Cancellation'
                : 'Confirm Resolution'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
