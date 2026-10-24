import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  FileCheck,
  X,
  ShieldAlert,
  Sparkles,
  Layers,
  Filter,
  MessageSquare,
  Scale,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { FindingCard } from '@/components/FindingCard';
import { DocumentExtractionDrawer } from '@/components/DocumentExtractionDrawer';
import { ComplianceCard } from '@/features/compliance/ComplianceCard';
import { ComplianceSummaryCards } from '@/features/compliance/ComplianceSummaryCards';
import { ComplianceAuditHistory } from '@/features/compliance/ComplianceAuditHistory';
import { useAuth } from '@/features/auth/useAuth';
import { apiClient } from '@/lib/api';
import { formatDateIST, formatDateTimeIST, formatRelativeDays } from '@/lib/dates';
import {
  ApplicationComplianceResponse,
  ApplicationDetailResponse,
  DocumentRead,
  FindingRead,
  FindingReviewResponse,
  ObligationReviewResponse,
  RuleEvaluationRead,
  StageConfigRead,

  VerificationRunResponse,
} from '@/types';
import { cn } from '@/lib/utils';


export const DossierPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'summary' | 'documents' | 'findings' | 'compliance' | 'history'>('summary');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState('Land & Infrastructure');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRead | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<DocumentRead | null>(null);
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [clarificationNotice, setClarificationNotice] = useState<string | null>(null);

  // Finding Filters
  const [reviewFilter, setReviewFilter] = useState<'all' | 'needs_review' | 'confirmed' | 'dismissed'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Compliance Filters & View State
  const [complianceStatusFilter, setComplianceStatusFilter] = useState<string>('all');
  const [complianceCategoryFilter, setComplianceCategoryFilter] = useState<string>('all');
  const [complianceSearch, setComplianceSearch] = useState<string>('');
  const [showComplianceHistory, setShowComplianceHistory] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch full application dossier
  const { data, isLoading, isError, error } = useQuery<ApplicationDetailResponse>({
    queryKey: ['application-detail', id],
    queryFn: () => apiClient<ApplicationDetailResponse>(`/api/applications/${id}`),
    retry: 1,
  });

  // Fetch compliance status and obligations
  const {
    data: complianceData,
    isLoading: isComplianceLoading,
  } = useQuery<ApplicationComplianceResponse>({
    queryKey: ['application-compliance', id],
    queryFn: () => apiClient<ApplicationComplianceResponse>(`/api/applications/${id}/compliance`),
    enabled: !!id,
  });

  // Fetch compliance history evaluations
  const { data: complianceHistory = [] } = useQuery<RuleEvaluationRead[]>({
    queryKey: ['compliance-history', id],
    queryFn: () => apiClient<RuleEvaluationRead[]>(`/api/applications/${id}/compliance/history`),
    enabled: !!id && activeTab === 'compliance',
  });

  // Compliance re-evaluate mutation
  const evaluateComplianceMutation = useMutation({
    mutationFn: async () => {
      return apiClient<ApplicationComplianceResponse>(`/api/applications/${id}/compliance/evaluate`, {
        method: 'POST',
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['application-compliance', id] });
      queryClient.invalidateQueries({ queryKey: ['compliance-history', id] });
      queryClient.invalidateQueries({ queryKey: ['application-detail', id] });
      setUploadSuccess(`Compliance evaluation complete. Satisfied: ${res.summary.satisfied_count}, Needs Review: ${res.summary.needs_review_count}, Pending: ${res.summary.pending_evidence_count}`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Evaluation failed';
      setUploadError(msg);
    },
  });

  // Obligation review mutation
  const obligationReviewMutation = useMutation({
    mutationFn: async ({
      obligationId,
      reviewStatus,
      decision,
      notes,
    }: {
      obligationId: string;
      reviewStatus: 'confirmed' | 'overridden';
      decision?: 'satisfied' | 'not_satisfied' | 'exception_granted';
      notes?: string;
    }) => {
      return apiClient<ObligationReviewResponse>(`/api/compliance/obligations/${obligationId}/review`, {
        method: 'POST',
        body: JSON.stringify({ review_status: reviewStatus, decision, notes: notes || '' }),
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['application-compliance', id] });
      queryClient.invalidateQueries({ queryKey: ['compliance-history', id] });
      queryClient.invalidateQueries({ queryKey: ['application-detail', id] });
      setUploadSuccess(`Requirement ${res.obligation.rule_code} marked as ${res.obligation.review_status}.`);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Review action failed';
      setUploadError(msg);
    },
  });


  // Verify document mutation
  const verifyMutation = useMutation({
    mutationFn: async (documentId: string) => {
      setVerifyingDocId(documentId);
      return apiClient<VerificationRunResponse>(`/api/documents/${documentId}/verify`, {
        method: 'POST',
      });
    },
    onSuccess: (res) => {
      setVerifyingDocId(null);
      queryClient.invalidateQueries({ queryKey: ['application-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['document-extraction', res.document_id] });
      setUploadSuccess(`Verification completed: ${res.findings_created} possible issues flagged for human review.`);
    },
    onError: (err: unknown) => {
      setVerifyingDocId(null);
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setUploadError(msg);
    },
  });

  // Finding review mutation
  const reviewMutation = useMutation({
    mutationFn: async ({
      findingId,
      state,
      note,
    }: {
      findingId: string;
      state: 'confirmed' | 'dismissed';
      note?: string;
    }) => {
      return apiClient<FindingReviewResponse>(`/api/findings/${findingId}/review`, {
        method: 'POST',
        body: JSON.stringify({ state, note }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application-detail', id] });
    },
  });

  // Document upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, category }: { file: File; category: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      return apiClient<DocumentRead>(`/api/applications/${id}/documents`, {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: async (newDoc) => {
      setUploadSuccess(`Document "${newDoc.original_filename}" uploaded successfully.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['application-detail', id] });

      // Automatically trigger deterministic verification pipeline on uploaded document
      try {
        await verifyMutation.mutateAsync(newDoc.id);
      } catch {
        // Handled in verifyMutation.onError
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
      setUploadSuccess(null);
    },
  });

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      setUploadError('Unsupported file format. Please choose a PDF, PNG, or JPEG file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) return;
    uploadMutation.mutate({ file: selectedFile, category: documentCategory });
  };

  const handleFindingReview = async (
    findingId: string,
    state: 'confirmed' | 'dismissed',
    note?: string
  ) => {
    await reviewMutation.mutateAsync({ findingId, state, note });
  };

  const handleInspectDocument = (documentId: string) => {
    const doc = data?.documents.find((d) => d.id === documentId);
    if (doc) {
      setInspectingDoc(doc);
    }
  };

  const handleRequestClarification = (finding: FindingRead) => {
    setClarificationNotice(
      `Clarification thread initiated for "${finding.title}". (Clarifications module configured for full workflow in next phase).`
    );
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <span className="text-xs text-text-muted font-medium">Loading application dossier...</span>
      </div>
    );
  }

  if (isError) {
    const isForbidden = error instanceof Error && error.message.toLowerCase().includes('denied');
    return (
      <div className="p-10 max-w-2xl mx-auto">
        <Card className="text-center p-8 space-y-4 border-danger/30">
          <ShieldAlert className="w-10 h-10 text-danger mx-auto" />
          <h2 className="text-base font-semibold text-text">
            {isForbidden ? 'Access Denied to Dossier' : 'Failed to Load Dossier'}
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            {isForbidden
              ? 'Your authenticated institution account does not have authorization to view this dossier.'
              : 'Unable to retrieve dossier records from the service. Please verify your connection.'}
          </p>
          <div className="pt-2">
            <Button size="sm" variant="secondary" onClick={() => navigate('/applications')}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Return to Applications List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { application, stages, documents, audit_events, findings = [] } = data;

  const currentStageIndex = stages.findIndex((s) => s.id === application.stage_id);

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    if (reviewFilter !== 'all' && f.review_state !== reviewFilter) return false;
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    return true;
  });

  const needsReviewCount = findings.filter((f) => f.review_state === 'needs_review').length;
  const confirmedCount = findings.filter((f) => f.review_state === 'confirmed').length;
  const dismissedCount = findings.filter((f) => f.review_state === 'dismissed').length;

  return (
    <div className="space-y-6">
      {/* Back Link and Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/applications')}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </button>

        <div className="flex items-center gap-2">
          {needsReviewCount > 0 && (
            <span className="text-xs font-medium text-warning bg-warning-soft px-2.5 py-1 rounded-full border border-warning/20 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {needsReviewCount} {needsReviewCount === 1 ? 'Finding' : 'Findings'} Need Human Review
            </span>
          )}
          <StatusBadge statusKey={application.status} />
        </div>
      </div>

      {/* Header Card: Title, Metadata, Stage Stepper */}
      <Card className="border border-border p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-accent">
                {application.ref}
              </span>
              <span className="text-xs text-text-muted">• {application.academic_year}</span>
              <span className="text-xs text-text-muted font-medium">• {application.application_type}</span>
            </div>
            <h1 className="text-xl font-semibold text-text tracking-tight">
              {application.institution_name}
            </h1>
            <p className="text-xs text-text-muted">
              Submitted: {application.submission_timestamp ? formatDateTimeIST(application.submission_timestamp) : 'Draft stage'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2.5 rounded-md bg-surface-2 border border-border">
              <span className="text-text-muted block text-[10px] uppercase font-sans">Next Deadline</span>
              <span className="font-semibold text-text">
                {application.due_date ? formatDateIST(application.due_date) : 'None'}
              </span>
              {application.due_date && (
                <span className="text-[10px] block text-text-muted font-sans">
                  {formatRelativeDays(application.due_date)}
                </span>
              )}
            </div>

            <div className="p-2.5 rounded-md bg-surface-2 border border-border">
              <span className="text-text-muted block text-[10px] uppercase font-sans">Assigned Officer</span>
              <span className="font-semibold text-text font-sans">
                {application.owner_name || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>

        {/* Stage Progress Stepper Tracker */}
        <div className="pt-2">
          <div className="text-[11px] font-semibold text-text-muted uppercase mb-3">
            Approval Workflow Progress
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {stages.map((stage: StageConfigRead, idx: number) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.id}
                  className={cn(
                    'p-2.5 rounded-md border text-center transition-all relative overflow-hidden',
                    isCurrent
                      ? 'border-accent bg-accent-soft/20 text-accent font-semibold shadow-sm'
                      : isCompleted
                      ? 'border-success/30 bg-success-soft/10 text-success'
                      : 'border-border/60 bg-surface text-text-muted border-dashed'
                  )}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] prism-gradient-bg" />
                  )}

                  <div className="flex items-center justify-center gap-1 mb-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3 text-success" />
                    ) : isCurrent ? (
                      <Clock className="w-3 h-3 text-accent animate-pulse" />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-current text-[9px] flex items-center justify-center opacity-60">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] truncate" title={stage.name}>
                    {stage.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Clarification temporary banner */}
      {clarificationNotice && (
        <div className="p-3 rounded-lg bg-info-soft border border-info/20 text-info text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>{clarificationNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setClarificationNotice(null)}
            className="p-1 hover:text-text"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs Navigation Header */}
      <div className="flex border-b border-border text-xs font-medium space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={cn(
            'pb-2.5 transition-colors relative',
            activeTab === 'summary'
              ? 'text-accent border-b-2 border-accent font-semibold'
              : 'text-text-muted hover:text-text'
          )}
        >
          Dossier Summary
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={cn(
            'pb-2.5 transition-colors relative flex items-center gap-1.5',
            activeTab === 'documents'
              ? 'text-accent border-b-2 border-accent font-semibold'
              : 'text-text-muted hover:text-text'
          )}
        >
          <span>Supporting Documents</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-2 border border-border text-[10px] font-mono">
            {documents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('findings')}
          className={cn(
            'pb-2.5 transition-colors relative flex items-center gap-1.5',
            activeTab === 'findings'
              ? 'text-accent border-b-2 border-accent font-semibold'
              : 'text-text-muted hover:text-text'
          )}
        >
          <span>Findings & Verification</span>
          <span
            className={cn(
              'px-1.5 py-0.2 rounded-full border text-[10px] font-mono',
              needsReviewCount > 0
                ? 'bg-warning-soft text-warning border-warning/30 font-bold'
                : 'bg-surface-2 border-border text-text-muted'
            )}
          >
            {findings.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('compliance')}
          className={cn(
            'pb-2.5 transition-colors relative flex items-center gap-1.5',
            activeTab === 'compliance'
              ? 'text-accent border-b-2 border-accent font-semibold'
              : 'text-text-muted hover:text-text'
          )}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Regulatory Compliance</span>
          {complianceData?.summary && (
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full border text-[10px] font-mono',
                complianceData.summary.needs_review_count > 0 || complianceData.summary.not_satisfied_count > 0
                  ? 'bg-warning-soft text-warning border-warning/30 font-bold'
                  : 'bg-surface-2 border-border text-text-muted'
              )}
            >
              {complianceData.summary.total_obligations}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={cn(
            'pb-2.5 transition-colors relative flex items-center gap-1.5',
            activeTab === 'history'
              ? 'text-accent border-b-2 border-accent font-semibold'
              : 'text-text-muted hover:text-text'
          )}
        >
          <span>Audit History</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-2 border border-border text-[10px] font-mono">
            {audit_events.length}
          </span>
        </button>

      </div>

      {/* Tab 1: Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-5">
          {/* Attention Banner if open findings exist */}
          {needsReviewCount > 0 && (
            <div className="p-4 rounded-xl border border-warning/30 bg-warning-soft/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-text">
                    {needsReviewCount} {needsReviewCount === 1 ? 'Finding Requires Review' : 'Findings Require Review'}
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    Deterministic checks detected possible inconsistencies in supporting documents. Stage advancement requires human review.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setActiveTab('findings')}
                className="text-xs h-8 whitespace-nowrap"
              >
                Review Findings ({needsReviewCount})
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <h2 className="text-xs font-semibold text-text uppercase tracking-wider mb-4 border-b border-border pb-2">
                Application Particulars
              </h2>
              <dl className="divide-y divide-border text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Application Number</dt>
                  <dd className="font-mono text-text font-medium">{application.ref}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Application Type</dt>
                  <dd className="text-text font-medium text-right">{application.application_type}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Academic Year</dt>
                  <dd className="text-text font-mono">{application.academic_year}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Submission Date</dt>
                  <dd className="text-text font-mono">
                    {application.submission_timestamp
                      ? formatDateTimeIST(application.submission_timestamp)
                      : 'Pending'}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Approval Stage</dt>
                  <dd className="text-text font-medium">{application.stage_name}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Attached Documents</dt>
                  <dd className="font-mono text-text">{documents.length} files attached</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Open Findings</dt>
                  <dd className="font-mono text-text font-semibold">
                    {findings.length} ({needsReviewCount} awaiting review)
                  </dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="text-xs font-semibold text-text uppercase tracking-wider mb-4 border-b border-border pb-2">
                Institution Profile
              </h2>
              <dl className="divide-y divide-border text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Institution Name</dt>
                  <dd className="text-text font-medium text-right">{application.institution_name}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Institution Identifier</dt>
                  <dd className="font-mono text-text">{application.institution_id}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Assigned Regulatory Officer</dt>
                  <dd className="text-text">{application.owner_name || 'Awaiting assignment'}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-text-muted">Compliance Status</dt>
                  <dd>
                    <StatusBadge statusKey={application.status} />
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Supporting Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <Card className="border border-border p-6">
            <h2 className="text-xs font-semibold text-text uppercase tracking-wider mb-3">
              Upload Supporting Document
            </h2>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer',
                'hover:border-accent hover:bg-surface-2/50 transition-colors select-none'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FileCheck className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-60" />
              <div className="text-xs font-semibold text-text">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop a file'}
              </div>
              <div className="text-[11px] text-text-muted mt-1">
                Supported: PDF, PNG, JPG / JPEG (up to 10 MB). Extraction executes automatically upon upload.
              </div>
            </div>

            {/* Selected File Details & Category Selector */}
            {selectedFile && (
              <div className="mt-4 p-3 rounded-md bg-surface-2 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-text truncate max-w-sm">
                    {selectedFile.name}
                  </div>
                  <div className="text-[10px] text-text-muted font-mono">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={documentCategory}
                    onChange={(e) => setDocumentCategory(e.target.value)}
                    className="h-8 px-2 rounded-md bg-surface border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-focus-ring"
                  >
                    <option value="Land & Infrastructure">Land & Infrastructure</option>
                    <option value="Safety Compliance">Safety Compliance</option>
                    <option value="Institutional Disclosure">Institutional Disclosure</option>
                    <option value="Faculty Affidavit">Faculty Affidavit</option>
                    <option value="Architectural Blueprint">Architectural Blueprint</option>
                  </select>

                  <Button
                    size="sm"
                    variant="primary"
                    disabled={uploadMutation.isPending || verifyMutation.isPending}
                    onClick={handleUploadSubmit}
                  >
                    {uploadMutation.isPending
                      ? 'Uploading...'
                      : verifyMutation.isPending
                      ? 'Verifying...'
                      : 'Upload & Verify'}
                  </Button>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="mt-3 p-2.5 rounded bg-danger-soft border border-danger/20 text-danger text-xs flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="mt-3 p-2.5 rounded bg-success-soft border border-success/20 text-success text-xs flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <div className="mt-3 text-[11px] text-text-muted">
              * Notice: Uploading a document confirms ingestion for human inspection; it does not automatically prove regulatory authenticity.
            </div>
          </Card>

          {/* Uploaded Documents List */}
          <Card>
            <h2 className="text-xs font-semibold text-text uppercase tracking-wider mb-4 border-b border-border pb-2">
              Attached Compliance Documents ({documents.length})
            </h2>

            {documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted">
                No supporting documents have been attached to this application yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-text-muted font-medium">
                      <th scope="col" className="py-2.5 px-3">
                        Document Name
                      </th>
                      <th scope="col" className="py-2.5 px-3">
                        Category
                      </th>
                      <th scope="col" className="py-2.5 px-3">
                        Size
                      </th>
                      <th scope="col" className="py-2.5 px-3">
                        Uploaded By
                      </th>
                      <th scope="col" className="py-2.5 px-3">
                        Upload Date
                      </th>
                      <th scope="col" className="py-2.5 px-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {documents.map((doc: DocumentRead) => {
                      const isCurrentDocVerifying = verifyingDocId === doc.id;
                      const hasDocFindings = findings.some((f) => f.document_id === doc.id);

                      return (
                        <tr key={doc.id} className="hover:bg-surface-2/60 transition-colors">
                          <td className="py-3 px-3 font-medium text-text">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-accent shrink-0" />
                              <span className="truncate max-w-[200px]">{doc.original_filename}</span>
                              {hasDocFindings && (
                                <span className="w-2 h-2 rounded-full bg-warning" title="Has flagged findings" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-text-muted">{doc.category || 'General'}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-text-muted">
                            {(doc.file_size / 1024).toFixed(1)} KB
                          </td>
                          <td className="py-3 px-3 text-text">{doc.uploaded_by_name}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-text-muted">
                            {formatDateTimeIST(doc.uploaded_at)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect Structured Extractions */}
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setInspectingDoc(doc)}
                                className="h-7 text-xs px-2 gap-1"
                                title="Inspect extracted fields"
                              >
                                <Layers className="w-3 h-3 text-accent" />
                                Extractions
                              </Button>

                              {/* Verify Button */}
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={isCurrentDocVerifying}
                                onClick={() => verifyMutation.mutate(doc.id)}
                                className="h-7 text-xs px-2 gap-1 text-text-muted hover:text-text"
                                title="Run verification pipeline"
                              >
                                <Sparkles className="w-3 h-3" />
                                {isCurrentDocVerifying ? 'Running...' : 'Verify'}
                              </Button>

                              {/* Preview Button */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPreviewDoc(doc)}
                                className="h-7 text-xs px-2"
                                title="Preview document"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Preview
                              </Button>

                              {/* Download Link */}
                              <a
                                href={`/api/documents/${doc.id}/file`}
                                download={doc.original_filename}
                                className="inline-flex items-center justify-center h-7 px-2 text-xs rounded-md bg-surface border border-border text-text hover:bg-surface-2 transition-colors"
                                title="Download document"
                              >
                                <Download className="w-3.5 h-3.5 mr-1" />
                                Download
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Findings & Verification Engine */}
      {activeTab === 'findings' && (
        <div className="space-y-6">
          {/* Findings Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
            {/* Review State Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-text-muted mr-1 font-medium flex items-center gap-1">
                <Filter className="w-3 h-3" /> Review:
              </span>
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  reviewFilter === 'all'
                    ? 'bg-accent text-accent-fg'
                    : 'bg-surface-2 text-text-muted hover:text-text'
                )}
              >
                All ({findings.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('needs_review')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  reviewFilter === 'needs_review'
                    ? 'bg-warning text-surface font-semibold'
                    : 'bg-surface-2 text-text-muted hover:text-text'
                )}
              >
                Needs review ({needsReviewCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('confirmed')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  reviewFilter === 'confirmed'
                    ? 'bg-success text-accent-fg font-semibold'
                    : 'bg-surface-2 text-text-muted hover:text-text'
                )}
              >
                Confirmed ({confirmedCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('dismissed')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                  reviewFilter === 'dismissed'
                    ? 'bg-surface-2 text-text border border-border font-semibold'
                    : 'bg-surface-2 text-text-muted hover:text-text'
                )}
              >
                Dismissed ({dismissedCount})
              </button>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-muted font-medium">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) =>
                  setSeverityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')
                }
                className="h-8 px-2.5 rounded-md bg-surface-2 border border-border text-xs text-text focus:outline-hidden focus:ring-2 focus:ring-focus-ring"
              >
                <option value="all">All Severities</option>
                <option value="high">High Severity Only</option>
                <option value="medium">Medium Severity Only</option>
                <option value="low">Low Severity Only</option>
              </select>
            </div>
          </div>

          {/* Findings List */}
          {filteredFindings.length === 0 ? (
            <Card className="p-10 text-center space-y-3 border-dashed">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
              <h3 className="text-sm font-semibold text-text">
                No matching findings flagged
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                {findings.length === 0
                  ? 'Deterministic compliance checks found no inconsistencies in the attached documents.'
                  : 'No findings match the selected review and severity filter criteria.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  userRole={user?.role}
                  onReview={handleFindingReview}
                  onInspectDocument={handleInspectDocument}
                  onRequestClarification={handleRequestClarification}
                  isReviewing={reviewMutation.isPending}
                />
              ))}
            </div>
          )}

          {/* Mandatory Regulatory Disclaimer Footer */}
          <div className="p-4 rounded-lg bg-surface-2/60 border border-border/80 text-center">
            <p className="text-xs text-text-muted italic">
              "Findings are possible issues flagged for human review. They do not establish authenticity or decide outcomes."
            </p>
          </div>
        </div>
      )}

      {/* Tab: Regulatory Compliance & Rules Engine */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {isComplianceLoading && !complianceData ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-xs text-text-muted font-medium">Evaluating regulatory compliance obligations...</span>
            </div>
          ) : !complianceData ? (
            <Card className="p-8 text-center text-xs text-text-muted space-y-3">
              <Scale className="w-8 h-8 text-text-muted mx-auto" />
              <p>No compliance requirements could be loaded for this application.</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => evaluateComplianceMutation.mutate()}
                disabled={evaluateComplianceMutation.isPending}
                className="text-xs"
              >
                Initialize Compliance Evaluation
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Executive Status Metric Cards */}
              <ComplianceSummaryCards
                summary={complianceData.summary}
                selectedFilter={complianceStatusFilter}
                onSelectFilter={setComplianceStatusFilter}
                onReevaluate={() => evaluateComplianceMutation.mutate()}
                isEvaluating={evaluateComplianceMutation.isPending}
              />

              {/* Filter, Search & View Switcher Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={complianceSearch}
                    onChange={(e) => setComplianceSearch(e.target.value)}
                    placeholder="Search by rule code, title, or requirement..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {complianceSearch && (
                    <button
                      type="button"
                      onClick={() => setComplianceSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Category Filter Dropdown */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-text-muted font-medium flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" /> Category:
                    </span>
                    <select
                      value={complianceCategoryFilter}
                      onChange={(e) => setComplianceCategoryFilter(e.target.value)}
                      className="text-xs p-1.5 rounded bg-surface-2 border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      <option value="all">All Categories</option>
                      <option value="Land & Infrastructure">Land & Infrastructure</option>
                      <option value="Safety & Statutory">Safety & Statutory</option>
                      <option value="Transparency & Disclosures">Transparency & Disclosures</option>
                      <option value="Faculty & Governance">Faculty & Governance</option>
                      <option value="Statutory Timing">Statutory Timing</option>
                      <option value="Green Campus Initiatives">Green Campus Initiatives</option>
                    </select>
                  </div>

                  {/* Toggle View: Requirements vs Audit History */}
                  <div className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowComplianceHistory(false)}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-colors font-medium',
                        !showComplianceHistory
                          ? 'bg-surface text-text shadow-xs'
                          : 'text-text-muted hover:text-text'
                      )}
                    >
                      Requirements ({complianceData.obligations.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowComplianceHistory(true)}
                      className={cn(
                        'px-2.5 py-1 rounded-md transition-colors font-medium',
                        showComplianceHistory
                          ? 'bg-surface text-text shadow-xs'
                          : 'text-text-muted hover:text-text'
                      )}
                    >
                      Audit Trail ({complianceHistory.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* View: Audit Trail */}
              {showComplianceHistory ? (
                <ComplianceAuditHistory
                  evaluations={complianceHistory}
                  onInspectDocument={handleInspectDocument}
                />
              ) : (
                /* View: Requirements Cards List */
                <div className="space-y-4">
                  {(() => {
                    const filteredObligations = complianceData.obligations.filter((oblg) => {
                      // Status filter
                      if (complianceStatusFilter !== 'all' && oblg.status !== complianceStatusFilter) {
                        return false;
                      }
                      // Category filter
                      if (complianceCategoryFilter !== 'all' && oblg.category !== complianceCategoryFilter) {
                        return false;
                      }
                      // Search filter
                      if (complianceSearch.trim()) {
                        const q = complianceSearch.toLowerCase();
                        const matchCode = oblg.rule_code.toLowerCase().includes(q);
                        const matchTitle = oblg.title.toLowerCase().includes(q);
                        const matchDesc = oblg.rule_details?.description?.toLowerCase().includes(q);
                        if (!matchCode && !matchTitle && !matchDesc) return false;
                      }
                      return true;
                    });

                    if (filteredObligations.length === 0) {
                      return (
                        <Card className="p-8 text-center text-xs text-text-muted space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-text-muted mx-auto" />
                          <p>No regulatory obligations match the selected criteria.</p>
                          {(complianceStatusFilter !== 'all' || complianceCategoryFilter !== 'all' || complianceSearch) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setComplianceStatusFilter('all');
                                setComplianceCategoryFilter('all');
                                setComplianceSearch('');
                              }}
                              className="text-xs"
                            >
                              Reset Filters
                            </Button>
                          )}
                        </Card>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {filteredObligations.map((oblg) => (
                          <ComplianceCard
                            key={oblg.id}
                            obligation={oblg}
                            userRole={user?.role}
                            onReview={async (obligationId, reviewStatus, decision, notes) => {
                              await obligationReviewMutation.mutateAsync({
                                obligationId,
                                reviewStatus,
                                decision,
                                notes,
                              });
                            }}
                            onInspectDocument={handleInspectDocument}
                            isReviewing={obligationReviewMutation.isPending}
                          />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Mandatory AICTE Regulatory Disclaimer Footer */}
              <div className="p-4 rounded-lg bg-surface-2/60 border border-border/80 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-text">
                  <Scale className="w-3.5 h-3.5 text-accent" />
                  <span>Authoritative AICTE Regulatory Standards Governance</span>
                </div>
                <p className="text-xs text-text-muted italic max-w-3xl mx-auto leading-relaxed">
                  "Regulatory compliance assessments are evidence-based deterministic evaluations under AICTE Approval Process Handbook (APH 2024–2027) guidelines. The rules engine does not automatically grant or deny institutional approval; all final statutory determinations rest with authorized scrutiny officers."
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit History */}
      {activeTab === 'history' && (

        <Card>
          <h2 className="text-xs font-semibold text-text uppercase tracking-wider mb-4 border-b border-border pb-2">
            Chronological Audit Log ({audit_events.length} recorded events)
          </h2>

          {audit_events.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-muted">
              No audit records exist for this application.
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
              {audit_events.map((event) => (
                <div key={event.id} className="relative pl-8 text-xs">
                  {/* Event marker dot */}
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-surface border-2 border-accent transform -translate-x-1/2" />

                  <div className="p-3 rounded-md bg-surface-2/60 border border-border space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text">{event.action}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-text-muted">
                          {event.actor_role}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-text-muted">
                        {formatDateTimeIST(event.timestamp)}
                      </span>
                    </div>

                    <div className="text-[11px] text-text-muted">
                      Executed by: <span className="font-medium text-text">{event.actor_name}</span> ({event.actor_id})
                    </div>

                    {event.detail && (
                      <pre className="mt-1 p-2 rounded bg-surface border border-border text-[10px] font-mono text-text overflow-x-auto">
                        {JSON.stringify(event.detail, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Document Extraction Inspection Drawer */}
      {inspectingDoc && (
        <DocumentExtractionDrawer
          document={inspectingDoc}
          onClose={() => setInspectingDoc(null)}
          onTriggerVerify={async (docId) => {
            await verifyMutation.mutateAsync(docId);
          }}
          isVerifying={verifyingDocId === inspectingDoc.id}
        />
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-surface border border-border rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-text">{previewDoc.original_filename}</span>
                <span className="text-[10px] text-text-muted">({(previewDoc.file_size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-text-muted hover:text-text p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-surface-2/40 flex items-center justify-center min-h-[400px]">
              {previewDoc.mime_type.startsWith('image/') ? (
                <img
                  src={`/api/documents/${previewDoc.id}/file`}
                  alt={previewDoc.original_filename}
                  className="max-h-[70vh] max-w-full rounded object-contain border border-border"
                />
              ) : previewDoc.mime_type === 'application/pdf' ? (
                <iframe
                  src={`/api/documents/${previewDoc.id}/file`}
                  title={previewDoc.original_filename}
                  className="w-full h-[65vh] border border-border rounded"
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-xs text-text-muted mb-3">
                    Embedded preview is not supported for this file type.
                  </p>
                  <a
                    href={`/api/documents/${previewDoc.id}/file`}
                    download={previewDoc.original_filename}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent text-accent-fg text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
