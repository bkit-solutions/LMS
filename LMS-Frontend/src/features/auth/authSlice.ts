import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  authApi,
  userManagementApi,
  authUtils,
  type LoginRequest,
  type InitRootAdminRequest,
  type CreateSuperAdminRequest,
  type CreateUserRequest,
  type UserResponse,
} from "../../services/authApi";

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Initialize state from localStorage
const token = localStorage.getItem("token");
const savedUser = authUtils.getSavedUser();

const initialState: AuthState = {
  user: savedUser,
  token: token,
  isAuthenticated: authUtils.isAuthenticated(),
  loading: false,
  error: null,
  initialized: !!savedUser,
};

// ===============================
// Async Thunks
// ===============================

// Helper to normalize user response (handles nested college object)
const normalizeUserResponse = (user: any): UserResponse => {
  // If college is nested object, flatten it to top-level properties
  if (user.college && !user.collegeId) {
    return {
      ...user,
      collegeId: user.college.id,
      collegeName: user.college.name,
      collegeCode: user.college.code,
    };
  }
  return user;
};

// Login user
export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      
      if (response.success && response.data) {
        const token = response.data.token;
        
        // Save token to localStorage immediately so interceptor can use it for getCurrentUser
        localStorage.setItem("token", token);
        
        // Get user info after login
        try {
          const userResponse = await authApi.getCurrentUser();
          
          if (userResponse.success && userResponse.data) {
            // Normalize user response (flatten nested college object)
            const normalizedUser = normalizeUserResponse(userResponse.data);
            console.log("🔐 Login - normalized user:", {
              type: normalizedUser.type,
              collegeId: normalizedUser.collegeId,
              collegeName: normalizedUser.collegeName,
              collegeCode: normalizedUser.collegeCode
            });
            
            // Save full login data (user + token)
            authUtils.saveLoginData(token, normalizedUser);
            
            return {
              token,
              user: normalizedUser,
            };
          } else {
            localStorage.removeItem("token"); // Cleanup on failure
            return rejectWithValue("Failed to fetch user information");
          }
        } catch (err) {
          localStorage.removeItem("token"); // Cleanup on failure
          throw err;
        }
      } else {
        return rejectWithValue(response.message || "Login failed");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
                    error.response?.data?.error || 
                    "Login failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

// Initialize root admin (first setup)
export const initRootAdminAsync = createAsyncThunk(
  "auth/initRootAdmin",
  async (data: InitRootAdminRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.initRootAdmin(data);
      
      if (response.success) {
        return response.message || "Root admin initialized successfully";
      } else {
        return rejectWithValue(response.message || "Failed to initialize root admin");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
                    "Failed to initialize root admin";
      return rejectWithValue(message);
    }
  }
);

// Get current user info (for refreshing user data)
export const getCurrentUserAsync = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      
      if (response.success && response.data) {
        // Normalize user response (flatten nested college object)
        const normalizedUser = normalizeUserResponse(response.data);
        console.log("🔐 GetUser - normalized user:", {
          type: normalizedUser.type,
          collegeId: normalizedUser.collegeId,
          collegeName: normalizedUser.collegeName,
          collegeCode: normalizedUser.collegeCode
        });

        // Update saved user data
        const token = localStorage.getItem("token");
        if (token) {
          authUtils.saveLoginData(token, normalizedUser);
        }
        
        return normalizedUser;
      } else {
        return rejectWithValue(response.message || "Failed to fetch user");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch user";
      return rejectWithValue(message);
    }
  }
);

// User Management Thunks
export const createSuperAdminAsync = createAsyncThunk(
  "auth/createSuperAdmin",
  async (data: CreateSuperAdminRequest, { rejectWithValue }) => {
    try {
      const response = await userManagementApi.createSuperAdmin(data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Failed to create Super Admin");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
                    "Failed to create Super Admin";
      return rejectWithValue(message);
    }
  }
);

export const createAdminAsync = createAsyncThunk(
  "auth/createAdmin", 
  async (data: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await userManagementApi.createAdmin(data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Failed to create Admin");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
                    "Failed to create Admin";
      return rejectWithValue(message);
    }
  }
);

export const createFacultyAsync = createAsyncThunk(
  "auth/createFaculty",
  async (data: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await userManagementApi.createFaculty(data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Failed to create Faculty");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
                    "Failed to create Faculty";
      return rejectWithValue(message);
    }
  }
);

export const createStudentAsync = createAsyncThunk(
  "auth/createStudent",
  async (data: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await userManagementApi.createStudent(data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Failed to create Student");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
                    "Failed to create Student";
      return rejectWithValue(message);
    }
  }
);

export const createUserAsync = createAsyncThunk(
  "auth/createUser",
  async (data: CreateUserRequest, { rejectWithValue }) => {
    try {
      const response = await userManagementApi.createUser(data);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Failed to create User");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
                    "Failed to create User";
      return rejectWithValue(message);
    }
  }
);

// ===============================
// Auth Slice
// ===============================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Logout action
    logout: (state) => {
      authUtils.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.initialized = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update user data (for profile updates)
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage
        const token = localStorage.getItem("token");
        if (token) {
          authUtils.saveLoginData(token, state.user!);
        }
      }
    },

    // Restore session from localStorage
    restoreSession: (state) => {
      const token = localStorage.getItem("token");
      const savedUser = authUtils.getSavedUser();
      
      if (token && savedUser && authUtils.isAuthenticated()) {
        state.user = savedUser;
        state.token = token;
        state.isAuthenticated = true;
        state.initialized = true;
      } else {
        // Clear invalid data
        authUtils.logout();
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initialized = false;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialized = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // Init Root Admin
    builder
      .addCase(initRootAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initRootAdminAsync.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(initRootAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Current User
    builder
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // If user fetch fails, probably token is invalid
        authUtils.logout();
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initialized = false;
      });

    // User Creation Actions
    const userCreationActions = [
      createSuperAdminAsync,
      createAdminAsync,
      createFacultyAsync,
      createStudentAsync
    ];

    userCreationActions.forEach((action) => {
      builder
        .addCase(action.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(action.fulfilled, (state) => {
          state.loading = false;
          state.error = null;
        })
        .addCase(action.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
    });
  },
});

export const { logout, clearError, updateUser, restoreSession } = authSlice.actions;

// ===============================
// Selectors
// ===============================

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.type;
export const selectUserPermissions = (state: { auth: AuthState }) => {
  const userType = state.auth.user?.type;
  return userType ? authUtils.getUserPermissions(userType) : null;
};
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
