import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { testApi } from "../../../services/testApi";
import { userApi } from "../../../services/authApi";
import { useCollegeTheme } from "../../../hooks/useCollegeTheme";
import {
  BookOpen,
  Users,
  FileText,
  Award,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import type { Test } from "../../../types";

const EnhancedAdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { applyTheme } = useCollegeTheme();
  const [tests, setTests] = useState<Test[]>([]);
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

        if (testsRes.success && testsRes.data) {
          setTests(testsRes.data);
          setStats((prev) => ({
            ...prev,
            totalTests: testsRes.data?.length || 0,
            publishedTests: testsRes.data?.filter((t: any) => t.isPublished).length || 0,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-2xl font-bold text-text mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-text-secondary">
            {user?.type === "ADMIN" ? "College Administrator" : "Faculty Member"} Dashboard
          </p>
        </div>

        {/* College Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold text-text mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            College Statistics
          </h3>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-800">{stats.totalStudents}</span>
              </div>
              <h4 className="text-sm font-medium text-blue-700">Total Students</h4>
              <p className="text-xs text-blue-600 mt-1">Active learners enrolled</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-green-800">{stats.totalFaculty}</span>
              </div>
              <h4 className="text-sm font-medium text-green-700">Faculty Members</h4>
              <p className="text-xs text-green-600 mt-1">Teaching staff available</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold text-purple-800">{stats.totalTests}</span>
              </div>
              <h4 className="text-sm font-medium text-purple-700">Total Tests</h4>
              <p className="text-xs text-purple-600 mt-1">Assessments created</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-orange-800">{stats.publishedTests}</span>
              </div>
              <h4 className="text-sm font-medium text-orange-700">Published Tests</h4>
              <p className="text-xs text-orange-600 mt-1">Live assessments</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <span className="text-2xl font-bold text-indigo-800">
                  {Math.round((stats.publishedTests / Math.max(stats.totalTests, 1)) * 100)}%
                </span>
              </div>
              <h4 className="text-sm font-medium text-indigo-700">Test Completion Rate</h4>
              <p className="text-xs text-indigo-600 mt-1">Published vs total tests</p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-pink-600" />
                <span className="text-2xl font-bold text-pink-800">
                  {stats.totalStudents > 0 ? Math.round((stats.totalTests / stats.totalStudents) * 10) / 10 : 0}
                </span>
              </div>
              <h4 className="text-sm font-medium text-pink-700">Tests per Student</h4>
              <p className="text-xs text-pink-600 mt-1">Average assessment load</p>
            </div>
          </div>

          {/* College Info Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">College Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Institution:</span>
                <span className="ml-2 font-medium text-gray-800">{user?.collegeName || 'BKIT Engineering College'}</span>
              </div>
              <div>
                <span className="text-gray-600">Code:</span>
                <span className="ml-2 font-medium text-gray-800">{user?.collegeCode || 'BKIT'}</span>
              </div>
              <div>
                <span className="text-gray-600">Administrator:</span>
                <span className="ml-2 font-medium text-gray-800">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        {tests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-text">Recent Tests</h3>
              <Link
                to="tests"
                className="text-sm font-medium text-primary hover:text-secondary"
              >
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {tests.slice(0, 5).map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-text">
                        {test.title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            (test as any).isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {(test as any).isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {test.durationMinutes} min
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <Link
                          to={`tests/${test.id}`}
                          className="text-primary hover:text-secondary font-medium"
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
          <div className="bg-white rounded-xl shadow-sm border border-border p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-text-secondary opacity-50 mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">No tests yet</h3>
            <p className="text-text-secondary mb-6">
              Get started by creating your first test
            </p>
            <Link
              to="tests/create"
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Create Test
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
