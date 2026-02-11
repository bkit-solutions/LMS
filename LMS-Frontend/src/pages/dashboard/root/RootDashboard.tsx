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
    // Refresh user data on mount
    dispatch(getCurrentUserAsync());
    loadDashboardData();
  }, [dispatch]);

  const loadDashboardData = async () => {
    try {
      const statsResponse = await userApi.getUserStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataInit = async () => {
    setDataInitLoading(true);
    try {
      const response = await adminApi.initializeData();
      if (response.success) {
        alert("✅ " + response.message);
        loadDashboardData(); // Refresh stats
      } else {
        alert("❌ " + response.message);
      }
    } catch (error: any) {
      alert("❌ Failed to initialize data: " + (error.response?.data?.message || error.message));
    } finally {
      setDataInitLoading(false);
    }
  };

  const handleDataReset = async () => {
    if (!confirm("⚠️ This will clear ALL data and reinitialize with dummy data. Are you sure?")) {
      return;
    }
    
    setDataInitLoading(true);
    try {
      const response = await adminApi.resetData();
      if (response.success) {
        alert("✅ " + response.message);
        loadDashboardData(); // Refresh stats
      } else {
        alert("❌ " + response.message);
      }
    } catch (error: any) {
      alert("❌ Failed to reset data: " + (error.response?.data?.message || error.message));
    } finally {
      setDataInitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    count, 
    icon: Icon, 
    color = "bg-primary" 
  }: {
    title: string;
    count: number;
    icon: React.ComponentType<any>;
    color?: string;
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{count.toLocaleString()}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600 mt-2">
            Complete system oversight and management • Welcome back, {user?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Root Administrator</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Development Tools</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-medium mb-2">Initialize System Data</h3>
            <p className="text-white/80 text-sm mb-3">
              Create complete dummy data with all roles, colleges, and users for testing.
            </p>
            <button
              onClick={handleDataInit}
              disabled={dataInitLoading}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {dataInitLoading ? "Initializing..." : "Initialize Data"}
            </button>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-medium mb-2">Reset All Data</h3>
            <p className="text-white/80 text-sm mb-3">
              Clear all existing data and reinitialize with fresh dummy data.
            </p>
            <button
              onClick={handleDataReset}
              disabled={dataInitLoading}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {dataInitLoading ? "Resetting..." : "Reset Data"}
            </button>
          </div>
        </div>
      </div>

      {/* System Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <StatCard 
            title="Total Users" 
            count={stats.totalUsers} 
            icon={Users}
            color="bg-blue-600"
          />
          <StatCard 
            title="Root Admins" 
            count={stats.rootAdmins} 
            icon={Shield}
            color="bg-red-600"
          />
          <StatCard 
            title="Super Admins" 
            count={stats.superAdmins} 
            icon={Users}
            color="bg-purple-600"
          />
          <StatCard 
            title="College Admins" 
            count={stats.admins} 
            icon={Building}
            color="bg-indigo-600"
          />
          <StatCard 
            title="Faculty" 
            count={stats.faculty} 
            icon={UserPlus}
            color="bg-green-600"
          />
          <StatCard 
            title="Students" 
            count={stats.students} 
            icon={Users}
            color="bg-orange-600"
          />
        </div>
      )}

      {/* Status Overview */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-red-600" />
              <span>User Activity Status</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Active Users</span>
                </div>
                <span className="text-green-900 font-bold">{stats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">Inactive Users</span>
                </div>
                <span className="text-red-900 font-bold">{stats.inactiveUsers}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              <span>System Health</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800 font-medium">User Activation Rate</span>
                <span className="text-blue-900 font-bold">
                  {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-800 font-medium">Admin Coverage</span>
                <span className="text-purple-900 font-bold">
                  {(stats.rootAdmins + stats.superAdmins + stats.admins)} Administrators
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootDashboard;
