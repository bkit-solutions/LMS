import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import RootDashboard from "./root/RootDashboard";
import SuperAdminDashboard from "./super-admin/SuperAdminDashboard";
import AdminRouter from "./admin/AdminRouter";
import StudentDashboard from "./student/StudentDashboard";
import TakeTest from "./student/TakeTestPage";
import ImprovedPreTestInstructions from "./student/ImprovedPreTestInstructions";
import ProfilePage from "./ProfilePage";
import TopicListPage from "./student/TopicListPage";
import TopicViewerPage from "./student/TopicViewerPage";
import EnhancedCollegeManagement from "./super-admin/EnhancedCollegeManagement";
import AdminManagement from "./super-admin/AdminManagement";
import StudentCoursesPage from "./student/StudentCoursesPage";
import StudentCertificatesPage from "./student/StudentCertificatesPage";
import TestList from "../../components/admin/tests/TestList";
import CourseManagementPage from "./admin/courses/CourseManagementPage";

const DashboardRouter: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const userRole = user?.type;

  if (userRole === "ADMIN" || userRole === "FACULTY") {
    return <AdminRouter />;
  }

  return (
    <Routes>
      <Route
        index
        element={
          userRole === "ROOTADMIN" ? (
            <RootDashboard />
          ) : userRole === "SUPERADMIN" ? (
            <SuperAdminDashboard />
          ) : userRole === "USER" ? (
            <StudentDashboard />
          ) : (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-text mb-2">Welcome</h2>
                <p className="text-text-secondary">
                  Please navigate using the menu.
                </p>
              </div>
            </div>
          )
        }
      />
      <Route path="profile" element={<ProfilePage />} />

      {/* SuperAdmin: College Management & Admin Management */}
      {userRole === "SUPERADMIN" && (
        <>
          <Route path="colleges" element={<EnhancedCollegeManagement />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="tests" element={<TestList />} />
          <Route path="courses" element={<CourseManagementPage />} />
        </>
      )}

      {/* Student Routes */}
      {userRole === "USER" && (
        <>
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="certificates" element={<StudentCertificatesPage />} />
          <Route path="topics" element={<TopicListPage />} />
          <Route path="topics/:topicId" element={<TopicViewerPage />} />
          <Route
            path="tests/:testId/instructions"
            element={<ImprovedPreTestInstructions />}
          />
          <Route path="test/take/:testId" element={<TakeTest />} />
        </>
      )}
    </Routes>
  );
};

export default DashboardRouter;
