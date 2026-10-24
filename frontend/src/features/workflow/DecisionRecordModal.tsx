import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Scale, CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { DecisionRecordRequest, DecisionRecordRead, ReadinessBlocker, FindingRead } from '@/types';

interface DecisionRecordModalProps {
  applicationId: string;
  blockers: ReadinessBlocker[];
  canAdminOverride: boolean;
  isAdmin: boolean;
  findings?: FindingRead[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DecisionRecordModal: React.FC<DecisionRecordModalProps> = ({
  applicationId,
  blockers = [],
  canAdminOverride,
  isAdmin,
  findings = [],
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [reason, setReason] = useState('');
  const [conditions, setConditions] = useState('');
  const [selectedFindingIds, setSelectedFindingIds] = useState<string[]>([]);
  const [overrideBlockers, setOverrideBlockers] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const hasBlockers = blockers.length > 0;

  const decisionMutation = useMutation({
    mutationFn: async (payload: DecisionRecordRequest) => {
      return apiClient<DecisionRecordRead>(`/api/applications/${applicationId}/decision`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['application-decision', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['application-readiness', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      handleClose();
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to record decision';
      setError(msg);
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setReason('');
    setConditions('');
    setSelectedFindingIds([]);
    setOverrideBlockers(false);
    setOverrideReason('');
    setError(null);
    onClose();
  };

  const toggleFindingSelection = (findingId: string) => {
    setSelectedFindingIds((prev) =>
      prev.includes(findingId) ? prev.filter((id) => id !== findingId) : [...prev, findingId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Official statutory decision justification is required');
      return;
    }

    if (hasBlockers && !overrideBlockers) {
      setError('Cannot record decision: Active blockers must be resolved or formally overridden by an administrator');
      return;
    }

    if (overrideBlockers && !overrideReason.trim()) {
      setError('Statutory administrator override justification is mandatory');
      return;
    }

    decisionMutation.mutate({
      decision,
      reason: reason.trim(),
      conditions_or_remarks: conditions.trim() || undefined,
      reference_finding_ids: selectedFindingIds,
      override_blockers: overrideBlockers,
      override_reason: overrideReason.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-2/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">Record Statutory Regulatory Determination</h2>
              <p className="text-[11px] text-text-muted">Final binding administrative decision under AICTE regulations</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto grow">
          {error && (
            <div className="p-3 rounded-md bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Decision Selection Cards */}
          <div>
            <label className="block text-xs font-medium text-text mb-2">
              Statutory Determination <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setDecision('approved')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                  decision === 'approved'
                    ? 'border-success bg-success-soft/20 ring-1 ring-success'
                    : 'border-border bg-surface-2/40 hover:bg-surface-2'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-success-soft flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-success">GRANT APPROVAL</div>
                  <p className="text-[10px] text-text-muted">Issue regulatory Letter of Approval (LoA / EoA)</p>
                </div>
              </div>

              <div
                onClick={() => setDecision('rejected')}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                  decision === 'rejected'
                    ? 'border-danger bg-danger-soft/20 ring-1 ring-danger'
                    : 'border-border bg-surface-2/40 hover:bg-surface-2'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-danger-soft flex items-center justify-center text-danger shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-danger">REJECT / REFUSE</div>
                  <p className="text-[10px] text-text-muted">Issue formal Letter of Rejection with legal grounds</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Statutory Grounds & Legal Justification <span className="text-danger">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. All requirements satisfied under AICTE Approval Process Handbook 2024-25 Clause 2.1... OR Application rejected due to unresolved land dispute..."
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Conditions of Approval / Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="e.g. Subject to submission of final Occupancy Certificate within 60 days... OR Granted for an intake of 120 seats..."
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          {/* Reference Findings Checkbox List */}
          {findings.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Link Reference Scrutiny Findings (Optional)
              </label>
              <div className="space-y-1.5 max-h-28 overflow-y-auto border border-border rounded-md p-2 bg-surface-2/30">
                {findings.map((f) => {
                  const isChecked = selectedFindingIds.includes(f.id);
                  return (
                    <label
                      key={f.id}
                      className="flex items-center gap-2 text-[11px] text-text cursor-pointer hover:bg-surface-2 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFindingSelection(f.id)}
                        className="rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="font-mono text-[10px] uppercase font-bold text-accent">
                        [{f.severity}]
                      </span>
                      <span className="truncate">{f.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Blockers & Admin Override */}
          {hasBlockers && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="p-2.5 rounded-lg bg-warning-soft/20 border border-warning/30 text-xs flex items-center gap-2 text-warning">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Decision has {blockers.length} active blocker{blockers.length === 1 ? '' : 's'}. Final decision requires statutory override.
                </span>
              </div>

              {isAdmin && canAdminOverride && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 space-y-2">
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
                        Exercise Executive Council Override
                      </span>
                      <p className="text-[10px] text-text-muted">
                        Statutory determination recorded despite open blockers. Requires recorded waiver rationale.
                      </p>
                    </div>
                  </label>

                  {overrideBlockers && (
                    <textarea
                      rows={2}
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Statutory justification for overriding blockers..."
                      className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                      required
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={decisionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={decision === 'approved' ? 'primary' : 'danger'}
              size="sm"
              disabled={decisionMutation.isPending || (hasBlockers && !overrideBlockers)}
              className={decision === 'approved' ? 'prism-gradient-bg text-white' : ''}
            >
              {decisionMutation.isPending
                ? 'Recording...'
                : decision === 'approved'
                ? 'Issue Official Approval'
                : 'Issue Official Rejection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
