import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getBaseApiUrl, getApiUrl, getAuthenticatedDocumentUrl, setAuthToken, removeAuthToken } from './api';

describe('API URL Resolution and Document Link Configuration', () => {
  const originalEnv = { ...import.meta.env };
  const store: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    const mockStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      length: Object.keys(store).length,
      key: (i: number) => Object.keys(store)[i] ?? null,
    } as Storage;

    globalThis.localStorage = mockStorage;
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
    };
    removeAuthToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Reset env
    (import.meta.env as Record<string, unknown>).VITE_API_URL = originalEnv.VITE_API_URL;
  });

  describe('getBaseApiUrl', () => {
    it('returns empty string when VITE_API_URL is unset', () => {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = '';
      expect(getBaseApiUrl()).toBe('');
    });

    it('strips trailing slashes from configured backend URL', () => {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = 'https://prism-api.onrender.com///';
      expect(getBaseApiUrl()).toBe('https://prism-api.onrender.com');
    });

    it('preserves clean URL without trailing slash', () => {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = 'https://prism-api.onrender.com';
      expect(getBaseApiUrl()).toBe('https://prism-api.onrender.com');
    });
  });

  describe('getApiUrl', () => {
    it('constructs absolute URL when VITE_API_URL is configured', () => {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = 'https://prism-api.onrender.com';
      expect(getApiUrl('/api/health')).toBe('https://prism-api.onrender.com/api/health');
      // Handles missing leading slash in endpoint
      expect(getApiUrl('api/applications')).toBe('https://prism-api.onrender.com/api/applications');
    });

    it('avoids double slashes when both base and endpoint contain slashes', () => {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = 'https://prism-api.onrender.com/';
      expect(getApiUrl('/api/health')).toBe('https://prism-api.onrender.com/api/health');
    });

    it('returns relative path when VITE_API_URL is empty', () => {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = '';
      expect(getApiUrl('/api/health')).toBe('/api/health');
      expect(getApiUrl('api/health')).toBe('/api/health');
    });

    it('preserves already fully qualified http/https URLs', () => {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = 'https://prism-api.onrender.com';
      expect(getApiUrl('https://other-service.com/api/test')).toBe('https://other-service.com/api/test');
    });
  });

  describe('getAuthenticatedDocumentUrl', () => {
    it('returns file URL without query token when not authenticated', () => {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = 'https://prism-api.onrender.com';
      expect(getAuthenticatedDocumentUrl('doc-123')).toBe('https://prism-api.onrender.com/api/documents/doc-123/file');
    });

    it('attaches authenticated token as query parameter when logged in', () => {
      (import.meta.env as Record<string, unknown>).VITE_API_URL = 'https://prism-api.onrender.com';
      setAuthToken('mock-session-token-abc');
      expect(getAuthenticatedDocumentUrl('doc-123')).toBe(
        'https://prism-api.onrender.com/api/documents/doc-123/file?token=mock-session-token-abc'
      );
    });
  });
});
