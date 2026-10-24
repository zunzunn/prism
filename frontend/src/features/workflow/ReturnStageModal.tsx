import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { StageConfigRead, StageReturnRequest, StageTransitionResponse } from '@/types';

interface ReturnStageModalProps {
  applicationId: string;
  currentStageOrder: number;
  stages: StageConfigRead[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReturnStageModal: React.FC<ReturnStageModalProps> = ({
  applicationId,
  currentStageOrder,
  stages = [],
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [targetStageId, setTargetStageId] = useState<string>('');
  const [returnReason, setReturnReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Eligible return stages must precede current stage
  const eligibleStages = stages.filter((s) => s.order < currentStageOrder);

  const returnMutation = useMutation({
    mutationFn: async (payload: StageReturnRequest) => {
      return apiClient<StageTransitionResponse>(`/api/applications/${applicationId}/return`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['application-readiness', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['application-compliance', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      handleClose();
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to return stage';
      setError(msg);
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setTargetStageId('');
    setReturnReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetStageId) {
      setError('Please select a target return stage');
      return;
    }

    if (!returnReason.trim()) {
      setError('Return reason and re-scrutiny instructions are required');
      return;
    }

    returnMutation.mutate({
      target_stage_id: targetStageId,
      return_reason: returnReason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-2/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-warning-soft flex items-center justify-center text-warning">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">Return Application to Earlier Stage</h2>
              <p className="text-[11px] text-text-muted">Send dossier back for revisions, re-scrutiny, or correction</p>
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
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Select Return Target Stage <span className="text-danger">*</span>
            </label>
            <select
              value={targetStageId}
              onChange={(e) => setTargetStageId(e.target.value)}
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent"
              required
            >
              <option value="">-- Select an earlier stage --</option>
              {eligibleStages.map((s) => (
                <option key={s.id} value={s.id}>
                  Stage {s.order}: {s.name} ({s.description || 'Configured Stage'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Statutory Return Justification & Required Corrections <span className="text-danger">*</span>
            </label>
            <textarea
              rows={4}
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Clearly state why this application is being returned and describe the specific revisions, corrections, or re-verifications required..."
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              required
            />
          </div>

          <p className="text-[11px] text-text-muted">
            Returning an application preserves all existing document extractions and verification history while logging an immutable audit event.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={returnMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={returnMutation.isPending || !targetStageId}
              className="bg-warning hover:bg-warning/90 text-white"
            >
              {returnMutation.isPending ? 'Returning...' : 'Confirm Return'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
