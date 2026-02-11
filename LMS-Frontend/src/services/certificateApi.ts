import axios from "axios";
import type { ApiResponse } from "./authApi";
import type { CertificateResponse, CertificateVerifyResponse } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const certificateApi = {
  // Issue certificate for a completed course
  issueCertificate: async (courseId: number): Promise<ApiResponse<CertificateResponse>> => {
    const response = await api.post(`/api/certificates/courses/${courseId}`);
    return response.data;
  },

  // Get my certificates
  getMyCertificates: async (): Promise<ApiResponse<CertificateResponse[]>> => {
    const response = await api.get("/api/certificates/mine");
    return response.data;
  },

  // Verify certificate (public)
  verifyCertificate: async (uid: string): Promise<ApiResponse<CertificateVerifyResponse>> => {
    const response = await api.get(`/api/certificates/verify/${uid}`);
    return response.data;
  },
};
