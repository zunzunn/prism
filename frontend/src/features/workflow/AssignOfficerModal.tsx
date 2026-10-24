import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UserCheck, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { OfficerSummary, AssignmentHistoryRead, AssignmentRequest } from '@/types';

interface AssignOfficerModalProps {
  applicationId: string;
  currentOwnerId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  applicationId,
  currentOwnerId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(currentOwnerId || '');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { data: officers = [], isLoading: isLoadingOfficers } = useQuery<OfficerSummary[]>({
    queryKey: ['officers-list'],
    queryFn: () => apiClient<OfficerSummary[]>('/api/users/officers'),
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: async (payload: AssignmentRequest) => {
      return apiClient<AssignmentHistoryRead>(`/api/applications/${applicationId}/assign`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['application-readiness', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['application-assignments', applicationId] });
      handleClose();
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to assign officer';
      setError(msg);
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedOwnerId) {
      setError('Please select an eligible scrutiny officer');
      return;
    }

    assignMutation.mutate({
      owner_id: selectedOwnerId,
      reason: reason.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-xl bg-surface border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-2/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text">Assign Scrutiny Officer</h2>
              <p className="text-[11px] text-text-muted">Allocate application ownership for regulatory review</p>
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
              Select Officer <span className="text-danger">*</span>
            </label>
            {isLoadingOfficers ? (
              <div className="text-xs text-text-muted py-2">Loading eligible officers...</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {officers.map((officer) => {
                  const isSelected = selectedOwnerId === officer.id;
                  const isCurrent = currentOwnerId === officer.id;

                  return (
                    <div
                      key={officer.id}
                      onClick={() => setSelectedOwnerId(officer.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-accent bg-accent/5 ring-1 ring-accent'
                          : 'border-border bg-surface-2/40 hover:bg-surface-2'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-text">
                          <Shield className="w-3.5 h-3.5 text-accent" />
                          <span>{officer.display_name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-2 text-text-muted font-normal border border-border">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted">{officer.email}</div>
                      </div>

                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border text-[10px] font-mono text-text font-medium">
                          {officer.active_assignments_count} active
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Assignment / Reassignment Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Regional workload balancing, domain specialist re-assignment"
              className="w-full text-xs rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={assignMutation.isPending || !selectedOwnerId}
              className="prism-gradient-bg text-white"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
