import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { LandingPage } from "@/pages/LandingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PlaceholderModulePage } from "@/pages/PlaceholderModulePage";
import {
  Users,
  Building2,
  SearchCheck,
  FileCheck2,
  ShieldAlert,
  Settings,
  Scale,
  BarChart2,
  FileText,
  BookOpen,
} from "lucide-react";

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
        element: (
          <PlaceholderModulePage
            title="Technical Institutions"
            subtitle="AICTE accredited colleges, autonomous institutions, and deemed engineering universities"
            icon={Building2}
            badge="3,824 Institutes"
          />
        ),
      },
      {
        path: "students",
        element: (
          <PlaceholderModulePage
            title="Student Records & APAAR Identity Registry"
            subtitle="National student registry database with automated APAAR ID mapping and credential ledger"
            icon={Users}
            badge="1.4M Records"
          />
        ),
      },
      {
        path: "validation",
        element: (
          <PlaceholderModulePage
            title="Validation Center"
            subtitle="High-throughput institutional CSV/JSON dataset validator with automated duplicate & anomaly checks"
            icon={FileCheck2}
          />
        ),
      },
      {
        path: "intake",
        element: (
          <PlaceholderModulePage
            title="Intake Monitoring & Sanctioned Capacity"
            subtitle="Real-time institutional admission tracking against approved AICTE quota caps"
            icon={Scale}
            badge="Capacity Oversight"
          />
        ),
      },
      {
        path: "verification",
        element: (
          <PlaceholderModulePage
            title="Academic Verification Engine"
            subtitle="Real-time verification of transcripts, marksheets, and degree certificates via cryptographic hash proofs"
            icon={SearchCheck}
            badge="AICTE Live"
          />
        ),
      },
      {
        path: "analytics",
        element: (
          <PlaceholderModulePage
            title="Analytics & Forecast"
            subtitle="Predictive admissions trends, graduation rates, and national capacity projections"
            icon={BarChart2}
          />
        ),
      },
      {
        path: "reports",
        element: (
          <PlaceholderModulePage
            title="Governance Reports"
            subtitle="Downloadable state-wise compliance reports, executive digests, and accreditation statistics"
            icon={FileText}
          />
        ),
      },
      {
        path: "compliance",
        element: (
          <PlaceholderModulePage
            title="AICTE Audit Logs"
            subtitle="Immutable audit trail of all verification queries, verifier credentials, and discrepancy flags"
            icon={ShieldAlert}
            badge="Audited"
          />
        ),
      },
      {
        path: "settings",
        element: (
          <PlaceholderModulePage
            title="Platform Settings & API Keys"
            subtitle="Manage AICTE node credentials, role-based access control, and webhooks"
            icon={Settings}
          />
        ),
      },
      {
        path: "demo-guide",
        element: (
          <PlaceholderModulePage
            title="Interactive Demonstration Guide"
            subtitle="Walkthrough of simulated AICTE governance workflows, test datasets, and verification endpoints"
            icon={BookOpen}
            badge="Demo v2.4"
          />
        ),
      },
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
