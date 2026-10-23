import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { UserRole } from '@/types';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-muted font-medium">Validating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-surface border border-border rounded-lg shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-danger-soft text-danger flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-text">Access Restricted</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Your active role (<span className="font-mono text-text">{user.role}</span>) does not have permission to view this section.
            </p>
            <div className="pt-2">
              <Button size="sm" variant="secondary" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
