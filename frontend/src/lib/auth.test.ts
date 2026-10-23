import { describe, it, expect, beforeEach } from 'vitest';
import { getAuthToken, setAuthToken, removeAuthToken } from './api';

describe('Frontend Auth Token Management', () => {
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

    // Provide mock window and localStorage for Node testing environment
    globalThis.localStorage = mockStorage;
    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
    };
  });

  it('stores and retrieves authentication token', () => {
    expect(getAuthToken()).toBeNull();
    setAuthToken('test-signed-token-xyz');
    expect(getAuthToken()).toBe('test-signed-token-xyz');
  });

  it('removes authentication token on logout', () => {
    setAuthToken('test-signed-token-xyz');
    expect(getAuthToken()).toBe('test-signed-token-xyz');
    removeAuthToken();
    expect(getAuthToken()).toBeNull();
  });
});
