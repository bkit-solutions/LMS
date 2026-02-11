import axios from "axios";
import type { ApiResponse } from "./authApi";
import type {
  CourseResponse,
  CourseDetailResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
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
};
