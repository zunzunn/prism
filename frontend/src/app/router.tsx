import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layout/AppShell';
import { SignInPage } from '@/features/auth/SignInPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { ListPage } from '@/features/applications/ListPage';
import { DossierPage } from '@/features/applications/DossierPage';
import { FoundationReadinessPage } from '@/features/foundation/FoundationReadinessPage';
import { PlaceholderPage } from '@/features/foundation/PlaceholderPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/signin',
    element: <SignInPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <FoundationReadinessPage />,
      },
      {
        path: 'applications',
        element: <ListPage />,
      },
      {
        path: 'applications/:id',
        element: <DossierPage />,
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
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/applications" replace />,
      },
    ],
  },
]);
