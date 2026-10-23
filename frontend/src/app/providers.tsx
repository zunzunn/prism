import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { applyTheme, getInitialTheme } from '@/lib/theme';
import { applyReduceMotion, getInitialReduceMotion } from '@/lib/motion';
import { AuthProvider } from '@/features/auth/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [reduceMotion] = useState<boolean>(getInitialReduceMotion);

  useEffect(() => {
    // Initialise theme and motion settings on mount
    const theme = getInitialTheme();
    applyTheme(theme);

    const reduce = getInitialReduceMotion();
    applyReduceMotion(reduce);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
          {children}
        </MotionConfig>
      </AuthProvider>
    </QueryClientProvider>
  );
};
