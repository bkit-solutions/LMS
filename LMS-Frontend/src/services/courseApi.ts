import api from "./apiClient";
import type { ApiResponse } from "./authApi";
import type {
  CourseResponse,
  CourseDetailResponse,
  CourseStatsResponse,
  DashboardStatsResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "../types";

export const courseApi = {
  // Get my courses (Admin/Faculty)
  getMyCourses: async (): Promise<ApiResponse<CourseResponse[]>> => {
    const response = await api.get("/api/courses/mine");
    return response.data;
  },

  // Get published courses (student view)
  getPublishedCourses: async (): Promise<ApiResponse<CourseResponse[]>> => {
    const response = await api.get("/api/courses/published");
    return response.data;
  },

  // Get course detail
  getCourseDetail: async (id: number): Promise<ApiResponse<CourseDetailResponse>> => {
    const response = await api.get(`/api/courses/${id}`);
    return response.data;
  },

  // Create course
  createCourse: async (data: CreateCourseRequest): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.post("/api/courses", data);
    return response.data;
  },

  // Update course
  updateCourse: async (id: number, data: UpdateCourseRequest): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.patch(`/api/courses/${id}`, data);
    return response.data;
  },

  // Delete course
  deleteCourse: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/courses/${id}`);
    return response.data;
  },

  // Publish course
  publishCourse: async (id: number): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.patch(`/api/courses/${id}/publish`);
    return response.data;
  },

  // Unpublish course
  unpublishCourse: async (id: number): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.patch(`/api/courses/${id}/unpublish`);
    return response.data;
  },

  // Toggle enrollment open/close
  toggleEnrollment: async (id: number, open: boolean): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.patch(`/api/courses/${id}/enrollment?open=${open}`);
    return response.data;
  },

  // Get courses by college (SuperAdmin)
  getCoursesByCollege: async (collegeId: number): Promise<ApiResponse<CourseResponse[]>> => {
    const response = await api.get(`/api/courses/college/${collegeId}`);
    return response.data;
  },

  // Search courses
  searchCourses: async (params: {
    keyword?: string;
    category?: string;
    difficultyLevel?: string;
  }): Promise<ApiResponse<CourseResponse[]>> => {
    const response = await api.get("/api/courses/search", { params });
    return response.data;
  },

  // Get course statistics
  getCourseStats: async (id: number): Promise<ApiResponse<CourseStatsResponse>> => {
    const response = await api.get(`/api/courses/${id}/stats`);
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<ApiResponse<DashboardStatsResponse>> => {
    const response = await api.get("/api/courses/dashboard-stats");
    return response.data;
  },

  // Clone course
  cloneCourse: async (id: number): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.post(`/api/courses/${id}/clone`);
    return response.data;
  },

  // Add existing topic to course
  addTopicToCourse: async (courseId: number, topicId: number): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.post(`/api/courses/${courseId}/topics/${topicId}`);
    return response.data;
  },

  // Remove topic from course
  removeTopicFromCourse: async (courseId: number, topicId: number): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.delete(`/api/courses/${courseId}/topics/${topicId}`);
    return response.data;
  },

  // Reorder topics in course
  reorderTopics: async (courseId: number, topicIds: number[]): Promise<ApiResponse<CourseResponse>> => {
    const response = await api.put(`/api/courses/${courseId}/topics/reorder`, topicIds);
    return response.data;
  },
};
