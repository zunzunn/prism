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
  description?: string;
  responsible_role?: string;
  requires_decision?: boolean;
  allow_clarifications?: boolean;
  is_terminal: boolean;
  is_active?: boolean;
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

export interface OfficerSummary {
  id: string;
  display_name: string;
  email: string;
  role: string;
  active_assignments_count: number;
}

export interface AssignmentHistoryRead {
  id: string;
  application_id: string;
  assigned_by_id: string;
  assigned_by_name: string;
  previous_owner_id?: string | null;
  previous_owner_name?: string | null;
  new_owner_id: string;
  new_owner_name: string;
  reason?: string | null;
  assigned_at: string;
}

export interface AssignmentRequest {
  owner_id: string;
  reason?: string | null;
}

export interface ClarificationResponseRead {
  id: string;
  clarification_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  document_id?: string | null;
  document_name?: string | null;
  created_at: string;
}

export interface ClarificationRequestRead {
  id: string;
  application_id: string;
  finding_id?: string | null;
  finding_title?: string | null;
  rule_code?: string | null;
  title: string;
  description: string;
  requested_by_id: string;
  requested_by_name: string;
  status: 'open' | 'responded' | 'under_review' | 'resolved' | 'cancelled';
  due_date?: string | null;
  resolution_note?: string | null;
  resolved_by_id?: string | null;
  resolved_by_name?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  responses: ClarificationResponseRead[];
}

export interface ClarificationCreateRequest {
  title: string;
  description: string;
  finding_id?: string | null;
  rule_code?: string | null;
  due_date?: string | null;
}

export interface ClarificationResponseCreateRequest {
  message: string;
  document_id?: string | null;
}

export interface ClarificationResolveRequest {
  resolution_note: string;
}

export interface ClarificationCancelRequest {
  reason?: string | null;
}

export interface ReadinessBlocker {
  code: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  category: 'document' | 'finding' | 'compliance' | 'clarification' | 'assignment' | 'decision';
  description: string;
  source_entity?: string | null;
  entity_id?: string | null;
}

export interface StageReadinessResponse {
  application_id: string;
  is_ready: boolean;
  current_stage_id: string;
  current_stage_name: string;
  target_stage_id?: string | null;
  target_stage_name?: string | null;
  blockers: ReadinessBlocker[];
  total_blockers: number;
  can_admin_override: boolean;
  assessed_at: string;
}

export interface StageTransitionRequest {
  target_stage_id?: string | null;
  note?: string | null;
  override_blockers?: boolean;
  override_reason?: string | null;
}

export interface StageReturnRequest {
  target_stage_id: string;
  return_reason: string;
}

export interface StageTransitionResponse {
  application_id: string;
  previous_stage_id: string;
  previous_stage_name: string;
  new_stage_id: string;
  new_stage_name: string;
  status: string;
  message: string;
}

export interface DecisionRecordRequest {
  decision: 'approved' | 'rejected';
  reason: string;
  conditions_or_remarks?: string | null;
  reference_finding_ids?: string[];
  override_blockers?: boolean;
  override_reason?: string | null;
}

export interface DecisionRecordRead {
  id: string;
  application_id: string;
  decided_by_id: string;
  decided_by_name: string;
  decision: 'approved' | 'rejected';
  decision_reason: string;
  conditions_or_remarks?: string | null;
  reference_findings: string[];
  decided_at: string;
}


