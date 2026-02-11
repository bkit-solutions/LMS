import axios from "axios";
import type { ApiResponse } from "./authApi";
import type {
  College,
  CreateCollegeRequest,
  UpdateCollegeRequest,
  CollegeBranding,
} from "../types";

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

export const collegeApi = {
  // Get all colleges (SuperAdmin/RootAdmin)
  getAllColleges: async (): Promise<ApiResponse<College[]>> => {
    const response = await api.get("/api/colleges");
    return response.data;
  },

  // Get active colleges (public)
  getActiveColleges: async (): Promise<ApiResponse<College[]>> => {
    const response = await api.get("/api/colleges/active");
    return response.data;
  },

  // Get college by ID
  getCollege: async (id: number): Promise<ApiResponse<College>> => {
    const response = await api.get(`/api/colleges/${id}`);
    return response.data;
  },

  // Create college (SuperAdmin)
  createCollege: async (data: CreateCollegeRequest): Promise<ApiResponse<College>> => {
    const response = await api.post("/api/colleges", data);
    return response.data;
  },

  // Update college
  updateCollege: async (id: number, data: UpdateCollegeRequest): Promise<ApiResponse<College>> => {
    const response = await api.patch(`/api/colleges/${id}`, data);
    return response.data;
  },

  // Toggle college active status
  toggleCollegeStatus: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/api/colleges/${id}/toggle-status`);
    return response.data;
  },

  // Get college branding by code (public)
  getCollegeBranding: async (code: string): Promise<ApiResponse<CollegeBranding>> => {
    const response = await api.get(`/api/auth/public/college-branding/${code}`);
    return response.data;
  },

  // Upload college logo
  uploadLogo: async (file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/colleges/upload-logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Upload college banner
  uploadBanner: async (file: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/colleges/upload-banner", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Get college statistics
  getCollegeStatistics: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/colleges/${id}/statistics`);
    return response.data;
  },
};
