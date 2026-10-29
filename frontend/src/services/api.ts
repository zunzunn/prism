import axios from "axios";

export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  version: string;
  timestamp: string;
  database?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
