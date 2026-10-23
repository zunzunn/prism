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

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
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
