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

export interface ExtractedFieldSchema {
  field_name: string;
  extracted_value?: string | null;
  state: 'extracted' | 'uncertain' | 'not_found';
  page_number?: number | null;
  evidence_snippet?: string | null;
}

export interface DocumentExtractionRead {
  id: string;
  document_id: string;
  application_id: string;
  status: string;
  page_count: number;
  extracted_text?: string | null;
  extracted_fields: ExtractedFieldSchema[];
  processed_at: string;
  error_message?: string | null;
}

export interface FindingRead {
  id: string;
  application_id: string;
  document_id?: string | null;
  document_name?: string | null;
  check_id: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  explanation: string;
  extracted_value?: string | null;
  expected_value?: string | null;
  evidence_snippet?: string | null;
  page_number?: number | null;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  review_state: 'needs_review' | 'confirmed' | 'dismissed';
  reviewed_by_id?: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
  note?: string | null;
  created_at: string;
}

export interface FindingReviewRequest {
  state: 'confirmed' | 'dismissed';
  note?: string;
}

export interface FindingReviewResponse {
  finding: FindingRead;
  message: string;
}

export interface VerificationRunResponse {
  document_id: string;
  application_id: string;
  extraction_status: string;
  findings_created: number;
  findings: FindingRead[];
}

export interface ApplicationDetailResponse {
  application: ApplicationListItem;
  stages: StageConfigRead[];
  documents: DocumentRead[];
  audit_events: AuditEventRead[];
  findings?: FindingRead[];
}

export type ObligationStatus =
  | 'satisfied'
  | 'not_satisfied'
  | 'pending_evidence'
  | 'needs_review'
  | 'unable_to_evaluate'
  | 'not_applicable'
  | 'exception_granted';

export type ReviewStatus = 'unreviewed' | 'confirmed' | 'overridden';

export interface RegulatoryRuleRead {
  id: string;
  rule_code: string;
  version: string;
  title: string;
  description: string;
  category: string;
  applicable_types: string[];
  evaluation_type: string;
  severity: 'high' | 'medium' | 'low';
  mandatory_review: boolean;
  source_document: string;
  source_section: string;
  effective_from: string;
  effective_until?: string | null;
  is_synthetic: boolean;
  is_active: boolean;
  created_at: string;
}

export interface RuleEvaluationRead {
  id: string;
  application_id: string;
  obligation_id?: string | null;
  rule_code: string;
  rule_version: string;
  evaluation_batch_id: string;
  status: ObligationStatus;
  explanation: string;
  expected_value?: string | null;
  actual_value?: string | null;
  evidence_document_id?: string | null;
  evidence_document_name?: string | null;
  evidence_page?: number | null;
  evidence_snippet?: string | null;
  evaluator_type: 'deterministic' | 'manual_review';
  error_detail?: string | null;
  evaluated_at: string;
}

export interface ComplianceObligationRead {
  id: string;
  application_id: string;
  rule_code: string;
  rule_version: string;
  title: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  status: ObligationStatus;
  due_date?: string | null;
  last_evaluated_at?: string | null;
  review_status: ReviewStatus;
  review_decision?: string | null;
  reviewed_by_id?: string | null;
  reviewed_by_name?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
  rule_details?: RegulatoryRuleRead | null;
  latest_evaluation?: RuleEvaluationRead | null;
}

export interface ComplianceSummaryRead {
  total_obligations: number;
  satisfied_count: number;
  pending_evidence_count: number;
  needs_review_count: number;
  not_satisfied_count: number;
  unable_to_evaluate_count: number;
  not_applicable_count: number;
  last_evaluated_at?: string | null;
}

export interface ApplicationComplianceResponse {
  application_id: string;
  application_ref: string;
  academic_year: string;
  summary: ComplianceSummaryRead;
  obligations: ComplianceObligationRead[];
}

export interface ObligationReviewRequest {
  review_status: 'confirmed' | 'overridden';
  decision?: 'satisfied' | 'not_satisfied' | 'exception_granted';
  notes: string;
}

export interface ObligationReviewResponse {
  obligation: ComplianceObligationRead;
  message: string;
}

