export type UserRole = 'institution_user' | 'officer' | 'admin';

export interface User {
  id: string;
  display_name: string;
  name?: string;
  role: UserRole;
  email: string;
  institution_id?: string | null;
  institution_name?: string | null;
  created_at?: string;
}

export type ApplicationStage =
  | 'stage-draft'
  | 'stage-submitted'
  | 'stage-doc-check'
  | 'stage-desk-review'
  | 'stage-clarification'
  | 'stage-committee'
  | 'stage-decision'
  | 'stage-closed'
  | string;

export interface ApplicationListItem {
  id: string;
  ref: string;
  institution_id: string;
  institution_name: string;
  application_type: string;
  academic_year: string;
  stage_id: string;
  stage_name: string;
  status: string;
  owner_id?: string | null;
  owner_name?: string | null;
  submission_timestamp?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  document_count: number;
  is_priority: boolean;
}

export interface ApplicationListResponse {
  items: ApplicationListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StageConfigRead {
  id: string;
  name: string;
  order: number;
  is_terminal: boolean;
}

export interface DocumentRead {
  id: string;
  application_id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_by_id: string;
  uploaded_by_name?: string | null;
  uploaded_at: string;
  category?: string | null;
}

export interface AuditEventRead {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  detail?: Record<string, unknown> | null;
}

export interface ApplicationDetailResponse {
  application: ApplicationListItem;
  stages: StageConfigRead[];
  documents: DocumentRead[];
  audit_events: AuditEventRead[];
}
