import api from "./apiClient";
import type { ApiResponse } from "./authApi";
import type { CertificateResponse, CertificateVerifyResponse } from "../types";

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
