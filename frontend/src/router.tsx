import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/layouts/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { PlaceholderModulePage } from "@/pages/PlaceholderModulePage";
import {
  Users,
  Building2,
  SearchCheck,
  FileCheck2,
  ShieldAlert,
  Database,
  Settings,
} from "lucide-react";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "students",
        element: (
          <PlaceholderModulePage
            title="Student Registry & APAAR Records"
            subtitle="National student registry database with automated APAAR ID mapping and credential ledger"
            icon={Users}
            badge="142k Records"
          />
        ),
      },
      {
        path: "institutions",
        element: (
          <PlaceholderModulePage
            title="Technical Institutions"
            subtitle="AICTE accredited colleges, autonomous institutions, and deemed engineering universities"
            icon={Building2}
            badge="3,820 Institutes"
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
        path: "validation",
        element: (
          <PlaceholderModulePage
            title="Batch Validation Pipeline"
            subtitle="High-throughput institutional CSV/JSON dataset validator with automated duplicate & anomaly checks"
            icon={FileCheck2}
          />
        ),
      },
      {
        path: "compliance",
        element: (
          <PlaceholderModulePage
            title="AICTE Compliance & Audit Logs"
            subtitle="Immutable audit trail of all verification queries, verifier credentials, and discrepancy flags"
            icon={ShieldAlert}
            badge="Audited"
          />
        ),
      },
      {
        path: "pipelines",
        element: (
          <PlaceholderModulePage
            title="Data Pipelines & Sync Nodes"
            subtitle="Sync status with state technical boards, Digilocker, and ABC (Academic Bank of Credits)"
            icon={Database}
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
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
