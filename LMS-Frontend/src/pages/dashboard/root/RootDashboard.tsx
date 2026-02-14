import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { getCurrentUserAsync, selectUser } from "../../../features/auth/authSlice";
import {
  Users,
  Building,
  Shield,
  BarChart3,
  UserPlus,
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { userApi, adminApi, type UserStats } from "../../../services/authApi";

const RootDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataInitLoading, setDataInitLoading] = useState(false);

  useEffect(() => {
    dispatch(getCurrentUserAsync());
    loadDashboardData();
  }, [dispatch]);

  const loadDashboardData = async () => {
    try {
      const statsResponse = await userApi.getUserStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDataInit = async () => {
    setDataInitLoading(true);
    try {
      const response = await adminApi.initializeData();
      alert(response.success ? "✅ " + response.message : "❌ " + response.message);
      loadDashboardData();
    } finally {
      setDataInitLoading(false);
    }
  };

  const handleDataReset = async () => {
    if (!confirm("⚠️ This will clear ALL data and reinitialize with dummy data. Are you sure?")) return;
    setDataInitLoading(true);
    try {
      const response = await adminApi.resetData();
      alert(response.success ? "✅ " + response.message : "❌ " + response.message);
      loadDashboardData();
    } finally {
      setDataInitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const StatCard = ({
    title,
    count,
    icon: Icon,
    color
  }: any) => (
    <div
      className="rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)"
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--muted-foreground)] mb-1">{title}</p>
          <p className="text-3xl font-bold">{count.toLocaleString()}</p>
        </div>

        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
             style={{ background: color }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black heading-font">
            System Administration
          </h1>
          <p className="text-[var(--muted-foreground)] mt-2">
            Complete system oversight • Welcome back, {user?.name}
          </p>
        </div>

        <div className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
             style={{
               background: "rgba(239,68,68,0.1)",
               color: "rgb(185,28,28)"
             }}>
          <Shield className="w-4 h-4" />
          Root Administrator
        </div>
      </div>

      {/* Development Tools */}
      <div
        className="rounded-3xl p-8 border"
        style={{
          background: "linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.03))",
          borderColor: "rgba(220,38,38,0.2)"
        }}
      >
        <h2 className="text-xl font-semibold mb-6">Development Tools</h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="p-6 rounded-2xl bg-white/60 backdrop-blur border border-white/40">
            <h3 className="font-semibold mb-2">Initialize System Data</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Create dummy users, colleges, roles and system hierarchy for testing.
            </p>

            <button
              onClick={handleDataInit}
              disabled={dataInitLoading}
              className="px-5 py-2 rounded-xl font-medium transition hover:-translate-y-1 hover:shadow-md"
              style={{ background: "var(--primary)", color: "white" }}
            >
              {dataInitLoading ? "Initializing..." : "Initialize Data"}
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 backdrop-blur border border-white/40">
            <h3 className="font-semibold mb-2">Reset All Data</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Completely reset system and recreate structured demo dataset.
            </p>

            <button
              onClick={handleDataReset}
              disabled={dataInitLoading}
              className="px-5 py-2 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition"
            >
              {dataInitLoading ? "Resetting..." : "Reset Data"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <StatCard title="Total Users" count={stats.totalUsers} icon={Users} color="#2563eb" />
          <StatCard title="Root Admins" count={stats.rootAdmins} icon={Shield} color="#dc2626" />
          <StatCard title="Super Admins" count={stats.superAdmins} icon={Users} color="#7c3aed" />
          <StatCard title="College Admins" count={stats.admins} icon={Building} color="#4f46e5" />
          <StatCard title="Faculty" count={stats.faculty} icon={UserPlus} color="#16a34a" />
          <StatCard title="Students" count={stats.students} icon={Users} color="#ea580c" />
        </div>
      )}

      {/* Status */}
      {stats && (
        <div className="grid lg:grid-cols-2 gap-8">

          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)"
            }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--primary)]" />
              User Activity
            </h3>

            <div className="space-y-4">
              <StatusItem
                label="Active Users"
                value={stats.activeUsers}
                icon={CheckCircle}
                bg="rgba(34,197,94,0.1)"
                color="#15803d"
              />

              <StatusItem
                label="Inactive Users"
                value={stats.inactiveUsers}
                icon={AlertCircle}
                bg="rgba(239,68,68,0.1)"
                color="#b91c1c"
              />
            </div>
          </div>

          <div
            className="rounded-2xl p-6 border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)"
            }}
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
              System Health
            </h3>

            <div className="space-y-4">
              <MetricItem
                label="User Activation Rate"
                value={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`}
              />

              <MetricItem
                label="Admin Coverage"
                value={`${stats.rootAdmins + stats.superAdmins + stats.admins} Administrators`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusItem = ({ label, value, icon: Icon, bg, color }: any) => (
  <div className="flex items-center justify-between p-4 rounded-xl"
       style={{ background: bg }}>
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5" style={{ color }} />
      <span className="font-medium">{label}</span>
    </div>
    <span className="font-bold">{value}</span>
  </div>
);

const MetricItem = ({ label, value }: any) => (
  <div className="flex items-center justify-between p-4 rounded-xl"
       style={{ background: "rgba(59,130,246,0.08)" }}>
    <span className="font-medium">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);

export default RootDashboard;
