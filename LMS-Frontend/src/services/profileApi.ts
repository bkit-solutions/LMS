import api from "./apiClient";
import type { ApiResponse } from "./authApi";
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from "../types";

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