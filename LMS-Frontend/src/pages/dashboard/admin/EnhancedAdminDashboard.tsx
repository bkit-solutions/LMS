import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { testApi } from "../../../services/testApi";
import { userApi } from "../../../services/authApi";
import { courseApi } from "../../../services/courseApi";
import { useCollegeTheme } from "../../../hooks/useCollegeTheme";
import {
  BookOpen,
  Users,
  FileText,
  Award,
  TrendingUp,
  GraduationCap,
  Layers,
  Plus,
} from "lucide-react";
import type { Test, DashboardStatsResponse } from "../../../types";

const EnhancedAdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { applyTheme } = useCollegeTheme();
  const [tests, setTests] = useState<Test[]>([]);
  const [contentStats, setContentStats] = useState<DashboardStatsResponse | null>(null);
  const [stats, setStats] = useState({
    totalTests: 0,
    publishedTests: 0,
    totalStudents: 0,
    totalFaculty: 0,
  });

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [testsRes, studentsRes, facultyRes] = await Promise.all([
          testApi.getMyTests().catch(() => ({ success: false, data: [] })),
          userApi.getStudents().catch(() => ({ success: false, data: [] })),
          userApi.getFaculty().catch(() => ({ success: false, data: [] })),
        ]);

        // Load content stats
        courseApi.getDashboardStats().then((res) => {
          if (res.success && res.data) setContentStats(res.data);
        }).catch(() => {});

        if (testsRes.success && testsRes.data) {
          setTests(testsRes.data);
          setStats((prev) => ({
            ...prev,
            totalTests: testsRes.data?.length || 0,
            publishedTests: testsRes.data?.filter((t: any) => t.published).length || 0,
          }));
        }

        if (studentsRes.success && studentsRes.data) {
          setStats((prev) => ({ ...prev, totalStudents: studentsRes.data?.length || 0 }));
        }

        if (facultyRes.success && facultyRes.data) {
          setStats((prev) => ({ ...prev, totalFaculty: facultyRes.data?.length || 0 }));
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 mt-1">
              {user?.type === "ADMIN" ? "College Administrator" : "Faculty Member"} Dashboard
            </p>
            {user?.collegeName && (
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{user.collegeName}</span>
                <span className="text-sm text-gray-500">({user.collegeCode})</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Last login</div>
            <div className="text-sm font-medium text-gray-900">Today</div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faculty Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedTests}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      {contentStats && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Content Overview</h2>
            <Link
              to="courses"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Manage Content →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">{contentStats.totalCourses}</div>
              <div className="text-xs text-gray-500">Courses</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">{contentStats.publishedCourses}</div>
              <div className="text-xs text-gray-500">Published</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">{contentStats.draftCourses}</div>
              <div className="text-xs text-gray-500">Drafts</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">{contentStats.totalEnrollments}</div>
              <div className="text-xs text-gray-500">Enrollments</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Layers className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">{contentStats.totalTopics}</div>
              <div className="text-xs text-gray-500">Topics</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-pink-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">{contentStats.totalChapters}</div>
              <div className="text-xs text-gray-500">Chapters</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Tests */}
      {tests.length > 0 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tests</h3>
            <Link
              to="tests"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tests.slice(0, 5).map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {test.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          test.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {test.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {test.durationMinutes} min
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Link
                        to={`tests/${test.id}`}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* Empty State for Tests */}
        {tests.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tests yet</h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first test
            </p>
            <Link
              to="tests/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Test
            </Link>
          </div>
        )}

      {/* Test Management Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Test Management
          </h3>
          <Link
            to="tests"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All Tests →
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="tests/create"
            className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Create Test</h4>
            <p className="text-xs text-gray-500">New assessment</p>
          </Link>

          <Link
            to="tests"
            className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Manage Tests</h4>
            <p className="text-xs text-gray-500">{stats.totalTests} total</p>
          </Link>

          <Link
            to="results"
            className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-200 transition-colors">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">View Results</h4>
            <p className="text-xs text-gray-500">Student scores</p>
          </Link>

          <Link
            to="tests"
            className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Published</h4>
            <p className="text-xs text-gray-500">{stats.publishedTests} live</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
