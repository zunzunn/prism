import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { apiClient } from '@/lib/api';
import { formatDateIST, formatRelativeDays } from '@/lib/dates';
import { ApplicationListItem, ApplicationListResponse } from '@/types';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/utils';

export const ListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Filter and pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false);
  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Query applications from backend
  const { data, isLoading, isError, error, refetch } = useQuery<ApplicationListResponse>({
    queryKey: [
      'applications',
      page,
      pageSize,
      search,
      selectedStage,
      selectedStatus,
      needsAttentionOnly,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (search.trim()) params.append('search', search.trim());
      if (selectedStage) params.append('stage', selectedStage);
      if (selectedStatus) params.append('status', selectedStatus);
      if (needsAttentionOnly) params.append('needs_attention', 'true');

      return apiClient<ApplicationListResponse>(`/api/applications?${params.toString()}`);
    },
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStage('');
    setSelectedStatus('');
    setNeedsAttentionOnly(false);
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || selectedStage || selectedStatus || needsAttentionOnly);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-text tracking-tight">Applications</h1>
            {data && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted font-mono">
                {data.total} total
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            {user?.role === 'institution_user'
              ? `Manage regulatory approval submissions for ${user.institution_name || 'your institution'}.`
              : 'Regulatory oversight, dossier verification, and stage progression tracking.'}
          </p>
        </div>

        {/* Quick filter toggle for items requiring attention */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setNeedsAttentionOnly(!needsAttentionOnly);
              setPage(1);
            }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
              needsAttentionOnly
                ? 'bg-danger-soft text-danger border-danger/30'
                : 'bg-surface border-border text-text-muted hover:text-text hover:bg-surface-2'
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Needs Attention Only</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by application ID, institution, or program..."
              className="w-full h-9 pl-9 pr-4 rounded-md bg-surface-2 border border-border text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-text-muted hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Stage filter */}
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value);
                setPage(1);
              }}
              className="h-9 px-2.5 rounded-md bg-surface border border-border text-xs text-text focus:outline-none focus:ring-2 focus:ring-focus-ring"
            >
              <option value="">All Stages</option>
              <option value="stage-draft">Draft</option>
              <option value="stage-submitted">Submitted</option>
              <option value="stage-doc-check">Document check</option>
              <option value="stage-desk-review">Desk review</option>
              <option value="stage-clarification">Clarification</option>
              <option value="stage-committee">Committee review</option>
              <option value="stage-decision">Decision pending</option>
              <option value="stage-closed">Closed</option>
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 px-2.5 rounded-md bg-surface border border-border text-xs text-text focus:outline-none focus:ring-2 focus:ring-focus-ring"
            >
              <option value="">All Statuses</option>
              <option value="needs_attention">Needs attention</option>
              <option value="overdue">Overdue</option>
              <option value="in_progress">In progress</option>
              <option value="submitted">Submitted</option>
              <option value="awaiting_reply">Awaiting reply</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-text-muted hover:text-text h-9"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Applications Data Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-text-muted">Loading applications...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-danger mx-auto" />
            <div className="text-sm font-semibold text-text">Failed to load applications</div>
            <p className="text-xs text-text-muted">
              {error instanceof Error ? error.message : 'An error occurred while fetching applications.'}
            </p>
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : data && data.items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderOpen className="w-10 h-10 text-text-muted mx-auto opacity-40" />
            <div className="text-sm font-semibold text-text">No applications found</div>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No applications match your selected filters. Try clearing your search or status criteria.'
                : 'No applications have been registered in the system yet.'}
            </p>
            {hasActiveFilters && (
              <Button size="sm" variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-text-muted font-medium select-none">
                  <th scope="col" className="py-3 px-4 w-12 text-center">
                    #
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-4 cursor-pointer hover:text-text"
                    onClick={() => handleSort('ref')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Application ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Institution & Program
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-4 cursor-pointer hover:text-text"
                    onClick={() => handleSort('stage')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Stage</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-4 cursor-pointer hover:text-text"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-4 cursor-pointer hover:text-text"
                    onClick={() => handleSort('deadline')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Next Deadline</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Docs
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Assigned Owner
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.items.map((app: ApplicationListItem, index: number) => {
                  const isOverdue =
                    app.due_date && new Date(app.due_date).getTime() < Date.now();

                  return (
                    <tr
                      key={app.id}
                      onClick={() => navigate(`/applications/${app.id}`)}
                      className={cn(
                        'hover:bg-surface-2 transition-colors cursor-pointer group',
                        app.is_priority && 'bg-danger-soft/10'
                      )}
                    >
                      {/* Priority / Row indicator */}
                      <td className="py-3.5 px-4 text-center">
                        {app.is_priority ? (
                          <div
                            className="w-2 h-2 rounded-full bg-danger mx-auto"
                            title="Attention required / Overdue"
                          />
                        ) : (
                          <span className="text-text-muted font-mono text-[10px]">
                            {(page - 1) * pageSize + index + 1}
                          </span>
                        )}
                      </td>

                      {/* Application Reference ID */}
                      <td className="py-3.5 px-4 font-mono font-medium text-text group-hover:text-accent transition-colors">
                        {app.ref}
                      </td>

                      {/* Institution & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-text truncate max-w-[240px]">
                          {app.institution_name}
                        </div>
                        <div className="text-[11px] text-text-muted truncate max-w-[240px]">
                          {app.application_type} ({app.academic_year})
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-text">{app.stage_name}</span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <StatusBadge statusKey={app.status} />
                      </td>

                      {/* Next Deadline */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {app.due_date ? (
                          <div>
                            <div className={cn(isOverdue && 'text-danger font-medium')}>
                              {formatDateIST(app.due_date)}
                            </div>
                            <div className={cn('text-[10px]', isOverdue ? 'text-danger' : 'text-text-muted')}>
                              {formatRelativeDays(app.due_date)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>

                      {/* Documents Count */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 text-text-muted">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="font-mono">{app.document_count}</span>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4 text-text-muted">
                        {app.owner_name ? (
                          <span className="text-text">{app.owner_name}</span>
                        ) : (
                          <span className="italic text-text-muted">Unassigned</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/applications/${app.id}`);
                          }}
                          className="h-7 text-xs font-medium text-accent hover:text-accent group-hover:bg-accent-soft"
                        >
                          View Dossier
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-2/50 text-xs text-text-muted">
            <div>
              Showing <span className="font-mono font-medium text-text">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-mono font-medium text-text">
                {Math.min(page * pageSize, data.total)}
              </span>{' '}
              of <span className="font-mono font-medium text-text">{data.total}</span> applications
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <span className="font-mono text-xs text-text px-2">
                Page {page} of {data.total_pages}
              </span>

              <Button
                size="sm"
                variant="secondary"
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-2"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
