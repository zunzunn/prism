import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, Shield, UserCheck, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from './useAuth';
import { ThemeMenu } from '@/app/layout/ThemeMenu';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface RoleOption {
  role: UserRole;
  title: string;
  badge: string;
  persona: string;
  organization: string;
  description: string;
  icon: React.ElementType;
}

const DEMO_ROLES: RoleOption[] = [
  {
    role: 'institution_user',
    title: 'Institution User',
    badge: 'Applicant',
    persona: 'Dr. Ramesh Gupta',
    organization: 'Apex Institute of Technology',
    description: 'Submit institutional applications, upload compliance evidence, and manage clarification queries.',
    icon: Building2,
  },
  {
    role: 'officer',
    title: 'Regulatory Officer',
    badge: 'Reviewer',
    persona: 'Priya Sharma',
    organization: 'Regulatory Review Bureau',
    description: 'Inspect dossiers, review submitted documents, advance stage approvals, and manage regulatory findings.',
    icon: UserCheck,
  },
  {
    role: 'admin',
    title: 'System Administrator',
    badge: 'Full Access',
    persona: 'Vikramaditya Nair',
    organization: 'PRISM System Administration',
    description: 'Global regulatory visibility across all institutions, applications, user governance, and audit trails.',
    icon: Shield,
  },
];

const DISABLED_ROLES = [
  {
    title: 'Committee Reviewer',
    description: 'Panel evaluation & inspection reporting (concept prototype; disabled in demo).',
  },
  {
    title: 'Compliance Auditor',
    description: 'External regulatory audit & governance oversight (concept prototype; disabled in demo).',
  },
];

export const SignInPage: React.FC = () => {
  const { loginAsRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/applications';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleRoleSelect = async (role: UserRole) => {
    setError(null);
    setLoadingRole(role);
    try {
      await loginAsRole(role);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-bg relative selection:bg-accent-soft selection:text-accent">
      {/* Top right theme switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeMenu />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[460px] bg-surface border border-border rounded-lg shadow-md overflow-hidden relative"
      >
        {/* 2px Signature Prism Gradient Top Edge */}
        <div className="h-[2px] w-full prism-gradient-bg" />

        <div className="p-6 sm:p-7">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center mb-3 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] prism-gradient-bg" />
              <span className="text-xl font-bold text-accent">Δ</span>
            </div>
            <h1 className="text-lg font-semibold text-text tracking-tight">Sign in to PRISM</h1>
            <p className="text-xs text-text-muted mt-1">
              Proactive Regulatory Intelligence & Status Monitoring (Demo)
            </p>
          </div>

          {/* Persistent Demo Disclaimer Banner */}
          <div className="bg-surface-2 border border-border rounded-md p-3 mb-5 text-[11px] text-text-muted leading-relaxed">
            <div className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text">Demo Environment:</span> All data is fictional sample data. Select a designated demo role below to authenticate instantly without credentials.
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-danger-soft border border-danger/20 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Active Demo Role Cards */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold tracking-wider text-text-muted uppercase px-1">
              Select Demo Identity
            </div>

            {DEMO_ROLES.map((item) => {
              const Icon = item.icon;
              const isLoading = loadingRole === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  disabled={loadingRole !== null}
                  onClick={() => handleRoleSelect(item.role)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-lg border border-border bg-surface hover:bg-surface-2 transition-all duration-150',
                    'hover:border-accent hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
                    'disabled:opacity-60 disabled:pointer-events-none group'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-accent-soft text-accent flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text group-hover:text-accent transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-border text-text-muted font-medium">
                            {item.badge}
                          </span>
                        </div>
                        <div className="text-[11px] font-medium text-text">
                          {item.persona}
                        </div>
                        <div className="text-[10px] text-text-muted truncate">
                          {item.organization}
                        </div>
                        <p className="text-[11px] text-text-muted mt-1 leading-snug line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 mt-1">
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Inactive Concept Roles */}
            <div className="pt-2 space-y-2">
              <div className="text-[10px] font-semibold tracking-wider text-text-muted uppercase px-1">
                Concept Roles (Not Enabled)
              </div>
              {DISABLED_ROLES.map((role) => (
                <div
                  key={role.title}
                  className="p-2.5 rounded-md border border-dashed border-border/70 bg-surface/50 opacity-60 text-xs select-none"
                >
                  <div className="font-medium text-[11px] text-text-muted">{role.title}</div>
                  <div className="text-[10px] text-text-muted">{role.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
