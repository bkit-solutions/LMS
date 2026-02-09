import axios from "axios";
import type { ApiResponse } from "./authApi";
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "../types";

// Axios instance (reuse from authApi)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Profile API calls
export const profileApi = {
  // Get user profile
  getUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get("/api/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    const response = await api.put("/api/profile", data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    const response = await api.put("/api/profile/password", data);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (imageUrl: string): Promise<ApiResponse<{ profilePictureUrl: string }>> => {
    const response = await api.put("/api/profile/picture", { profilePictureUrl: imageUrl });
    return response.data;
  },
};