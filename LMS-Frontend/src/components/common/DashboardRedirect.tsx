import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";

/**
 * Redirects authenticated users to their role-appropriate dashboard
 * - ROOTADMIN/SUPERADMIN → /dashboard
 * - ADMIN/FACULTY/USER → /:collegeCode/dashboard
 */
const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    console.log("🔀 DashboardRedirect - user:", user?.type, "college:", user?.collegeCode);
  }, [user]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // System admins use /dashboard
  if (user.type === "ROOTADMIN" || user.type === "SUPERADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // College users use /:collegeCode/dashboard
  if (user.collegeCode) {
    return <Navigate to={`/${user.collegeCode}/dashboard`} replace />;
  }

  // Fallback - user has no college assigned
  console.error("User has no college code:", user);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-text mb-2">Setup Required</h2>
        <p className="text-text-secondary mb-4">
          Your account needs to be assigned to a college. Please contact your administrator.
        </p>
        <a
          href="/login"
          className="text-primary hover:text-secondary underline"
        >
          Back to Login
        </a>
      </div>
    </div>
  );
};

export default DashboardRedirect;
