import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { apiClient } from '@/lib/api';
import { formatDateTimeIST } from '@/lib/dates';
import { DocumentExtractionRead, DocumentRead } from '@/types';
import { cn } from '@/lib/utils';

export interface DocumentExtractionDrawerProps {
  document: DocumentRead | null;
  onClose: () => void;
  onTriggerVerify?: (documentId: string) => Promise<void>;
  isVerifying?: boolean;
}

export const DocumentExtractionDrawer: React.FC<DocumentExtractionDrawerProps> = ({
  document,
  onClose,
  onTriggerVerify,
  isVerifying = false,
}) => {
  const [activeTab, setActiveTab] = useState<'fields' | 'raw_text'>('fields');

  const { data: extraction, isLoading, isError, refetch } = useQuery<DocumentExtractionRead>({
    queryKey: ['document-extraction', document?.id],
    queryFn: () => apiClient<DocumentExtractionRead>(`/api/documents/${document?.id}/extraction`),
    enabled: !!document,
    retry: 1,
  });

  if (!document) return null;

  const handleVerifyClick = async () => {
    if (onTriggerVerify) {
      await onTriggerVerify(document.id);
      refetch();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-overlay/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl h-full bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border bg-surface-2/40 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span className="text-xs font-mono text-text-muted">
                {document.id}
              </span>
              {extraction && <StatusBadge statusKey={extraction.status} />}
            </div>
            <h3 className="text-base font-semibold text-text truncate max-w-md">
              {document.original_filename}
            </h3>
            <p className="text-xs text-text-muted">
              {document.category || 'General Document'} • {(document.file_size / 1024).toFixed(1)} KB
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-border px-5 bg-surface">
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            className={cn(
              'py-2.5 px-3 text-xs font-medium border-b-2 transition-colors',
              activeTab === 'fields'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            )}
          >
            Structured Extracted Fields ({extraction?.extracted_fields?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw_text')}
            className={cn(
              'py-2.5 px-3 text-xs font-medium border-b-2 transition-colors',
              activeTab === 'raw_text'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text'
            )}
          >
            Raw OCR / PDF Text Stream
          </button>
        </div>

        {/* Drawer Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="space-y-3 pt-6">
              <div className="h-4 bg-surface-2 rounded animate-pulse w-3/4" />
              <div className="h-10 bg-surface-2 rounded animate-pulse" />
              <div className="h-10 bg-surface-2 rounded animate-pulse" />
              <div className="h-10 bg-surface-2 rounded animate-pulse" />
            </div>
          ) : isError ? (
            <div className="p-5 rounded-lg border border-dashed border-border text-center space-y-3 my-8">
              <AlertCircle className="w-8 h-8 text-warning mx-auto" />
              <div className="text-sm font-medium text-text">
                No extraction recorded for this document
              </div>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                This document has not been processed through the verification pipeline yet.
              </p>
              {onTriggerVerify && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleVerifyClick}
                  disabled={isVerifying}
                  className="text-xs mt-2"
                >
                  {isVerifying ? 'Running Verification...' : 'Run Verification Now'}
                </Button>
              )}
            </div>
          ) : extraction ? (
            <>
              {/* Summary Stats Bar */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded bg-surface-2/60 border border-border">
                  <span className="text-text-muted block text-[11px]">Pages Processed</span>
                  <span className="font-semibold text-text font-mono">
                    {extraction.page_count} {extraction.page_count === 1 ? 'Page' : 'Pages'}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-surface-2/60 border border-border">
                  <span className="text-text-muted block text-[11px]">Extraction Status</span>
                  <span className="font-semibold text-text capitalize">
                    {extraction.status}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-surface-2/60 border border-border">
                  <span className="text-text-muted block text-[11px]">Processed At</span>
                  <span className="font-mono text-text">
                    {formatDateTimeIST(extraction.processed_at)}
                  </span>
                </div>
              </div>

              {extraction.error_message && (
                <div className="p-3 rounded-lg bg-danger-soft text-danger border border-danger/20 text-xs">
                  <span className="font-semibold">Extraction notice: </span>
                  {extraction.error_message}
                </div>
              )}

              {activeTab === 'fields' ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-text tracking-wide uppercase">
                    Extracted Regulatory Entities
                  </h4>

                  {extraction.extracted_fields.length === 0 ? (
                    <div className="p-4 rounded-lg bg-surface-2 text-xs text-text-muted text-center">
                      No structured fields matched deterministic pattern signatures.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {extraction.extracted_fields.map((f, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-lg border border-border bg-surface space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-text font-mono">
                              {f.field_name.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <StatusBadge statusKey={f.state} />
                          </div>

                          <div className="text-xs">
                            <span className="text-text-muted block text-[11px] mb-0.5">
                              Parsed Value:
                            </span>
                            <span className="font-mono font-medium text-text">
                              {f.extracted_value || '(Not located in document)'}
                            </span>
                          </div>

                          {f.page_number && (
                            <div className="text-[11px] text-text-muted">
                              Located on Page: <strong className="text-text">{f.page_number}</strong>
                            </div>
                          )}

                          {f.evidence_snippet && (
                            <div className="mt-1">
                              <span className="text-[11px] text-text-muted block mb-0.5">
                                Surrounding Text Context:
                              </span>
                              <div className="p-2 rounded bg-surface-2 border border-border/70 font-mono text-[11px] text-text leading-relaxed whitespace-pre-wrap">
                                "{f.evidence_snippet}"
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Full Text Layer Extracted via PyMuPDF</span>
                    <span className="font-mono">
                      {extraction.extracted_text?.length || 0} characters
                    </span>
                  </div>
                  <pre className="p-4 rounded-lg bg-surface-2 border border-border font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
                    {extraction.extracted_text || '[Empty or no selectable text layer detected in document]'}
                  </pre>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-2/40 flex items-center justify-between">
          <p className="text-[11px] text-text-muted italic">
            Deterministic extraction results are logged for compliance review.
          </p>
          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
