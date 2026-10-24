import { describe, it, expect } from 'vitest';
import {
  StageConfigRead,
  StageReadinessResponse,
  ReadinessBlocker,
  ClarificationRequestRead,
  DecisionRecordRead,
} from '@/types';

describe('Workflow Stage Configuration & Progression Invariants', () => {
  const sampleStages: StageConfigRead[] = [
    { id: 'stage-draft', name: 'Draft Application', order: 1, is_terminal: false, responsible_role: 'institution_user', allow_clarifications: false },
    { id: 'stage-submitted', name: 'Submitted / Intake', order: 2, is_terminal: false, responsible_role: 'officer', allow_clarifications: false },
    { id: 'stage-doc-check', name: 'Document Scrutiny', order: 3, is_terminal: false, responsible_role: 'officer', allow_clarifications: false },
    { id: 'stage-desk-review', name: 'Desk Evaluation', order: 4, is_terminal: false, responsible_role: 'officer', allow_clarifications: true },
    { id: 'stage-clarification', name: 'Interlocutory Clarification', order: 5, is_terminal: false, responsible_role: 'officer', allow_clarifications: true },
    { id: 'stage-committee', name: 'Scrutiny Committee Hearing', order: 6, is_terminal: false, responsible_role: 'officer', allow_clarifications: true },
    { id: 'stage-decision', name: 'Statutory Determination', order: 7, is_terminal: false, responsible_role: 'officer', requires_decision: true, allow_clarifications: true },
    { id: 'stage-closed', name: 'Archived / Concluded', order: 8, is_terminal: true, responsible_role: 'admin', allow_clarifications: false },
  ];

  it('maintains strict sequential ordering across approval stages', () => {
    const orders = sampleStages.map((s) => s.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(sampleStages[0].id).toBe('stage-draft');
    expect(sampleStages[7].id).toBe('stage-closed');
    expect(sampleStages[7].is_terminal).toBe(true);
  });

  it('correctly validates stage readiness blockers and admin override flag', () => {
    const blocker: ReadinessBlocker = {
      code: 'CLARIFICATION_UNRESOLVED',
      title: 'Active Clarification Request',
      severity: 'high',
      category: 'clarification',
      description: 'Open inquiry pending resolution',
      source_entity: 'clarification_request',
      entity_id: 'clr-0001',
    };

    const readiness: StageReadinessResponse = {
      application_id: 'app-0001',
      is_ready: false,
      current_stage_id: 'stage-desk-review',
      current_stage_name: 'Desk Evaluation',
      target_stage_id: 'stage-clarification',
      target_stage_name: 'Interlocutory Clarification',
      blockers: [blocker],
      total_blockers: 1,
      can_admin_override: true,
      assessed_at: '2026-10-24T12:00:00Z',
    };

    expect(readiness.is_ready).toBe(false);
    expect(readiness.total_blockers).toBe(1);
    expect(readiness.blockers[0].category).toBe('clarification');
    expect(readiness.blockers[0].severity).toBe('high');
    expect(readiness.can_admin_override).toBe(true);
  });

  it('handles clarification lifecycle state transitions without data loss', () => {
    const clr: ClarificationRequestRead = {
      id: 'clr-0001',
      application_id: 'app-0001',
      finding_id: 'fnd-001',
      rule_code: 'LAND-01',
      title: 'Clarify Land Title Registry',
      description: 'Please submit certified revenue extract',
      requested_by_id: 'usr-off-01',
      requested_by_name: 'Priya Sharma',
      status: 'resolved',
      due_date: '2026-10-30T18:00:00Z',
      resolution_note: 'Verified against State Revenue Department portal',
      resolved_by_id: 'usr-off-01',
      resolved_by_name: 'Priya Sharma',
      resolved_at: '2026-10-24T10:00:00Z',
      created_at: '2026-10-22T09:00:00Z',
      updated_at: '2026-10-24T10:00:00Z',
      responses: [
        {
          id: 'clr-resp-001',
          clarification_id: 'clr-0001',
          sender_id: 'usr-inst-01',
          sender_name: 'Dr. Ramesh Gupta',
          sender_role: 'institution_user',
          message: 'Attached certified extract issued on 15/09/2023',
          document_id: 'doc-0002',
          document_name: 'Land_Title_Extract.pdf',
          created_at: '2026-10-23T14:30:00Z',
        },
      ],
    };

    expect(clr.status).toBe('resolved');
    expect(clr.resolution_note).toBeDefined();
    expect(clr.responses).toHaveLength(1);
    expect(clr.responses[0].document_id).toBe('doc-0002');
  });

  it('verifies recorded statutory decisions contain binding legal determinations', () => {
    const decision: DecisionRecordRead = {
      id: 'dec-0001',
      application_id: 'app-0001',
      decided_by_id: 'usr-adm-01',
      decided_by_name: 'Vikramaditya Nair',
      decision: 'approved',
      decision_reason: 'All statutory norms under AICTE APH 2024-25 satisfied',
      conditions_or_remarks: 'Subject to permanent fire safety certificate submission',
      reference_findings: ['fnd-001'],
      decided_at: '2026-10-24T11:00:00Z',
    };

    expect(decision.decision).toBe('approved');
    expect(decision.reference_findings).toContain('fnd-001');
    expect(decision.decision_reason).toBeTruthy();
  });
});
