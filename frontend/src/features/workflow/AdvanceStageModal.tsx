import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ArrowRight, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { ReadinessBlocker, StageTransitionRequest, StageTransitionResponse } from '@/types';

interface AdvanceStageModalProps {
  applicationId: string;
  currentStageName: string;
  targetStageId?: string | null;
  targetStageName?: string | null;
  blockers: ReadinessBlocker[];
  canAdminOverride: boolean;
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdvanceStageModal: React.FC<AdvanceStageModalProps> = ({
  applicationId,
  currentStageName,
  targetStageId,
  targetStageName,
  blockers = [],
  canAdminOverride,
  isAdmin,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');
  const [overrideBlockers, setOverrideBlockers] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hasBlockers = blockers.length > 0;

  const advanceMutation = useMutation({
    mutationFn: async (payload: StageTransitionRequest) => {
      return apiClient<StageTransitionResponse>(`/api/applications/${applicationId}/advance`, {
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
      const msg = err instanceof Error ? err.message : 'Failed to advance stage';
      setError(msg);
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setNote('');
    setOverrideBlockers(false);
    setOverrideReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (hasBlockers && !overrideBlockers) {
      setError('Cannot advance: Stage has unresolved blockers preventing automatic progression');
      return;
    }

    if (overrideBlockers && !overrideReason.trim()) {
      setError('Mandatory statutory legal justification is required for administrator override');
      return;
    }

    advanceMutation.mutate({
      target_stage_id: targetStageId || null,
      note: note.trim() || undefined,
      override_blockers: overrideBlockers,
      override_reason: overrideReason.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-2/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">Advance Approval Stage</h2>
              <p className="text-[11px] text-text-muted">Progress application to next regulatory milestone</p>
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

          {/* Stage Transition Visual */}
          <div className="p-3.5 rounded-lg bg-surface-2/60 border border-border flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Current Stage</span>
              <div className="font-semibold text-text">{currentStageName}</div>
            </div>

            <div className="flex items-center px-3 text-accent">
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </div>

            <div className="space-y-0.5 text-right">
              <span className="text-[10px] text-text-muted uppercase font-semibold">Advancing To</span>
              <div className="font-semibold text-accent">{targetStageName || 'Next Configured Stage'}</div>
            </div>
          </div>

          {/* Blockers Notification / List */}
          {hasBlockers ? (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-warning-soft/20 border border-warning/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-warning font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Advancement Blocked: {blockers.length} Unresolved Condition{blockers.length === 1 ? '' : 's'}</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {blockers.map((b, idx) => (
                    <div key={idx} className="p-2 rounded bg-surface border border-border/80 text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text">{b.title}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-danger-soft text-danger">
                          {b.severity}
                        </span>
                      </div>
                      <p className="text-text-muted text-[10px]">{b.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Override Option */}
              {isAdmin && canAdminOverride ? (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 space-y-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideBlockers}
                      onChange={(e) => setOverrideBlockers(e.target.checked)}
                      className="mt-0.5 rounded border-border text-accent focus:ring-accent"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-text flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-accent" />
                        Apply Administrator Statutory Override
                      </span>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Permit transition despite active blockers under authorized administrative prerogative.
                      </p>
                    </div>
                  </label>

                  {overrideBlockers && (
                    <div>
                      <label className="block text-[11px] font-medium text-text mb-1">
                        Mandatory Statutory Justification <span className="text-danger">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g. Approved under Executive Committee Resolution #49 / statutory hearing exception..."
                        className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                        required
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-text-muted italic">
                  All blocking findings, compliance obligations, or open clarifications must be resolved by an officer before stage transition can proceed.
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-success-soft/20 border border-success/30 text-xs flex items-center gap-2 text-success">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>All stage prerequisites verified. Application is ready to advance.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Transition Note / Scrutiny Remarks (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Scrutiny committee dossier prepared for evaluation"
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={advanceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={advanceMutation.isPending || (hasBlockers && !overrideBlockers)}
              className="prism-gradient-bg text-white"
            >
              {advanceMutation.isPending ? 'Advancing...' : 'Confirm Stage Advancement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
