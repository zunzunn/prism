import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { FoundationReadinessPage } from '@/features/foundation/FoundationReadinessPage';
import { PlaceholderPage } from '@/features/foundation/PlaceholderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <FoundationReadinessPage />,
      },
      {
        path: 'overview',
        element: (
          <PlaceholderPage
            title="Overview Dashboard"
            phaseScheduled="Phase 4"
            description="Role-adapted overview with attention queue, upcoming deadlines, and stage metrics."
          />
        ),
      },
      {
        path: 'applications',
        element: (
          <PlaceholderPage
            title="Applications & Dossier"
            phaseScheduled="Phase 2 & 3"
            description="Application list with filters and full dossier (Summary, Documents, Findings, Clarifications, History)."
          />
        ),
      },
      {
        path: 'requirements',
        element: (
          <PlaceholderPage
            title="Compliance Requirements"
            phaseScheduled="Phase 4"
            description="Configurable regulatory compliance checklist and requirements status tracking."
          />
        ),
      },
      {
        path: 'deadlines-alerts',
        element: (
          <PlaceholderPage
            title="Deadlines & Alerts"
            phaseScheduled="Phase 4"
            description="Priority-grouped alerts, approaching deadline markers, and timeline views."
          />
        ),
      },
      {
        path: 'analytics',
        element: (
          <PlaceholderPage
            title="Workload & Bottleneck Analytics"
            phaseScheduled="Phase 4"
            description="Officer workload distribution, stage duration metrics, and bottleneck insights."
          />
        ),
      },
      {
        path: 'activity-history',
        element: (
          <PlaceholderPage
            title="Global Activity History"
            phaseScheduled="Phase 3 & 4"
            description="Immutable audit trail of all regulatory actions, reviews, and decisions."
          />
        ),
      },
      {
        path: 'settings',
        element: (
          <PlaceholderPage
            title="Settings & Preferences"
            phaseScheduled="Phase 4"
            description="Theme selector, motion toggle, due-soon window configuration, and demo reset."
          />
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
