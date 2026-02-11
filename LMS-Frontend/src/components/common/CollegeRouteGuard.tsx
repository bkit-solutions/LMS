import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";

interface CollegeRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Guards college-specific routes (/:collegeCode/*) 
 * Validates that the URL college code matches the user's assigned college
 */
const CollegeRouteGuard: React.FC<CollegeRouteGuardProps> = ({ children }) => {
  const { collegeCode } = useParams<{ collegeCode: string }>();
  const { user } = useAppSelector((state) => state.auth);

  // Only college-associated users (ADMIN, FACULTY, USER) can access college routes
  const isCollegeUser = user && ["ADMIN", "FACULTY", "USER"].includes(user.type);
  
  if (!isCollegeUser) {
    // System admins should use /dashboard, not /:collegeCode/dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Validate college code matches user's college
  const userCollegeCode = user.collegeCode;
  
  if (!userCollegeCode) {
    console.error("User has no college assigned:", user);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-text mb-2">No College Assigned</h2>
          <p className="text-text-secondary">
            Your account is not associated with any college. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  if (collegeCode?.toUpperCase() !== userCollegeCode.toUpperCase()) {
    // Redirect to correct college route
    const correctPath = window.location.pathname.replace(
      `/${collegeCode}`,
      `/${userCollegeCode}`
    );
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
};

export default CollegeRouteGuard;
