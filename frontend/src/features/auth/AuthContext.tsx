import React, { useEffect, useState } from 'react';
import { apiClient, getAuthToken, removeAuthToken, setAuthToken } from '@/lib/api';
import { User, UserRole } from '@/types';
import { AuthContext } from './context';

interface LoginResponse {
  token: string;
  user: User;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from token on mount
  useEffect(() => {
    async function restoreSession() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await apiClient<User>('/api/me');
        setUser(currentUser);
        setToken(storedToken);
      } catch (err) {
        console.warn('Session expired or invalid, clearing local session', err);
        removeAuthToken();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const loginAsRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await apiClient<LoginResponse>('/api/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Failed to log in as demo role', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient<{ message: string }>('/api/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      removeAuthToken();
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        loginAsRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
