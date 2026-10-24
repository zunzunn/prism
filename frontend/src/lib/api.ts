export interface ApiErrorResponse {
  code: string;
  message: string;
  request_id?: string;
  detail?: string;
}

export class ApiError extends Error {
  code: string;
  requestId?: string;
  status: number;

  constructor(status: number, message: string, code: string = 'API_ERROR', requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

const AUTH_TOKEN_KEY = 'prism.auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getBaseApiUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (import.meta.env.PROD && !envUrl) {
    console.warn(
      '[PRISM] VITE_API_URL environment variable is not configured. ' +
      'Requests are defaulting to relative paths and may fail if backend is hosted on a separate domain.'
    );
  }
  return envUrl.replace(/\/+$/, '');
}

export function getApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  const base = getBaseApiUrl();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  if (!base) {
    return normalizedEndpoint;
  }
  
  return `${base}${normalizedEndpoint}`;
}

export function getAuthenticatedDocumentUrl(documentId: string): string {
  const url = getApiUrl(`/api/documents/${documentId}/file`);
  const token = getAuthToken();
  if (!token) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  
  const headers = new Headers(options.headers || {});
  
  // Attach JSON content-type if not form data
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Bearer token if available
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: Partial<ApiErrorResponse> = {};
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON response
    }

    const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`;
    throw new ApiError(
      response.status,
      message,
      errorData.code || 'UNKNOWN_ERROR',
      errorData.request_id
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
