export interface ApiErrorResponse {
  code: string;
  message: string;
  request_id?: string;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
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

    throw new ApiError(
      response.status,
      errorData.message || `Request failed with status ${response.status}`,
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
