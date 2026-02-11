import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { userApi } from "../../../services/authApi";
import { collegeApi } from "../../../services/collegeApi";
import type { CollegeResponse } from "../../../services/authApi";
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Globe,
} from "lucide-react";

interface DashboardStats {
  totalColleges: number;
  activeColleges: number;
  totalAdmins: number;
  totalFaculty: number;
  totalStudents: number;
}

interface RecentActivity {
  id: number;
  type: "college" | "admin" | "course";
  action: string;
  entity: string;
  timestamp: string;
  status: "success" | "pending" | "warning";
}

const SuperAdminDashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [colleges, setColleges] = useState<CollegeResponse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalColleges: 0,
    activeColleges: 0,
    totalAdmins: 0,
    totalFaculty: 0,
    totalStudents: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersResponse, collegesResponse] = await Promise.allSettled([
        userApi.getAllUsers(),
        collegeApi.getAllColleges(),
      ]);

      let userData: any[] = [];
      let collegeData: CollegeResponse[] = [];

      if (usersResponse.status === "fulfilled" && usersResponse.value.success && usersResponse.value.data) {
        userData = usersResponse.value.data;
      }
      if (collegesResponse.status === "fulfilled" && collegesResponse.value.success && collegesResponse.value.data) {
        collegeData = collegesResponse.value.data;
      }

      const activeColleges = collegeData.filter((c) => c.isActive).length;
      const admins = userData.filter((u: any) => u.type === "ADMIN" || u.role === "COLLEGE_ADMIN").length;
      const faculty = userData.filter((u: any) => u.type === "FACULTY" || u.role === "FACULTY").length;
      const students = userData.filter((u: any) => u.type === "USER" || u.role === "STUDENT").length;

      setColleges(collegeData.slice(0, 4));
      setStats({
        totalColleges: collegeData.length,
        activeColleges,
        totalAdmins: admins,
        totalFaculty: faculty,
        totalStudents: students,
      });

      // Build real recent activities from actual data
      const activities: RecentActivity[] = [];

      // Add recent colleges
      collegeData.slice(0, 2).forEach((college) => {
        activities.push({
          id: activities.length + 1,
          type: "college",
          action: "College onboarded",
          entity: college.name,
          timestamp: "Recently",
          status: college.isActive ? "success" : "pending"
        });
      });

      // Add recent users (admins/students)
      userData.slice(0, 3).forEach((user) => {
        const userType = user.type === "ADMIN" ? "Admin" : user.type === "FACULTY" ? "Faculty" : "Student";
        activities.push({
          id: activities.length + 1,
          type: user.type === "ADMIN" ? "admin" : "course",
          action: `${userType} account created`,
          entity: user.name || user.email,
          timestamp: "Recently",
          status: "success"
        });
      });

      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: "Onboard College", icon: Building2, href: "/dashboard/colleges", color: "bg-blue-500", description: "Add new institution" },
    { title: "Manage Users", icon: Users, href: "/dashboard/users", color: "bg-purple-500", description: "View all users" },
    { title: "View Tests", icon: BarChart3, href: "/dashboard/tests", color: "bg-green-500", description: "All tests & results" },
    { title: "Manage Courses", icon: Activity, href: "/dashboard/courses", color: "bg-orange-500", description: "Course catalog" },
  ];

  const statCards = [
    { title: "Total Colleges", value: stats.totalColleges, active: stats.activeColleges, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "College Admins", value: stats.totalAdmins, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Faculty Members", value: stats.totalFaculty, icon: GraduationCap, color: "text-green-600", bg: "bg-green-50" },
    { title: "Students", value: stats.totalStudents, icon: BookOpen, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-secondary to-primary text-white rounded-xl shadow-2xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'Admin'}!</h1>
            <p className="text-blue-100 text-lg">Super Admin Control Center - Manage your entire LMS ecosystem</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalColleges}</div>
              <div className="text-sm text-blue-100">Colleges</div>
            </div>
            <div className="h-12 w-px bg-blue-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.totalStudents}</div>
              <div className="text-sm text-blue-100">Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className="group bg-white rounded-xl shadow-md border border-border p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${action.color} p-3 rounded-lg text-white`}>
                <action.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-lg text-text mb-1">{action.title}</h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-md border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-text">{stat.value}</p>
              {stat.active !== undefined && (
                <span className="text-sm text-green-600 font-medium">({stat.active} active)</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Recent Activity
            </h2>
            <Link to="/dashboard/users" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-lg ${activity.type === "college" ? "bg-blue-100 text-blue-600" :
                  activity.type === "admin" ? "bg-purple-100 text-purple-600" :
                    "bg-green-100 text-green-600"
                  }`}>
                  {activity.type === "college" ? <Building2 className="w-5 h-5" /> :
                    activity.type === "admin" ? <Users className="w-5 h-5" /> :
                      <BookOpen className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.entity}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {activity.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Resources */}
        <div className="bg-white rounded-xl shadow-md border border-border p-6">
          <h2 className="text-xl font-semibold text-text mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Developer Resources
          </h2>
          <div className="space-y-4">
            <a
              href="http://localhost:8080/swagger-ui.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-medium text-text">Interactive API</span>
                  <p className="text-sm text-gray-600">Swagger UI Documentation</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </a>
            
            <a
              href="http://localhost:8080/v3/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <div>
                  <span className="font-medium text-text">OpenAPI Spec</span>
                  <p className="text-sm text-gray-600">JSON API Documentation</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-green-600" />
            </a>

            <a
              href="https://github.com/bkit-solutions/LMS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="font-medium text-text">GitHub Repository</span>
                  <p className="text-sm text-gray-600">Source Code & Documentation</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </a>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-text">System Status</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <p className="text-sm text-gray-600">Frontend</p>
                <p className="text-lg font-bold text-green-600">Online</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Backend</p>
                <p className="text-lg font-bold text-green-600">Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Colleges */}
      <div className="bg-white rounded-xl shadow-md border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Recently Onboarded Colleges
          </h2>
          <Link to="/dashboard/colleges" className="flex items-center gap-2 text-primary hover:underline font-medium">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {colleges.map((college) => (
            <Link
              key={college.id}
              to={`/dashboard/colleges`}
              className="group border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:border-primary"
            >
              {college.logoUrl ? (
                <img src={college.logoUrl} alt={college.name} className="w-16 h-16 object-contain mb-3 mx-auto" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              )}
              <h3 className="font-semibold text-center text-text group-hover:text-primary transition-colors mb-1">
                {college.name}
              </h3>
              <p className="text-sm text-gray-500 text-center mb-2">{college.code}</p>
              <div className="flex items-center justify-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${college.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                  {college.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {college.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
