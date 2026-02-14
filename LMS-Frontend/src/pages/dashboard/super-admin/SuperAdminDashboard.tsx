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

      if (
        usersResponse.status === "fulfilled" &&
        usersResponse.value.success &&
        usersResponse.value.data
      ) {
        userData = usersResponse.value.data;
      }

      if (
        collegesResponse.status === "fulfilled" &&
        collegesResponse.value.success &&
        collegesResponse.value.data
      ) {
        collegeData = collegesResponse.value.data;
      }

      const activeColleges = collegeData.filter((c) => c.isActive).length;
      const admins = userData.filter(
        (u: any) => u.type === "ADMIN" || u.role === "COLLEGE_ADMIN"
      ).length;
      const faculty = userData.filter(
        (u: any) => u.type === "FACULTY" || u.role === "FACULTY"
      ).length;
      const students = userData.filter(
        (u: any) => u.type === "USER" || u.role === "STUDENT"
      ).length;

      // Sort colleges by onboardedAt date (most recent first) and take top 4 for display
      const sortedColleges = collegeData
        .sort((a, b) => {
          const dateA = a.onboardedAt ? new Date(a.onboardedAt).getTime() : 0;
          const dateB = b.onboardedAt ? new Date(b.onboardedAt).getTime() : 0;
          return dateB - dateA; // Most recent first
        })
        .slice(0, 4);

      setColleges(sortedColleges);
      setStats({
        totalColleges: collegeData.length,
        activeColleges,
        totalAdmins: admins,
        totalFaculty: faculty,
        totalStudents: students,
      });

      const activities: RecentActivity[] = [];

      // Log recent colleges with actual creation info
      collegeData
        .sort((a, b) => {
          const dateA = a.onboardedAt ? new Date(a.onboardedAt).getTime() : 0;
          const dateB = b.onboardedAt ? new Date(b.onboardedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3)
        .forEach((college) => {
          const timestamp = college.onboardedAt 
            ? new Date(college.onboardedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : "Recently";
          
          activities.push({
            id: activities.length + 1,
            type: "college",
            action: `College ${college.isActive ? 'onboarded' : 'registered (pending)'}`,
            entity: `${college.name} (${college.code})`,
            timestamp: timestamp,
            status: college.isActive ? "success" : "pending",
          });
        });

      // Log recent user creations
      userData
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .forEach((user) => {
          const userType =
            user.type === "SUPERADMIN"
              ? "Super Admin"
              : user.type === "ADMIN"
              ? "College Admin"
              : user.type === "FACULTY"
              ? "Faculty"
              : "Student";

          const timestamp = user.createdAt 
            ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : "Recently";

          const collegeName = user.collegeName ? ` - ${user.collegeName}` : "";

          activities.push({
            id: activities.length + 1,
            type: user.type === "ADMIN" ? "admin" : "course",
            action: `${userType} registered`,
            entity: `${user.name || user.email}${collegeName}`,
            timestamp: timestamp,
            status: user.isActive ? "success" : "pending",
          });
        });

      // Sort all activities by most recent
      setRecentActivities(activities.slice(0, 8));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Onboard College",
      icon: Building2,
      href: "/dashboard/colleges",
      description: "Add new institution",
    },
    {
      title: "Manage Users",
      icon: Users,
      href: "/dashboard/users",
      description: "View all users",
    },
    {
      title: "Create Test",
      icon: BarChart3,
      href: "/dashboard/tests/create",
      description: "Design new assessment",
    },
    {
      title: "Manage Tests",
      icon: Activity,
      href: "/dashboard/tests",
      description: "All tests & results",
    },
    {
      title: "Manage Courses",
      icon: GraduationCap,
      href: "/dashboard/courses",
      description: "Course catalog",
    },
  ];

  const statCards = [
    {
      title: "Total Colleges",
      value: stats.totalColleges,
      active: stats.activeColleges,
      icon: Building2,
    },
    { title: "College Admins", value: stats.totalAdmins, icon: Users },
    { title: "Faculty Members", value: stats.totalFaculty, icon: GraduationCap },
    { title: "Students", value: stats.totalStudents, icon: BookOpen },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div
          className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--primary)" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">

      {/* HERO */}
      <div
        className="relative rounded-2xl border p-8 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, var(--card) 100%)",
          borderColor: "var(--border)",
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--primary)] to-transparent rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[var(--primary)] to-transparent rounded-full blur-2xl transform -translate-x-24 translate-y-24"></div>
        </div>

        <div className="relative flex flex-col md:flex-row justify-between gap-6">

          <div className="flex-1">
            <h1 className="text-4xl font-black heading-font bg-gradient-to-r from-[var(--foreground)] to-[var(--muted-foreground)] bg-clip-text text-transparent">
              Welcome back, {user?.name || "Admin"}!
            </h1>

            <p className="text-[var(--muted-foreground)] mt-3 text-lg">
              Super Admin Control Center - Manage your entire LMS ecosystem
            </p>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System Online
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">

            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
              <div className="text-3xl font-bold text-[var(--primary)]">
                {stats.totalColleges}
              </div>
              <div className="text-sm text-[var(--muted-foreground)] font-medium">
                Colleges
              </div>
              <div className="text-xs text-green-600 mt-1">
                {stats.activeColleges} active
              </div>
            </div>

            <div className="w-px h-16 bg-gradient-to-b from-transparent via-[var(--border)] to-transparent" />

            <div className="text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
              <div className="text-3xl font-bold text-[var(--primary)]">
                {stats.totalStudents.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--muted-foreground)] font-medium">
                Students
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {stats.totalFaculty} faculty
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--primary)]" />
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">

          {quickActions.map((action) => (

            <Link
              key={action.title}
              to={action.href}
              className="group relative rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--primary)]/10 hover:-translate-y-2 overflow-hidden"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >

              {/* Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex justify-between mb-4">

                <div
                  className="p-3 rounded-lg text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ background: "var(--primary)" }}
                >
                  <action.icon className="w-5 h-5" />
                </div>

                <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all duration-300" />

              </div>

              <h3 className="relative font-semibold text-lg group-hover:text-[var(--primary)] transition-colors duration-300">
                {action.title}
              </h3>

              <p className="relative text-sm text-[var(--muted-foreground)] mt-1">
                {action.description}
              </p>

              {/* Animated Border */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--primary)] to-transparent group-hover:w-full transition-all duration-500"></div>

            </Link>

          ))}

        </div>
      </div>

      {/* STATS */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
          System Overview
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

          {statCards.map((stat) => (

            <div
              key={stat.title}
              className="group relative rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10 overflow-hidden"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >

              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                <stat.icon className="w-full h-full" />
              </div>

              <div className="relative">

                <div
                  className="p-3 rounded-lg w-fit mb-4 text-white shadow-md group-hover:scale-110 transition-transform duration-300"
                  style={{ background: "var(--primary)" }}
                >
                  <stat.icon className="w-5 h-5" />
                </div>

                <p className="text-sm text-[var(--muted-foreground)] font-medium mb-2">
                  {stat.title}
                </p>

                <div className="flex items-baseline gap-2">

                  <p className="text-3xl font-bold group-hover:text-[var(--primary)] transition-colors duration-300">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>

                  {stat.active !== undefined && (
                    <span className="text-green-600 text-sm font-medium">
                      ({stat.active} active)
                    </span>
                  )}

                </div>

                {/* Progress Bar for Active Stats */}
                {stat.active !== undefined && stat.value > 0 && (
                  <div className="mt-3">
                    <div className="w-full bg-[var(--muted)] rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${(stat.active / stat.value) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {Math.round((stat.active / stat.value) * 100)}% active
                    </p>
                  </div>
                )}

              </div>

            </div>

          ))}

        </div>
      </div>

      {/* RECENT ACTIVITY + DEV RESOURCES */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* RECENT ACTIVITY */}
        <div
          className="lg:col-span-2 rounded-xl border p-6"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >

          <div className="flex justify-between mb-6">

            <h2 className="font-semibold flex gap-2 text-lg">
              <Activity className="w-5 h-5 text-[var(--primary)]" />
              Recent Activity
            </h2>

            <div className="text-xs text-[var(--muted-foreground)] px-3 py-1 rounded-full bg-[var(--muted)]/50">
              Last {recentActivities.length} activities
            </div>

          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">

            {recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--muted)]/50 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-[var(--muted-foreground)]" />
                </div>
                <p className="text-sm text-[var(--muted-foreground)] font-medium">No recent activity</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">Activity will appear here as users interact with the system</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => (

                <div
                  key={activity.id}
                  className="group p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300 hover:shadow-md hover:shadow-[var(--primary)]/5"
                  style={{
                    background: "var(--surface)",
                    animationDelay: `${index * 100}ms`,
                  }}
                >

                  <div className="flex justify-between items-start gap-3">

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-sm group-hover:text-[var(--primary)] transition-colors duration-300">
                          {activity.action}
                        </p>
                        {activity.status === "success" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                        {activity.status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {activity.status === "warning" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 border border-orange-200">
                            <AlertCircle className="w-3 h-3" />
                            Warning
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[var(--muted-foreground)]">
                        {activity.entity}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {activity.timestamp}
                    </div>

                  </div>

                </div>

              ))
            )}

          </div>

        </div>

        {/* DEV RESOURCES */}

        <div
          className="rounded-xl border p-6"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >

          <h2 className="font-semibold mb-6 flex gap-2 text-lg">
            <Globe className="w-5 h-5 text-[var(--primary)]" />
            Developer Resources
          </h2>

          <div className="space-y-3">

            <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noopener noreferrer"
               className="group block p-4 border rounded-lg hover:shadow-md hover:shadow-[var(--primary)]/10 transition-all duration-300 hover:-translate-y-0.5"
               style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm group-hover:text-[var(--primary)] transition-colors duration-300">Swagger UI</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Interactive API documentation</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </a>

            <a href="http://localhost:8080/v3/api-docs" target="_blank" rel="noopener noreferrer"
               className="group block p-4 border rounded-lg hover:shadow-md hover:shadow-[var(--primary)]/10 transition-all duration-300 hover:-translate-y-0.5"
               style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm group-hover:text-[var(--primary)] transition-colors duration-300">OpenAPI Docs</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">JSON API specification</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </a>

            <a href="https://github.com/bkit-solutions/LMS" target="_blank" rel="noopener noreferrer"
               className="group block p-4 border rounded-lg hover:shadow-md hover:shadow-[var(--primary)]/10 transition-all duration-300 hover:-translate-y-0.5"
               style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm group-hover:text-[var(--primary)] transition-colors duration-300">GitHub Repository</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Source code & documentation</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </a>

          </div>

        </div>

      </div>

      {/* COLLEGES PREVIEW */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--primary)]" />
            Recent Colleges
          </h2>
          <Link
            to="/dashboard/colleges"
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium flex items-center gap-1 transition-colors duration-300"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

          {colleges.slice(0, 4).map((college) => (

            <Link
              key={college.id}
              to={`/dashboard/colleges/${college.id}`}
              className="group relative rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10 hover:-translate-y-1 overflow-hidden"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
            >

              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative text-center">

                {/* College Logo */}
                {college.logoUrl ? (
                  <img
                    src={college.logoUrl}
                    alt={`${college.name} logo`}
                    className="w-16 h-16 object-contain rounded-lg border p-2 mx-auto mb-4"
                    style={{ borderColor: "var(--border)" }}
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white mx-auto mb-4 shadow-md"
                    style={{ background: "var(--primary)" }}
                  >
                    <Building2 className="w-8 h-8" />
                  </div>
                )}

                {/* College Name */}
                <h3 className="font-semibold text-base group-hover:text-[var(--primary)] transition-colors duration-300 mb-1">
                  {college.name}
                </h3>

                {/* College Code */}
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  {college.code}
                </p>

                {/* Status */}
                <div className="flex justify-center">

                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                    style={{
                      background: college.isActive
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(148,163,184,0.15)",

                      color: college.isActive
                        ? "rgb(34,197,94)"
                        : "rgb(100,116,139)",
                    }}
                  >
                    {college.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Inactive
                      </>
                    )}
                  </span>

                </div>

                {/* Hover Footer */}
                <div className="flex justify-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    View Details →
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

        {colleges.length === 0 && (
          <div className="text-center py-12 rounded-xl border-2 border-dashed"
               style={{ borderColor: "var(--border)" }}>
            <Building2 className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-4" />
            <p className="text-sm text-[var(--muted-foreground)] font-medium">No colleges onboarded yet</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Start by adding your first institution</p>
            <Link
              to="/dashboard/colleges"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              <Building2 className="w-4 h-4" />
              Onboard College
            </Link>
          </div>
        )}

      </div>


    </div>
  );
};

export default SuperAdminDashboard;
