import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  ArrowRight,
  RotateCcw,
  Scale,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import {
  StageReadinessResponse,
  DecisionRecordRead,
  StageConfigRead,
  FindingRead,
  DocumentRead,
} from '@/types';
import { formatDateTimeIST } from '@/lib/dates';
import { AdvanceStageModal } from './AdvanceStageModal';
import { ReturnStageModal } from './ReturnStageModal';
import { AssignOfficerModal } from './AssignOfficerModal';
import { DecisionRecordModal } from './DecisionRecordModal';

interface WorkflowActionCenterProps {
  applicationId: string;
  currentStageId: string;
  currentStageName: string;
  assignedOwnerId?: string | null;
  assignedOwnerName?: string | null;
  stages: StageConfigRead[];
  findings?: FindingRead[];
  documents?: DocumentRead[];
  currentUserRole?: string;
  isTerminal?: boolean;
}

export const WorkflowActionCenter: React.FC<WorkflowActionCenterProps> = ({
  applicationId,
  currentStageId,
  currentStageName,
  assignedOwnerId,
  assignedOwnerName,
  stages = [],
  findings = [],
  currentUserRole,
  isTerminal = false,
}) => {
  const [showBlockers, setShowBlockers] = useState(false);
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  const isOfficerOrAdmin = currentUserRole === 'officer' || currentUserRole === 'admin';
  const isAdmin = currentUserRole === 'admin';

  // Fetch readiness
  const { data: readiness, isLoading: isReadinessLoading } = useQuery<StageReadinessResponse>({
    queryKey: ['application-readiness', applicationId],
    queryFn: () => apiClient<StageReadinessResponse>(`/api/applications/${applicationId}/readiness`),
    enabled: !isTerminal,
  });

  // Fetch decision record
  const { data: decision } = useQuery<DecisionRecordRead | null>({
    queryKey: ['application-decision', applicationId],
    queryFn: async () => {
      try {
        return await apiClient<DecisionRecordRead>(`/api/applications/${applicationId}/decision`);
      } catch {
        return null;
      }
    },
  });

  const currentStage = stages.find((s) => s.id === currentStageId);
  const currentStageOrder = currentStage?.order || 1;
  const isDecisionStage =
    currentStage?.requires_decision ||
    currentStageId === 'stage-decision' ||
    currentStageId === 'stage-committee';

  const isReady = readiness?.is_ready ?? false;
  const blockers = readiness?.blockers ?? [];
  const canAdminOverride = readiness?.can_admin_override ?? false;

  return (
    <Card className="border border-border/80 overflow-hidden shadow-xs bg-surface space-y-4 p-5">
      {/* If an official statutory decision is already recorded, display determination certificate */}
      {decision && (
        <div
          className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            decision.decision === 'approved'
              ? 'bg-success-soft/20 border-success/30 text-success'
              : 'bg-danger-soft/20 border-danger/30 text-danger'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                decision.decision === 'approved' ? 'bg-success text-white' : 'bg-danger text-white'
              }`}
            >
              {decision.decision === 'approved' ? (
                <FileCheck2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  STATUTORY REGULATORY DETERMINATION
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface text-text border border-border">
                  {decision.decision === 'approved' ? 'APPROVAL GRANTED' : 'REJECTED / REFUSED'}
                </span>
              </div>
              <p className="text-xs font-medium text-text leading-relaxed">
                {decision.decision_reason}
              </p>
              {decision.conditions_or_remarks && (
                <p className="text-[11px] text-text-muted italic">
                  Conditions / Remarks: {decision.conditions_or_remarks}
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 border-t md:border-t-0 md:border-l border-border/50 pt-2 md:pt-0 md:pl-4 text-xs text-text-muted">
            <span className="block font-medium text-text">{decision.decided_by_name}</span>
            <span className="block text-[11px] font-mono">
              {formatDateTimeIST(decision.decided_at)}
            </span>
          </div>
        </div>
      )}

      {/* Main Workflow Control Banner */}
      {!isTerminal ? (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-4">
            {/* Left: Readiness Status & Blocker Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Workflow Readiness:
                </span>
                {isReadinessLoading ? (
                  <span className="text-xs text-text-muted">Assessing stage requirements...</span>
                ) : isReady ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-soft text-success border border-success/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready for Advancement
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-soft text-warning border border-warning/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Advancement Blocked ({blockers.length} Condition{blockers.length === 1 ? '' : 's'})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>
                  Current: <strong className="text-text">{currentStageName}</strong>
                </span>
                <span>•</span>
                <span>
                  Next Target:{' '}
                  <strong className="text-accent">
                    {readiness?.target_stage_name || 'Terminal Stage'}
                  </strong>
                </span>

                {blockers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowBlockers(!showBlockers)}
                    className="inline-flex items-center gap-1 text-accent font-medium hover:underline ml-2"
                  >
                    <span>{showBlockers ? 'Hide Details' : 'View Blockers'}</span>
                    {showBlockers ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Assigned Officer & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Assignee Widget */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs">
                <Shield className="w-3.5 h-3.5 text-accent" />
                <div>
                  <span className="text-[10px] text-text-muted uppercase block leading-none">
                    Review Officer
                  </span>
                  <span className="font-semibold text-text">
                    {assignedOwnerName || 'Unassigned'}
                  </span>
                </div>
                {isOfficerOrAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAssignOpen(true)}
                    className="h-6 px-2 text-[10px] text-accent hover:bg-accent-soft ml-1"
                  >
                    <UserCheck className="w-3 h-3 mr-1" />
                    Reassign
                  </Button>
                )}
              </div>

              {/* Action Buttons */}
              {isOfficerOrAdmin && (
                <>
                  {currentStageOrder > 1 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsReturnOpen(true)}
                      className="text-xs h-9 gap-1 text-text-muted hover:text-text"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Return Stage
                    </Button>
                  )}

                  {isDecisionStage && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsDecisionOpen(true)}
                      className="text-xs h-9 gap-1.5 border-accent/40 text-accent hover:bg-accent/10 font-semibold"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      Record Decision
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAdvanceOpen(true)}
                    disabled={!isReady && !isAdmin}
                    className="prism-gradient-bg text-white text-xs h-9 gap-1.5 shadow-sm"
                  >
                    <span>Advance Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Collapsible Blocker Details */}
          {showBlockers && blockers.length > 0 && (
            <div className="p-4 rounded-xl bg-surface-2/40 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  Stage Progression Blockers
                </span>
                {canAdminOverride && (
                  <span className="text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                    Admin Override Available
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {blockers.map((blocker, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface border border-border/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text truncate pr-2">
                        {blocker.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          blocker.severity === 'high'
                            ? 'bg-danger-soft text-danger'
                            : blocker.severity === 'medium'
                            ? 'bg-warning-soft text-warning'
                            : 'bg-surface-2 text-text-muted'
                        }`}
                      >
                        {blocker.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {blocker.description}
                    </p>
                    <div className="text-[10px] text-text-muted font-mono pt-1">
                      Category: {blocker.category} • Code: {blocker.code}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-surface-2/60 border border-border text-xs text-text-muted flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>This regulatory application is in terminal state ({currentStageName}).</span>
          </div>
          <span className="text-[11px] font-mono uppercase font-semibold">Workflow Concluded</span>
        </div>
      )}

      {/* Modals */}
      <AdvanceStageModal
        applicationId={applicationId}
        currentStageName={currentStageName}
        targetStageId={readiness?.target_stage_id}
        targetStageName={readiness?.target_stage_name}
        blockers={blockers}
        canAdminOverride={canAdminOverride}
        isAdmin={isAdmin}
        isOpen={isAdvanceOpen}
        onClose={() => setIsAdvanceOpen(false)}
      />

      <ReturnStageModal
        applicationId={applicationId}
        currentStageOrder={currentStageOrder}
        stages={stages}
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
      />

      <AssignOfficerModal
        applicationId={applicationId}
        currentOwnerId={assignedOwnerId}
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
      />

      <DecisionRecordModal
        applicationId={applicationId}
        blockers={blockers}
        canAdminOverride={canAdminOverride}
        isAdmin={isAdmin}
        findings={findings}
        isOpen={isDecisionOpen}
        onClose={() => setIsDecisionOpen(false)}
      />
    </Card>
  );
};
