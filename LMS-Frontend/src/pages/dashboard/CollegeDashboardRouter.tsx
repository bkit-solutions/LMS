import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import CollegeRouteGuard from "../../components/common/CollegeRouteGuard";

// Admin/Faculty Components
import EnhancedAdminDashboard from "./admin/EnhancedAdminDashboard";
import FacultyManagementPage from "./admin/users/FacultyManagementPage";
import StudentManagementPage from "./admin/users/StudentManagementPage";
import CourseManagementPage from "./admin/courses/CourseManagementPage";
import TestList from "../../components/admin/tests/TestList";
import CreateTestPage from "./admin/tests/CreateTestPage";
import TestDetailPage from "./admin/tests/TestDetailPage";
import QuestionManagementPage from "./admin/tests/QuestionManagementPage";
import ResultsPage from "./admin/tests/ResultsPage";
import TopicList from "../../components/admin/topics/TopicList";
import CreateTopicPage from "./admin/topics/CreateTopicPage";
import TopicDetailPage from "./admin/topics/TopicDetailPage";
import ProctoringTestPage from "./admin/ProctoringTestPage";

// Student Components
import StudentDashboard from "./student/StudentDashboard";
import TakeTest from "./student/TakeTestPage";
import ImprovedPreTestInstructions from "./student/ImprovedPreTestInstructions";
import TopicListPage from "./student/TopicListPage";
import TopicViewerPage from "./student/TopicViewerPage";
import StudentCoursesPage from "./student/StudentCoursesPage";
import StudentCertificatesPage from "./student/StudentCertificatesPage";

// Shared Components
import ProfilePage from "./ProfilePage";

/**
 * Router for college-specific routes: /:collegeCode/*
 * Handles ADMIN, FACULTY, and USER (student) roles
 */
const CollegeDashboardRouter: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const userRole = user?.type;

  return (
    <CollegeRouteGuard>
      <Routes>
        {/* Dashboard Index - Role-based */}
        <Route
          index
          element={
            userRole === "ADMIN" || userRole === "FACULTY" ? (
              <EnhancedAdminDashboard />
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

        {/* Shared Routes - All college users */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Admin & Faculty Routes - User Management */}
        {(userRole === "ADMIN" || userRole === "FACULTY") && (
          <>
            <Route path="users/faculty" element={<FacultyManagementPage />} />
            <Route path="users/students" element={<StudentManagementPage />} />

            {/* Course Management */}
            <Route path="courses" element={<CourseManagementPage />} />

            {/* Test Management */}
            <Route path="tests" element={<TestList />} />
            <Route path="tests/create" element={<CreateTestPage />} />
            <Route path="tests/:id" element={<TestDetailPage />} />
            <Route path="tests/:id/questions" element={<QuestionManagementPage />} />
            <Route path="tests/:testId/results" element={<ResultsPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="proctoring-test" element={<ProctoringTestPage />} />

            {/* Topic Management */}
            <Route path="topics" element={<TopicList />} />
            <Route path="topics/create" element={<CreateTopicPage />} />
            <Route path="topics/:id" element={<TopicDetailPage />} />

            {/* Allow Faculty/Admin to view test instructions (preview) */}
            <Route path="tests/:testId/instructions" element={<ImprovedPreTestInstructions />} />
            <Route path="test/take/:testId" element={<TakeTest />} />
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
    </CollegeRouteGuard>
  );
};

export default CollegeDashboardRouter;
