import axios from "axios";

export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  version: string;
  timestamp: string;
  database?: string;
}

export const getApiBaseUrl = (): string => {
  // 1. Explicit client environment override (Vite build/runtime)
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  // 2. Server/Function runtime environment (Vercel service binding injection: BACKEND_URL)
  if (typeof process !== "undefined") {
    if (process.env?.BACKEND_URL) {
      return process.env.BACKEND_URL.replace(/\/$/, "");
    }
    if (process.env?.VITE_API_BASE_URL) {
      return process.env.VITE_API_BASE_URL.replace(/\/$/, "");
    }
  }

  // 3. Browser environment on Vercel:
  // When deployed under Vercel multi-service rewrites (/api/(.*) -> backend),
  // use relative origin ("") so client-side queries route through the top-level rewrite.
  if (typeof window !== "undefined") {
    return "";
  }

  // 4. Local CLI / Node test script fallback
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error logging
    console.error("API error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const checkBackendHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>("/api/health");
  return response.data;
};
