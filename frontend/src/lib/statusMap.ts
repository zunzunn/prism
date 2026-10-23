export type StatusTone = 'danger' | 'warning' | 'info' | 'success' | 'neutral';

export interface StatusConfig {
  label: string;
  tone: StatusTone;
  iconName: 'alert-circle' | 'alert-triangle' | 'circle-dashed' | 'circle-check' | 'circle';
}

export const STATUS_MAP: Record<string, StatusConfig> = {
  // Attention / Danger
  needs_attention: { label: 'Needs attention', tone: 'danger', iconName: 'alert-circle' },
  overdue: { label: 'Overdue', tone: 'danger', iconName: 'alert-circle' },
  action_required: { label: 'Action required', tone: 'danger', iconName: 'alert-circle' },

  // Warning
  warning: { label: 'Warning', tone: 'warning', iconName: 'alert-triangle' },
  due_soon: { label: 'Due soon', tone: 'warning', iconName: 'alert-triangle' },
  expiring: { label: 'Expiring', tone: 'warning', iconName: 'alert-triangle' },
  needs_review: { label: 'Needs review', tone: 'warning', iconName: 'alert-triangle' },

  // In progress / Info
  in_progress: { label: 'In progress', tone: 'info', iconName: 'circle-dashed' },
  under_review: { label: 'Under review', tone: 'info', iconName: 'circle-dashed' },
  awaiting_reply: { label: 'Awaiting reply', tone: 'info', iconName: 'circle-dashed' },
  submitted: { label: 'Submitted', tone: 'info', iconName: 'circle-dashed' },

  // On track / Success
  on_track: { label: 'On track', tone: 'success', iconName: 'circle-check' },
  resolved: { label: 'Resolved', tone: 'success', iconName: 'circle-check' },
  confirmed: { label: 'Confirmed', tone: 'success', iconName: 'circle-check' },
  approved: { label: 'Approved', tone: 'success', iconName: 'circle-check' },
  extracted: { label: 'Extracted', tone: 'success', iconName: 'circle-check' },

  // Neutral / Specific
  draft: { label: 'Draft', tone: 'neutral', iconName: 'circle' },
  not_started: { label: 'Not started', tone: 'neutral', iconName: 'circle' },
  dismissed: { label: 'Dismissed', tone: 'neutral', iconName: 'circle' },
  closed: { label: 'Closed', tone: 'neutral', iconName: 'circle' },
  uncertain: { label: 'Uncertain', tone: 'warning', iconName: 'alert-triangle' },
  not_found: { label: 'Not found', tone: 'neutral', iconName: 'circle' },
  empty: { label: 'Empty file', tone: 'danger', iconName: 'alert-circle' },
  failed: { label: 'Failed', tone: 'danger', iconName: 'alert-circle' },
};

export function getStatusConfig(key: string, fallbackLabel?: string): StatusConfig {
  const normalized = key.toLowerCase().replace(/[-\s]/g, '_');
  return (
    STATUS_MAP[normalized] || {
      label: fallbackLabel || key,
      tone: 'neutral',
      iconName: 'circle',
    }
  );
}
