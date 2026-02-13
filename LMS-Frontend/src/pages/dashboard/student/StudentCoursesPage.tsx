import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseApi } from "../../../services/courseApi";
import { enrollmentApi } from "../../../services/enrollmentApi";
import type { CourseResponse, EnrollmentResponse } from "../../../types";

const StudentCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"browse" | "enrolled">("enrolled");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsRes] = await Promise.all([
        courseApi.getPublishedCourses(),
        enrollmentApi.getMyEnrollments(),
      ]);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
      if (enrollmentsRes.success && enrollmentsRes.data) setEnrollments(enrollmentsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      const response = await enrollmentApi.enroll(courseId);
      if (response.success) {
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to enroll");
    }
  };

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-text mb-2">My Courses</h1>
      <p className="text-text-secondary mb-6">Browse and enroll in courses</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-surface rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab("enrolled")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "enrolled"
              ? "bg-white text-text shadow-sm"
              : "text-text-secondary hover:text-text"
          }`}
        >
          My Enrollments ({enrollments.length})
        </button>
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "browse"
              ? "bg-white text-text shadow-sm"
              : "text-text-secondary hover:text-text"
          }`}
        >
          Browse Courses ({courses.length})
        </button>
      </div>

      {activeTab === "enrolled" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="bg-white rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`${enrollment.courseId}`)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-text line-clamp-1">
                    {enrollment.courseTitle}
                  </h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                      enrollment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : enrollment.status === "ACTIVE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {enrollment.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>Progress</span>
                    <span>{enrollment.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${enrollment.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 text-xs text-text-secondary">
                  Enrolled: {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
          ))}
          {enrollments.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-text-secondary">You haven't enrolled in any courses yet.</p>
              <button
                onClick={() => setActiveTab("browse")}
                className="mt-2 text-primary hover:underline"
              >
                Browse available courses
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "browse" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
              <div className="p-5">
                <h3 className="text-lg font-semibold text-text line-clamp-1">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-2">{course.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {course.category && (
                    <span className="text-xs bg-surface text-text-secondary px-2 py-1 rounded">
                      {course.category}
                    </span>
                  )}
                  {course.difficultyLevel && (
                    <span className="text-xs bg-surface text-text-secondary px-2 py-1 rounded">
                      {course.difficultyLevel}
                    </span>
                  )}
                  {course.estimatedHours && (
                    <span className="text-xs bg-surface text-text-secondary px-2 py-1 rounded">
                      {course.estimatedHours}h
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm text-text-secondary">
                  <span>{course.topicCount} topics</span>
                  <span className="mx-2">&middot;</span>
                  <span>{course.enrollmentCount} enrolled</span>
                </div>
                <div className="mt-4">
                  {enrolledCourseIds.has(course.id) ? (
                    <button
                      className="w-full py-2 rounded-lg bg-surface text-text-secondary font-medium cursor-default"
                      disabled
                    >
                      Already Enrolled
                    </button>
                  ) : course.enrollmentOpen ? (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="w-full py-2 rounded-lg bg-primary text-white font-medium hover:bg-secondary transition-colors"
                    >
                      Enroll Now
                    </button>
                  ) : (
                    <button
                      className="w-full py-2 rounded-lg bg-surface text-text-secondary font-medium cursor-default"
                      disabled
                    >
                      Enrollment Closed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-text-secondary">No courses available at the moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
