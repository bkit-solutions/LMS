import api from "./apiClient";
import type { ApiResponse } from "./authApi";
import type { EnrollmentResponse, ProgressResponse, EnrollmentStatsResponse } from "../types";

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

  // --- Admin Enrollment Management ---

  // Admin: enroll a student into a course
  adminEnrollStudent: async (courseId: number, studentId: number): Promise<ApiResponse<EnrollmentResponse>> => {
    const response = await api.post(`/api/enrollments/admin/courses/${courseId}/students/${studentId}`);
    return response.data;
  },

  // Admin: bulk enroll students
  adminBulkEnroll: async (courseId: number, studentIds: number[]): Promise<ApiResponse<EnrollmentResponse[]>> => {
    const response = await api.post(`/api/enrollments/admin/courses/${courseId}/bulk-enroll`, { studentIds });
    return response.data;
  },

  // Admin: unenroll a student
  adminUnenrollStudent: async (courseId: number, studentId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/enrollments/admin/courses/${courseId}/students/${studentId}`);
    return response.data;
  },

  // Admin: update enrollment status
  adminUpdateStatus: async (enrollmentId: number, status: string): Promise<ApiResponse<EnrollmentResponse>> => {
    const response = await api.patch(`/api/enrollments/admin/${enrollmentId}/status`, { status });
    return response.data;
  },

  // Admin: get enrollment statistics by college
  getEnrollmentStats: async (collegeId: number): Promise<ApiResponse<EnrollmentStatsResponse>> => {
    const response = await api.get(`/api/enrollments/admin/college/${collegeId}/stats`);
    return response.data;
  },
};
