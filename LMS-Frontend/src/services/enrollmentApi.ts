import axios from "axios";
import type { ApiResponse } from "./authApi";
import type { EnrollmentResponse, ProgressResponse } from "../types";

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

export const enrollmentApi = {
  // Enroll in a course
  enroll: async (courseId: number): Promise<ApiResponse<EnrollmentResponse>> => {
    const response = await api.post(`/api/enrollments/courses/${courseId}`);
    return response.data;
  },

  // Unenroll from a course
  unenroll: async (courseId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/enrollments/courses/${courseId}`);
    return response.data;
  },

  // Get my enrollments
  getMyEnrollments: async (): Promise<ApiResponse<EnrollmentResponse[]>> => {
    const response = await api.get("/api/enrollments/mine");
    return response.data;
  },

  // Get course enrollments (admin/faculty view)
  getCourseEnrollments: async (courseId: number): Promise<ApiResponse<EnrollmentResponse[]>> => {
    const response = await api.get(`/api/enrollments/courses/${courseId}`);
    return response.data;
  },

  // Get progress for a course
  getProgress: async (courseId: number): Promise<ApiResponse<ProgressResponse>> => {
    const response = await api.get(`/api/enrollments/courses/${courseId}/progress`);
    return response.data;
  },

  // Mark chapter as completed
  markChapterComplete: async (chapterId: number): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/progress/chapters/${chapterId}/complete`);
    return response.data;
  },

  // Update time spent on chapter
  updateTimeSpent: async (chapterId: number, seconds: number): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/progress/chapters/${chapterId}/time`, { seconds });
    return response.data;
  },

  // Get chapter completion status
  getChapterStatus: async (chapterId: number): Promise<ApiResponse<boolean>> => {
    const response = await api.get(`/api/progress/chapters/${chapterId}/status`);
    return response.data;
  },
};
