import React from "react";
import { GovernanceMetrics } from "@/types/governance";
import {
  GovernanceMetricCard,
  MetricCardConfig,
} from "./GovernanceMetricCard";
import {
  Building2,
  Users,
  CalendarCheck,
  CheckCircle,
  Clock,
  Copy,
  AlertOctagon,
  FileSearch,
} from "lucide-react";

interface GovernanceMetricsGridProps {
  metrics: GovernanceMetrics;
}

export const GovernanceMetricsGrid: React.FC<GovernanceMetricsGridProps> = ({
  metrics,
}) => {
  const cards: MetricCardConfig[] = [
    {
      id: "institutions",
      label: "Total Institutions",
      value: metrics.totalInstitutions,
      subtext: "AICTE approved technical campuses",
      icon: Building2,
      targetRoute: "/institutions",
      badge: "Accredited",
      statusVariant: "neutral",
    },
    {
      id: "students",
      label: "Total Student Records",
      value: metrics.totalStudentRecords,
      subtext: "APAAR registry mapped entries",
      icon: Users,
      targetRoute: "/students",
      badge: "Active",
      statusVariant: "neutral",
    },
    {
      id: "submitted_month",
      label: "Submitted This Month",
      value: metrics.submittedThisMonth,
      subtext: "Direct institutional bulk feeds",
      icon: CalendarCheck,
      targetRoute: "/validation",
      badge: "+12.4%",
      statusVariant: "positive",
    },
    {
      id: "pass_rate",
      label: "APAAR Validation Pass Rate",
      value: `${metrics.apaarValidationPassRate}%`,
      subtext: "National syntactic & ABC verified",
      icon: CheckCircle,
      targetRoute: "/validation",
      badge: "Healthy",
      statusVariant: "positive",
    },
    {
      id: "pending",
      label: "Pending Submissions",
      value: metrics.pendingSubmissions,
      subtext: "Awaiting nodal officer signing",
      icon: Clock,
      targetRoute: "/validation",
      badge: "In Queue",
      statusVariant: "neutral",
    },
    {
      id: "duplicate",
      label: "Potential Duplicate Enrolments",
      value: metrics.potentialDuplicateEnrolments,
      subtext: "Cross-institutional overlap flags",
      icon: Copy,
      targetRoute: "/compliance",
      badge: "Action Req",
      statusVariant: "danger",
    },
    {
      id: "intake_alerts",
      label: "Intake Compliance Alerts",
      value: metrics.intakeComplianceAlerts,
      subtext: "Sanctioned threshold reviews",
      icon: AlertOctagon,
      targetRoute: "/intake",
      badge: "Warning",
      statusVariant: "warning",
    },
    {
      id: "requiring_review",
      label: "Records Requiring Review",
      value: metrics.recordsRequiringReview,
      subtext: "Awaiting discrepancy resolution",
      icon: FileSearch,
      targetRoute: "/students",
      badge: "Review",
      statusVariant: "warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-4">
      {cards.map((card) => (
        <GovernanceMetricCard key={card.id} card={card} />
      ))}
    </div>
  );
};
