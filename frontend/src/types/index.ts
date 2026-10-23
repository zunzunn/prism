export type UserRole = 'institution_user' | 'officer' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  institution_id?: string | null;
}

export type ApplicationStage =
  | 'draft'
  | 'submitted'
  | 'document_check'
  | 'desk_review'
  | 'clarification'
  | 'committee_review'
  | 'decision_pending'
  | 'closed';

export interface Application {
  id: string;
  ref: string;
  title: string;
  institution_id: string;
  institution_name?: string;
  stage_id: ApplicationStage;
  status: string;
  owner_id?: string | null;
  submitted_at?: string | null;
  deadline?: string | null;
  updated_at: string;
}

export type FindingSeverity = 'high' | 'medium' | 'low';
export type FindingReviewState = 'needs_review' | 'confirmed' | 'dismissed';
export type FindingSource = 'rule' | 'ai_mock';

export interface Finding {
  id: string;
  application_id: string;
  document_id?: string | null;
  severity: FindingSeverity;
  title: string;
  explanation: string;
  evidence: {
    document?: string;
    page?: number;
    snippet?: string;
    field?: string;
    value?: string;
  };
  source: FindingSource;
  confidence: 'high' | 'medium' | 'low';
  review_state: FindingReviewState;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  note?: string | null;
}

export interface AuditEvent {
  id: string;
  application_id?: string | null;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  detail?: Record<string, unknown>;
  created_at: string;
}
