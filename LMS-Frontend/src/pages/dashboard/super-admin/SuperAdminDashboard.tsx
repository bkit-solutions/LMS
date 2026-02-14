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

      setColleges(collegeData.slice(0, 4));
      setStats({
        totalColleges: collegeData.length,
        activeColleges,
        totalAdmins: admins,
        totalFaculty: faculty,
        totalStudents: students,
      });

      const activities: RecentActivity[] = [];

      collegeData.slice(0, 2).forEach((college) => {
        activities.push({
          id: activities.length + 1,
          type: "college",
          action: "College onboarded",
          entity: college.name,
          timestamp: "Recently",
          status: college.isActive ? "success" : "pending",
        });
      });

      userData.slice(0, 3).forEach((user) => {
        const userType =
          user.type === "ADMIN"
            ? "Admin"
            : user.type === "FACULTY"
            ? "Faculty"
            : "Student";

        activities.push({
          id: activities.length + 1,
          type: user.type === "ADMIN" ? "admin" : "course",
          action: `${userType} account created`,
          entity: user.name || user.email,
          timestamp: "Recently",
          status: "success",
        });
      });

      setRecentActivities(activities.slice(0, 5));
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
      title: "View Tests",
      icon: BarChart3,
      href: "/dashboard/tests",
      description: "All tests & results",
    },
    {
      title: "Manage Courses",
      icon: Activity,
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
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

      {/* HERO */}
      <div
        className="rounded-2xl border p-8"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-6">

          <div>
            <h1 className="text-3xl font-black heading-font">
              Welcome back, {user?.name || "Admin"}!
            </h1>

            <p className="text-[var(--muted-foreground)] mt-2">
              Super Admin Control Center - Manage your entire LMS ecosystem
            </p>
          </div>

          <div className="flex items-center gap-10">

            <div className="text-center">
              <div className="text-3xl font-bold">
                {stats.totalColleges}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                Colleges
              </div>
            </div>

            <div className="w-px h-10 bg-[var(--border)]" />

            <div className="text-center">
              <div className="text-3xl font-bold">
                {stats.totalStudents}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                Students
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {quickActions.map((action) => (

          <Link
            key={action.title}
            to={action.href}
            className="group rounded-xl border p-6 transition hover:shadow-md hover:-translate-y-1"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >

            <div className="flex justify-between mb-4">

              <div
                className="p-3 rounded-lg text-white"
                style={{ background: "var(--primary)" }}
              >
                <action.icon className="w-5 h-5" />
              </div>

              <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />

            </div>

            <h3 className="font-semibold">
              {action.title}
            </h3>

            <p className="text-sm text-[var(--muted-foreground)]">
              {action.description}
            </p>

          </Link>

        ))}

      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        {statCards.map((stat) => (

          <div
            key={stat.title}
            className="rounded-xl border p-6"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >

            <div
              className="p-2 rounded-lg w-fit mb-3 text-white"
              style={{ background: "var(--primary)" }}
            >
              <stat.icon className="w-5 h-5" />
            </div>

            <p className="text-sm text-[var(--muted-foreground)]">
              {stat.title}
            </p>

            <div className="flex items-baseline gap-2">

              <p className="text-3xl font-bold">
                {stat.value}
              </p>

              {stat.active !== undefined && (
                <span className="text-green-600 text-sm">
                  ({stat.active} active)
                </span>
              )}

            </div>

          </div>

        ))}

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

          <div className="flex justify-between mb-4">

            <h2 className="font-semibold flex gap-2">
              <Activity className="w-5 h-5 text-[var(--primary)]" />
              Recent Activity
            </h2>

            <Link
              to="/dashboard/users"
              className="text-[var(--primary)] text-sm"
            >
              View All
            </Link>

          </div>

          <div className="space-y-3">

            {recentActivities.map((activity) => (

              <div
                key={activity.id}
                className="p-4 rounded-lg"
                style={{
                  background: "var(--surface)",
                }}
              >

                <div className="flex justify-between">

                  <div>
                    <p className="font-medium">
                      {activity.action}
                    </p>

                    <p className="text-sm text-[var(--muted-foreground)]">
                      {activity.entity}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                    <Clock className="w-4 h-4" />
                    {activity.timestamp}
                  </div>

                </div>

              </div>

            ))}

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

          <h2 className="font-semibold mb-4 flex gap-2">
            <Globe className="w-5 h-5 text-[var(--primary)]" />
            Developer Resources
          </h2>

          <div className="space-y-3">

            <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noopener noreferrer"
               className="block p-3 border rounded-lg hover:shadow-sm"
               style={{ borderColor: "var(--border)" }}
            >
              Swagger UI
            </a>

            <a href="http://localhost:8080/v3/api-docs" target="_blank" rel="noopener noreferrer"
               className="block p-3 border rounded-lg hover:shadow-sm"
               style={{ borderColor: "var(--border)" }}
            >
              OpenAPI Docs
            </a>

            <a href="https://github.com/bkit-solutions/LMS" target="_blank" rel="noopener noreferrer"
               className="block p-3 border rounded-lg hover:shadow-sm"
               style={{ borderColor: "var(--border)" }}
            >
              GitHub Repository
            </a>

          </div>

        </div>

      </div>

 {/* ================= RECENT COLLEGES ================= */}

<div
  className="rounded-2xl border p-6 md:p-8"
  style={{
    background: "var(--card)",
    borderColor: "var(--border)",
  }}
>

  {/* Header */}
  <div className="flex items-center justify-between mb-6">

    <div>
      <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[var(--primary)]" />
        Recently Onboarded Colleges
      </h2>

      <p className="text-sm text-[var(--muted-foreground)] mt-1">
        Newly registered institutions on your LMS platform
      </p>
    </div>

    <Link
      to="/dashboard/colleges"
      className="flex items-center gap-1 text-sm font-medium hover:underline"
      style={{ color: "var(--primary)" }}
    >
      View All
      <ArrowRight className="w-4 h-4" />
    </Link>

  </div>


  {/* Colleges Grid */}
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

    {colleges.map((college) => (

      <Link
        key={college.id}
        to="/dashboard/colleges"
        className="group rounded-xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface)",
        }}
      >

        {/* Logo */}
        <div className="flex justify-center mb-4">

          {college.logoUrl ? (
            <img
              src={college.logoUrl}
              alt={college.name}
              className="w-16 h-16 object-contain rounded-lg border p-2"
              style={{ borderColor: "var(--border)" }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
              style={{ background: "var(--primary)" }}
            >
              <Building2 className="w-8 h-8" />
            </div>
          )}

        </div>


        {/* College Name */}
        <h3 className="text-center font-semibold text-base group-hover:text-[var(--primary)] transition">
          {college.name}
        </h3>


        {/* College Code */}
        <p className="text-center text-sm text-[var(--muted-foreground)] mt-1">
          {college.code}
        </p>


        {/* Status */}
        <div className="flex justify-center mt-3">

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
        <div className="flex justify-center mt-4 opacity-0 group-hover:opacity-100 transition">

          <span
            className="text-xs font-medium"
            style={{ color: "var(--primary)" }}
          >
            View Details →
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
