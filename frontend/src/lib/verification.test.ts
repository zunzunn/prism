import { describe, it, expect } from 'vitest';
import { getStatusConfig } from './statusMap';

describe('Verification Engine Status Mapping', () => {
  it('maps finding review states to standard tones and icons', () => {
    const needsReview = getStatusConfig('needs_review');
    expect(needsReview.label).toBe('Needs review');
    expect(needsReview.tone).toBe('warning');
    expect(needsReview.iconName).toBe('alert-triangle');

    const confirmed = getStatusConfig('confirmed');
    expect(confirmed.label).toBe('Confirmed');
    expect(confirmed.tone).toBe('success');
    expect(confirmed.iconName).toBe('circle-check');

    const dismissed = getStatusConfig('dismissed');
    expect(dismissed.label).toBe('Dismissed');
    expect(dismissed.tone).toBe('neutral');
    expect(dismissed.iconName).toBe('circle');
  });

  it('maps extraction states accurately without fabricating confidence', () => {
    const extracted = getStatusConfig('extracted');
    expect(extracted.label).toBe('Extracted');
    expect(extracted.tone).toBe('success');

    const uncertain = getStatusConfig('uncertain');
    expect(uncertain.label).toBe('Uncertain');
    expect(uncertain.tone).toBe('warning');

    const notFound = getStatusConfig('not_found');
    expect(notFound.label).toBe('Not found');
    expect(notFound.tone).toBe('neutral');

    const empty = getStatusConfig('empty');
    expect(empty.label).toBe('Empty file');
    expect(empty.tone).toBe('danger');

    const failed = getStatusConfig('failed');
    expect(failed.label).toBe('Failed');
    expect(failed.tone).toBe('danger');
  });
});
