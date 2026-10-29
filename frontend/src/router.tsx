import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { LandingPage } from "@/pages/LandingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { InstitutionsListPage } from "@/pages/InstitutionsListPage";
import { InstitutionDetailPage } from "@/pages/InstitutionDetailPage";
import { StudentsListPage } from "@/pages/StudentsListPage";
import { StudentDetailPage } from "@/pages/StudentDetailPage";
import { ValidationCenterPage } from "@/pages/ValidationCenterPage";
import { ValidationDetailPage } from "@/pages/ValidationDetailPage";
import { IntakeMonitoringPage } from "@/pages/IntakeMonitoringPage";
import { AnalyticsForecastPage } from "@/pages/AnalyticsForecastPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { VerificationPage } from "@/pages/VerificationPage";
import { VerifyReferencePage } from "@/pages/VerifyReferencePage";
import { StudentPortalPage } from "@/pages/StudentPortalPage";
import { AuditLogsPage } from "@/pages/AuditLogsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { DemoGuidePage } from "@/pages/DemoGuidePage";

export const router = createBrowserRouter([
  // Public Landing Page
  {
    path: "/",
    element: <LandingPage />,
  },

  // Authenticated/Internal Application Shell
  {
    element: <AppShell />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "institutions",
        element: <InstitutionsListPage />,
      },
      {
        path: "institutions/:id",
        element: <InstitutionDetailPage />,
      },
      {
        path: "students",
        element: <StudentsListPage />,
      },
      {
        path: "students/:id",
        element: <StudentDetailPage />,
      },
      {
        path: "validation",
        element: <ValidationCenterPage />,
      },
      {
        path: "validation/:id",
        element: <ValidationDetailPage />,
      },
      {
        path: "intake",
        element: <IntakeMonitoringPage />,
      },
      {
        path: "verification",
        element: <VerificationPage />,
      },
      {
        path: "verify/:reference",
        element: <VerifyReferencePage />,
      },
      {
        path: "student",
        element: <StudentPortalPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsForecastPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "compliance",
        element: <AuditLogsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "demo-guide",
        element: <DemoGuidePage />,
      },
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
