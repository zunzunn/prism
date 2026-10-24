import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Send, AlertCircle, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { ClarificationRequestRead, ClarificationResponseCreateRequest, ClarificationResponseRead, DocumentRead } from '@/types';

interface ClarificationReplyModalProps {
  clarification: ClarificationRequestRead | null;
  documents?: DocumentRead[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClarificationReplyModal: React.FC<ClarificationReplyModalProps> = ({
  clarification,
  documents = [],
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [documentId, setDocumentId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const replyMutation = useMutation({
    mutationFn: async (payload: ClarificationResponseCreateRequest) => {
      if (!clarification) throw new Error('No clarification selected');
      return apiClient<ClarificationResponseRead>(`/api/clarifications/${clarification.id}/reply`, {
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
      const msg = err instanceof Error ? err.message : 'Failed to submit clarification reply';
      setError(msg);
    },
  });

  if (!isOpen || !clarification) return null;

  const handleClose = () => {
    setMessage('');
    setDocumentId('');
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError('Response message is required');
      return;
    }

    replyMutation.mutate({
      message: message.trim(),
      document_id: documentId || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-2/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-info-soft flex items-center justify-center text-info">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">Respond to Clarification</h2>
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

          <div className="p-3 rounded-md bg-surface-2 border border-border text-xs space-y-1">
            <span className="text-[10px] uppercase font-semibold text-text-muted block">Regulatory Inquiry:</span>
            <p className="text-text font-medium">{clarification.title}</p>
            <p className="text-text-muted leading-relaxed">{clarification.description}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Institution Response / Submission <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="State your formal clarification response, address the specific queries, and explain any accompanying documentation..."
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Attach Supporting Application Document (Optional)
            </label>
            <div className="relative">
              <select
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 pl-8 text-text focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">-- No Document Attached --</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.original_filename} ({d.category})
                  </option>
                ))}
              </select>
              <Paperclip className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              If the required document is not yet in this list, upload it first under the Documents tab.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={replyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={replyMutation.isPending}
              className="prism-gradient-bg text-white"
            >
              {replyMutation.isPending ? 'Submitting...' : 'Submit Response'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
