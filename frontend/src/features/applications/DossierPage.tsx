import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  FileCheck,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { apiClient } from '@/lib/api';
import { formatDateIST, formatDateTimeIST, formatRelativeDays } from '@/lib/dates';
import { ApplicationDetailResponse, DocumentRead, StageConfigRead } from '@/types';
import { cn } from '@/lib/utils';

export const DossierPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'summary' | 'documents' | 'history'>('summary');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState('Land & Infrastructure');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRead | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch full application dossier
  const { data, isLoading, isError, error } = useQuery<ApplicationDetailResponse>({
    queryKey: ['application-detail', id],
    queryFn: () => apiClient<ApplicationDetailResponse>(`/api/applications/${id}`),
    retry: 1,
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
    onSuccess: (newDoc) => {
      setUploadSuccess(`Document "${newDoc.original_filename}" uploaded successfully.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['application-detail', id] });
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
      <div className="max-w-lg mx-auto mt-12 p-8 bg-surface border border-border rounded-lg shadow-sm text-center space-y-4">
        {isForbidden ? (
          <ShieldAlert className="w-10 h-10 text-danger mx-auto" />
        ) : (
          <AlertTriangle className="w-10 h-10 text-warning mx-auto" />
        )}
        <h2 className="text-base font-semibold text-text">
          {isForbidden ? 'Access Denied' : 'Application Not Found'}
        </h2>
        <p className="text-xs text-text-muted leading-relaxed">
          {error instanceof Error ? error.message : 'Unable to retrieve dossier details.'}
        </p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/applications')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Applications
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { application, stages, documents, audit_events } = data;
  const currentStageIndex = stages.findIndex((s) => s.id === application.stage_id);

  return (
    <div className="space-y-6">
      {/* Back button & dossier breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <button
          type="button"
          onClick={() => navigate('/applications')}
          className="flex items-center gap-1 hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Applications</span>
        </button>
        <span>/</span>
        <span className="font-mono text-text">{application.ref}</span>
      </div>

      {/* Application Header Card */}
      <Card className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-lg font-bold text-text">{application.ref}</span>
              <StatusBadge statusKey={application.status} />
              <span className="text-xs px-2 py-0.5 rounded bg-surface-2 border border-border text-text-muted">
                {application.academic_year}
              </span>
            </div>
            <h1 className="text-base font-semibold text-text">{application.institution_name}</h1>
            <p className="text-xs text-text-muted">{application.application_type}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
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
        <div className="pt-5">
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
                  {/* Prism gradient accent segment for active stage */}
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

      {/* Tabs Navigation */}
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
                    ? formatDateIST(application.submission_timestamp)
                    : 'Draft / Not yet submitted'}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-text-muted">Target Processing Deadline</dt>
                <dd className="text-text font-mono">
                  {application.due_date ? formatDateIST(application.due_date) : 'None assigned'}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-text-muted">Last Updated</dt>
                <dd className="text-text font-mono">{formatDateTimeIST(application.updated_at)}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-xs font-semibold text-text uppercase tracking-wider mb-4 border-b border-border pb-2">
              Institution & Governance
            </h2>
            <dl className="divide-y divide-border text-xs">
              <div className="py-2.5 flex justify-between">
                <dt className="text-text-muted">Institution Name</dt>
                <dd className="text-text font-medium text-right">{application.institution_name}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-text-muted">Institution ID</dt>
                <dd className="font-mono text-text">{application.institution_id}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-text-muted">Assigned Review Officer</dt>
                <dd className="text-text">{application.owner_name || 'Unassigned'}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-text-muted">Verified Documents Attached</dt>
                <dd className="font-mono text-accent font-semibold">{documents.length}</dd>
              </div>
            </dl>

            <div className="mt-4 p-3 rounded-md bg-surface-2 border border-border text-[11px] text-text-muted leading-relaxed">
              <span className="font-semibold text-text">Regulatory Protocol Note:</span> PRISM facilitates document workflow tracking and evidence compilation. Regulatory advancing and findings must be reviewed by designated officials before final decision recording.
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Document Upload Zone */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-semibold text-text">Upload Supporting Compliance Document</h2>
            </div>
            <p className="text-xs text-text-muted mb-4">
              Upload authenticated PDF, PNG, or JPEG supporting documents (max 10 MB per file). All uploads are stored securely on local storage.
            </p>

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
                Supported: PDF, PNG, JPG / JPEG (up to 10 MB)
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
                    className="h-8 px-2 rounded-md bg-surface border border-border text-xs text-text focus:outline-none focus:ring-2 focus:ring-focus-ring"
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
                    isLoading={uploadMutation.isPending}
                    onClick={handleUploadSubmit}
                  >
                    Upload Document
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
                    {documents.map((doc: DocumentRead) => (
                      <tr key={doc.id} className="hover:bg-surface-2/60 transition-colors">
                        <td className="py-3 px-3 font-medium text-text">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-accent shrink-0" />
                            <span className="truncate max-w-[200px]">{doc.original_filename}</span>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Audit History */}
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

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-in fade-in duration-150">
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
