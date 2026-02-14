import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import CollegeRouteGuard from "../../components/common/CollegeRouteGuard";

/* ================= ADMIN / FACULTY ================= */

import EnhancedAdminDashboard from "./admin/EnhancedAdminDashboard";
import FacultyManagementPage from "./admin/users/FacultyManagementPage";
import StudentManagementPage from "./admin/users/StudentManagementPage";

import CourseManagementPage from "./admin/courses/CourseManagementPage";
import CourseDetailPage from "./admin/courses/CourseDetailPage";

import TestList from "../../components/admin/tests/TestList";
import CreateTestPage from "./admin/tests/CreateTestPage";
import TestDetailPage from "./admin/tests/TestDetailPage";
import QuestionManagementPage from "./admin/tests/QuestionManagementPage";
import ResultsPage from "./admin/tests/ResultsPage";

import TopicList from "../../components/admin/topics/TopicList";
import CreateTopicPage from "./admin/topics/CreateTopicPage";
import TopicDetailPage from "./admin/topics/TopicDetailPage";
import TopicEditPage from "./admin/topics/TopicEditPage";
import ChapterEditPage from "./admin/topics/ChapterEditPage";

import ProctoringTestPage from "./admin/ProctoringTestPage";

/* ================= STUDENT ================= */

import StudentDashboard from "./student/StudentDashboard";
import TakeTest from "./student/TakeTestPage";
import ImprovedPreTestInstructions from "./student/ImprovedPreTestInstructions";

import TopicListPage from "./student/TopicListPage";
import TopicViewerPage from "./student/TopicViewerPage";

import StudentCoursesPage from "./student/StudentCoursesPage";
import StudentCourseViewPage from "./student/StudentCourseViewPage";

import StudentCertificatesPage from "./student/StudentCertificatesPage";
import StudentSearchPage from "./student/StudentSearchPage";
import StudentBookmarksPage from "./student/StudentBookmarksPage";

/* ================= SHARED ================= */

import ProfilePage from "./ProfilePage";


/**
 * Dashboard Router for college-specific routes
 * Applies consistent LMS layout and theme styling
 */
const CollegeDashboardRouter: React.FC = () => {

  const { user } = useAppSelector((state) => state.auth);
  const userRole = user?.type;


  return (
    <CollegeRouteGuard>

      {/* ================= MAIN DASHBOARD LAYOUT WRAPPER ================= */}

      <div
        className="min-h-screen"
        style={{
          background: "var(--background)",
          color: "var(--foreground)"
        }}
      >

        {/* Content Container aligned with Navbar */}
        <div className="max-w-7xl mx-auto px-6 py-8">

          <Routes>

            {/* ================= DASHBOARD INDEX ================= */}

            <Route
              index
              element={
                userRole === "ADMIN" || userRole === "FACULTY" ? (
                  <EnhancedAdminDashboard />
                ) : userRole === "USER" ? (
                  <StudentDashboard />
                ) : (
                  <div className="flex items-center justify-center min-h-[60vh]">

                    <div
                      className="text-center p-10 rounded-2xl border"
                      style={{
                        background: "var(--card)",
                        borderColor: "var(--border)"
                      }}
                    >
                      <h2 className="text-2xl font-bold mb-2">
                        Welcome to BKIT LMS
                      </h2>

                      <p className="text-[var(--muted-foreground)]">
                        Please navigate using the dashboard menu.
                      </p>

                    </div>

                  </div>
                )
              }
            />


            {/* ================= SHARED ================= */}

            <Route path="profile" element={<ProfilePage />} />


            {/* ================= ADMIN / FACULTY ================= */}

            {(userRole === "ADMIN" || userRole === "FACULTY") && (
              <>

                {/* User Management */}

                <Route path="users/faculty" element={<FacultyManagementPage />} />
                <Route path="users/students" element={<StudentManagementPage />} />


                {/* Course Management */}

                <Route path="courses" element={<CourseManagementPage />} />
                <Route path="courses/create" element={<CourseManagementPage />} />

                <Route path="courses/:id" element={<CourseDetailPage />} />

                <Route
                  path="courses/:courseId/topics/:topicId/edit"
                  element={<TopicEditPage />}
                />

                <Route
                  path="courses/:courseId/topics/:topicId/chapters/create"
                  element={<ChapterEditPage />}
                />

                <Route
                  path="courses/:courseId/topics/:topicId/chapters/:chapterId/edit"
                  element={<ChapterEditPage />}
                />


                {/* Test Management */}

                <Route path="tests" element={<TestList />} />
                <Route path="tests/create" element={<CreateTestPage />} />

                <Route path="tests/:id" element={<TestDetailPage />} />

                <Route
                  path="tests/:id/questions"
                  element={<QuestionManagementPage />}
                />

                <Route
                  path="tests/:testId/results"
                  element={<ResultsPage />}
                />

                <Route path="results" element={<ResultsPage />} />

                <Route
                  path="proctoring-test"
                  element={<ProctoringTestPage />}
                />


                {/* Topic Management */}

                <Route path="topics" element={<TopicList />} />
                <Route path="topics/create" element={<CreateTopicPage />} />
                <Route path="topics/:id" element={<TopicDetailPage />} />


                {/* Test Preview */}

                <Route
                  path="tests/:testId/instructions"
                  element={<ImprovedPreTestInstructions />}
                />

                <Route
                  path="test/take/:testId"
                  element={<TakeTest />}
                />

              </>
            )}



            {/* ================= STUDENT ================= */}

            {userRole === "USER" && (
              <>

                <Route path="courses" element={<StudentCoursesPage />} />

                <Route
                  path="courses/:id"
                  element={<StudentCourseViewPage />}
                />

                <Route
                  path="certificates"
                  element={<StudentCertificatesPage />}
                />

                <Route path="topics" element={<TopicListPage />} />

                <Route
                  path="topics/:topicId"
                  element={<TopicViewerPage />}
                />

                <Route path="search" element={<StudentSearchPage />} />

                <Route
                  path="bookmarks"
                  element={<StudentBookmarksPage />}
                />

                <Route
                  path="tests/:testId/instructions"
                  element={<ImprovedPreTestInstructions />}
                />

                <Route
                  path="test/take/:testId"
                  element={<TakeTest />}
                />

              </>
            )}

          </Routes>

        </div>

      </div>

    </CollegeRouteGuard>
  );

};

export default CollegeDashboardRouter;
