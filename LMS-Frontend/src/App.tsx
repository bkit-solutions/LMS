import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  restoreSession,
  initRootAdminAsync,
  createSuperAdminAsync,
  createAdminAsync,
  createUserAsync,
  createFacultyAsync,
} from "./features/auth/authSlice";
import Layout from "./layouts/MainLayout";
import LoginForm from "./pages/auth/LoginPage";
import CollegeLoginPage from "./pages/auth/CollegeLoginPage";
import GenericUserForm from "./components/admin/users/UserForm";
import { UserCreationMode } from "./types";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import CollegeDashboardRouter from "./pages/dashboard/CollegeDashboardRouter";
import DashboardRedirect from "./components/common/DashboardRedirect";
import LandingPage from "./pages/public/LandingPage";
import NotFoundPage from "./pages/public/NotFoundPage";

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const userRole = useAppSelector((state) => state.auth.user?.type);

  // Restore session from localStorage on app mount
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Debug logging (remove in production)
  useEffect(() => {
    console.log("🔐 Auth State:", { isAuthenticated, user, userRole });
  }, [isAuthenticated, user, userRole]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<LandingPage />} />
          <Route
            path="login"
            element={
              !isAuthenticated ? (
                <LoginForm />
              ) : (
                <DashboardRedirect />
              )
            }
          />
          <Route
            path="login/:collegeCode"
            element={
              !isAuthenticated ? (
                <CollegeLoginPage />
              ) : (
                <DashboardRedirect />
              )
            }
          />
          <Route
            path="init-rootadmin"
            element={
              !isAuthenticated ? (
                <GenericUserForm
                  mode={UserCreationMode.INIT_ROOT_ADMIN}
                  onSubmitAction={initRootAdminAsync}
                  title="Initialize Root Admin"
                  description="Create the root administrator account"
                  successMessage="Root Admin created successfully. Please login."
                  redirectPath="/login"
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Protected Routes - System Admins (ROOTADMIN/SUPERADMIN) */}
          <Route
            path="dashboard/*"
            element={
              isAuthenticated && (userRole === "ROOTADMIN" || userRole === "SUPERADMIN") ? (
                <DashboardRouter />
              ) : isAuthenticated ? (
                <DashboardRedirect />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Protected Routes - College Users (ADMIN/FACULTY/USER) */}
          <Route
            path=":collegeCode/dashboard/*"
            element={
              isAuthenticated ? (
                <CollegeDashboardRouter />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* RootAdmin Routes */}
          <Route
            path="create-superadmin"
            element={
              isAuthenticated && userRole === "ROOTADMIN" ? (
                <GenericUserForm
                  mode={UserCreationMode.CREATE_SUPER_ADMIN}
                  onSubmitAction={createSuperAdminAsync}
                  title="Create Super Admin"
                  description="Add a new super administrator to the system"
                  successMessage="Super Admin created successfully."
                  redirectPath="/dashboard"
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* SuperAdmin/RootAdmin Routes */}
          <Route
            path="create-admin"
            element={
              isAuthenticated &&
              (userRole === "ROOTADMIN" || userRole === "SUPERADMIN") ? (
                <GenericUserForm
                  mode={UserCreationMode.CREATE_ADMIN}
                  onSubmitAction={createAdminAsync}
                  title="Create Admin"
                  description="Add a new administrator to the system"
                  successMessage="Admin created successfully."
                  redirectPath="/dashboard"
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Helper Routes */}
          <Route
            path="create-faculty"
            element={
              isAuthenticated &&
              (userRole === "SUPERADMIN" || userRole === "ADMIN") ? (
                <GenericUserForm
                  mode={UserCreationMode.CREATE_FACULTY}
                  onSubmitAction={createFacultyAsync}
                  title="Create Faculty"
                  description="Add a new faculty member to the system"
                  successMessage="Faculty created successfully."
                  redirectPath="/dashboard"
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route
            path="create-user"
            element={
              isAuthenticated &&
              (userRole === "ROOTADMIN" ||
                userRole === "SUPERADMIN" ||
                userRole === "ADMIN") ? (
                <GenericUserForm
                  mode={UserCreationMode.CREATE_USER}
                  onSubmitAction={createUserAsync}
                  title="Create User"
                  description="Add a new user to the system"
                  successMessage="User created successfully."
                  redirectPath="/dashboard"
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Default Route - 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
