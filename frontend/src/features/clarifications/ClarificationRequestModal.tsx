import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, MessageSquare, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { FindingRead, ClarificationCreateRequest, ClarificationRequestRead } from '@/types';

interface ClarificationRequestModalProps {
  applicationId: string;
  findings?: FindingRead[];
  preselectedFindingId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClarificationRequestModal: React.FC<ClarificationRequestModalProps> = ({
  applicationId,
  findings = [],
  preselectedFindingId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ruleCode, setRuleCode] = useState('');
  const [findingId, setFindingId] = useState<string>(preselectedFindingId || '');
  const [dueDate, setDueDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (payload: ClarificationCreateRequest) => {
      return apiClient<ClarificationRequestRead>(`/api/applications/${applicationId}/clarifications`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clarifications', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['application-readiness', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['application-detail', applicationId] });
      handleClose();
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to issue clarification request';
      setError(msg);
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setRuleCode('');
    setFindingId('');
    setDueDate('');
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Subject / title is required');
      return;
    }
    if (!description.trim()) {
      setError('Detailed explanation / request text is required');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      rule_code: ruleCode.trim() || null,
      finding_id: findingId || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-2/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">Issue Clarification Request</h2>
              <p className="text-[11px] text-text-muted">Formal regulatory request to the applicant institution</p>
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

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Subject / Clarification Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clarification on Land Title / Encumbrance Certificate"
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Detailed Inquiry & Specific Requirements <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clearly state what discrepancy or missing detail requires clarification, and specify any required supporting documents..."
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Link to Finding (Optional)
              </label>
              <select
                value={findingId}
                onChange={(e) => setFindingId(e.target.value)}
                className="w-full text-xs rounded-md border border-border bg-surface px-2.5 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">-- None / General --</option>
                {findings.map((f) => (
                  <option key={f.id} value={f.id}>
                    [{f.severity.toUpperCase()}] {f.title.substring(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Associated Rule Code (Optional)
              </label>
              <input
                type="text"
                value={ruleCode}
                onChange={(e) => setRuleCode(e.target.value)}
                placeholder="e.g. LAND-01, BUILT-01"
                className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Response Deadline (Optional)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <Calendar className="w-3.5 h-3.5 text-text-muted absolute right-3 top-2.5 pointer-events-none" />
            </div>
            <p className="text-[10px] text-text-muted mt-1">
              Standard AICTE procedural reply window is 7 to 14 calendar days.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={createMutation.isPending}
              className="prism-gradient-bg text-white"
            >
              {createMutation.isPending ? 'Issuing...' : 'Issue Clarification Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
