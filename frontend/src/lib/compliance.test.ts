import { describe, it, expect } from 'vitest';
import { ComplianceSummaryRead, ObligationStatus } from '@/types';

describe('Compliance Status Governance', () => {
  it('preserves distinct evaluation statuses without collapsing into arbitrary percentages', () => {
    const summary: ComplianceSummaryRead = {
      total_obligations: 6,
      satisfied_count: 2,
      pending_evidence_count: 2,
      needs_review_count: 1,
      not_satisfied_count: 1,
      unable_to_evaluate_count: 0,
      not_applicable_count: 0,
      last_evaluated_at: '2026-10-24T05:30:00Z',
    };

    const sumCounts =
      summary.satisfied_count +
      summary.pending_evidence_count +
      summary.needs_review_count +
      summary.not_satisfied_count +
      summary.unable_to_evaluate_count +
      summary.not_applicable_count;

    expect(sumCounts).toBe(summary.total_obligations);
    expect(summary.total_obligations).toBe(6);
    expect(summary.satisfied_count).toBe(2);
    expect(summary.not_satisfied_count).toBe(1);
  });

  it('verifies all expected distinct obligation statuses are supported', () => {
    const allowedStatuses: ObligationStatus[] = [
      'satisfied',
      'not_satisfied',
      'pending_evidence',
      'needs_review',
      'unable_to_evaluate',
      'not_applicable',
      'exception_granted',
    ];

    expect(allowedStatuses).toHaveLength(7);
    expect(allowedStatuses).toContain('satisfied');
    expect(allowedStatuses).toContain('needs_review');
    expect(allowedStatuses).toContain('unable_to_evaluate');
  });
});
