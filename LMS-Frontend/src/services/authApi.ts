import axios from "axios";

// Base URL from environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ===============================
// API Response Types
// ===============================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// ===============================
// Authentication DTOs
// ===============================

export interface InitRootAdminRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  collegeCode?: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ===============================
// User Management DTOs
// ===============================

export interface CreateSuperAdminRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  collegeId?: number;
  phoneNumber?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phoneNumber?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
  collegeId?: number;
}

// ===============================
// User Response Types
// ===============================

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  type: "ROOTADMIN" | "SUPERADMIN" | "ADMIN" | "FACULTY" | "USER";
  phoneNumber?: string;
  profilePictureUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  collegeId?: number;
  collegeName?: string;
  collegeCode?: string;
  createdById?: number;
  createdByName?: string;
  createdByEmail?: string;
}

export interface UserStats {
  totalUsers: number;
  rootAdmins: number;
  superAdmins: number;
  admins: number;
  faculty: number;
  students: number;
  activeUsers: number;
  inactiveUsers: number;
}

// ===============================
// College DTOs
// ===============================

export interface CreateCollegeRequest {
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateCollegeRequest {
  name?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CollegeResponse {
  id: number;
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  domain?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  onboardedAt?: string;
  onboardedById?: number;
  onboardedByName?: string;
  totalUsers?: number;
  totalCourses?: number;
}

// ===============================
// Axios Configuration
// ===============================

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Could dispatch a logout action here if using Redux
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===============================
// Authentication API
// ===============================

export const authApi = {
  // Initialize root admin (first setup only)
  initRootAdmin: async (
    data: InitRootAdminRequest
  ): Promise<ApiResponse<void>> => {
    const response = await api.post("/api/auth/init-root-admin", data);
    return response.data;
  },

  // User login
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },

  // Get current user info
  getCurrentUser: async (): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get("/api/users/me");
    return response.data;
  },

  // Change password
  changePassword: async (
    data: ChangePasswordRequest
  ): Promise<ApiResponse<void>> => {
    const response = await api.patch("/api/user-management/change-password", data);
    return response.data;
  },
};

// ===============================
// User Management API
// ===============================

export const userManagementApi = {
  // Create users (role-based)
  createSuperAdmin: async (
    data: CreateSuperAdminRequest
  ): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post("/api/user-management/super-admin", data);
    return response.data;
  },

  createAdmin: async (
    data: CreateUserRequest
  ): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post("/api/user-management/admin", data);
    return response.data;
  },

  createFaculty: async (
    data: CreateUserRequest
  ): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post("/api/user-management/faculty", data);
    return response.data;
  },

  createStudent: async (
    data: CreateUserRequest
  ): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post("/api/user-management/student", data);
    return response.data;
  },

  // Generic create user (calls auth endpoint)
  createUser: async (
    data: CreateUserRequest
  ): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post("/api/auth/create-user", data);
    return response.data;
  },

  // Update user
  updateUser: async (
    userId: number,
    data: UpdateUserRequest
  ): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put(`/api/user-management/${userId}`, data);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (
    userId: number
  ): Promise<ApiResponse<UserResponse>> => {
    const response = await api.patch(`/api/user-management/${userId}/toggle-status`);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/user-management/${userId}`);
    return response.data;
  },

  // Get manageable users (based on role)
  getManageableUsers: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get("/api/user-management/manageable-users");
    return response.data;
  },

  // Get college users
  getCollegeUsers: async (
    collegeId: number
  ): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get(`/api/user-management/college/${collegeId}/users`);
    return response.data;
  },
};

// ===============================
// User Query API
// ===============================

export const userApi = {
  // Get all users (role-based filtering)
  getAllUsers: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get("/api/users/all");
    return response.data;
  },

  // Get specific user types
  getSuperAdmins: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get("/api/users/super-admins");
    return response.data;
  },

  getAdmins: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get("/api/users/admins");
    return response.data;
  },

  getFaculty: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get("/api/users/faculty");
    return response.data;
  },

  getStudents: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get("/api/users/students");
    return response.data;
  },

  // Get users by college
  getUsersByCollege: async (
    collegeId: number
  ): Promise<ApiResponse<UserResponse[]>> => {
    const response = await api.get(`/api/users/college/${collegeId}`);
    return response.data;
  },

  // Get user statistics
  getUserStats: async (): Promise<ApiResponse<UserStats>> => {
    const response = await api.get("/api/users/stats");
    return response.data;
  },

  // Convenience methods that delegate to userManagementApi
  createAdmin: async (data: CreateUserRequest): Promise<ApiResponse<UserResponse>> => {
    return userManagementApi.createAdmin(data);
  },

  toggleUserStatus: async (userId: number): Promise<ApiResponse<UserResponse>> => {
    return userManagementApi.toggleUserStatus(userId);
  },

  deleteUser: async (userId: number): Promise<ApiResponse<void>> => {
    return userManagementApi.deleteUser(userId);
  },
};

// ===============================
// College Management API
// ===============================

export const collegeApi = {
  // Get colleges (role-based)
  getAllColleges: async (): Promise<ApiResponse<CollegeResponse[]>> => {
    const response = await api.get("/api/colleges");
    return response.data;
  },

  // Get active colleges (public)
  getActiveColleges: async (): Promise<ApiResponse<CollegeResponse[]>> => {
    const response = await api.get("/api/colleges/active");
    return response.data;
  },

  // Get college by ID
  getCollegeById: async (id: number): Promise<ApiResponse<CollegeResponse>> => {
    const response = await api.get(`/api/colleges/${id}`);
    return response.data;
  },

  // Create college (Super Admin only)
  createCollege: async (
    data: CreateCollegeRequest
  ): Promise<ApiResponse<CollegeResponse>> => {
    const response = await api.post("/api/colleges", data);
    return response.data;
  },

  // Update college
  updateCollege: async (
    id: number,
    data: UpdateCollegeRequest
  ): Promise<ApiResponse<CollegeResponse>> => {
    const response = await api.patch(`/api/colleges/${id}`, data);
    return response.data;
  },

  // Toggle college status
  toggleCollegeStatus: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/api/colleges/${id}/toggle-status`);
    return response.data;
  },
};

// ===============================
// Development/Admin Tools API
// ===============================

export const adminApi = {
  // Initialize all dummy data
  initializeData: async (): Promise<ApiResponse<string>> => {
    const response = await api.post("/api/admin/data/initialize");
    return response.data;
  },

  // Reset all data (clear and reinitialize)
  resetData: async (): Promise<ApiResponse<string>> => {
    const response = await api.post("/api/admin/data/reset");
    return response.data;
  },

  // Clear all data
  clearData: async (): Promise<ApiResponse<string>> => {
    const response = await api.delete("/api/admin/data/clear");
    return response.data;
  },
};

// ===============================
// Utility Functions
// ===============================

export const authUtils = {
  // Save login data
  saveLoginData: (token: string, user: UserResponse) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Get saved user data
  getSavedUser: (): UserResponse | null => {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get user role permissions
  getUserPermissions: (userType: string) => {
    const permissions = {
      ROOTADMIN: {
        canManageSuperAdmins: true,
        canManageAdmins: true,
        canManageColleges: true,
        canViewAllUsers: true,
        canDeleteUsers: true,
      },
      SUPERADMIN: {
        canManageSuperAdmins: false,
        canManageAdmins: true,
        canManageColleges: true,
        canViewAllUsers: true,
        canDeleteUsers: true,
      },
      ADMIN: {
        canManageSuperAdmins: false,
        canManageAdmins: false,
        canManageColleges: false,
        canViewAllUsers: false,
        canDeleteUsers: false,
        canManageFaculty: true,
        canManageStudents: true,
      },
      FACULTY: {
        canManageSuperAdmins: false,
        canManageAdmins: false,
        canManageColleges: false,
        canViewAllUsers: false,
        canDeleteUsers: false,
        canManageFaculty: false,
        canManageStudents: true,
      },
      USER: {
        canManageSuperAdmins: false,
        canManageAdmins: false,
        canManageColleges: false,
        canViewAllUsers: false,
        canDeleteUsers: false,
        canManageFaculty: false,
        canManageStudents: false,
      },
    };

    return permissions[userType as keyof typeof permissions] || permissions.USER;
  },
};

export default api;
