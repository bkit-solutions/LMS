import React, { useEffect, useState } from "react";
import { userApi, userManagementApi, type UserResponse } from "../../../services/authApi";
import { collegeApi } from "../../../services/collegeApi";
import type { College } from "../../../types";
import {
  Users,
  Search,
  Trash2,
  CheckCircle,
  Building2,
  GraduationCap,
  User as UserIcon,
  RefreshCw,
  Mail,
  ShieldAlert,
  LayoutGrid,
  List,
} from "lucide-react";

interface UserFilters {
  search: string;
  college: string;
  role: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    college: "ALL",
    role: "ALL",
    status: "ALL",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, collegesRes] = await Promise.all([
        userApi.getAllUsers(),
        collegeApi.getAllColleges(),
      ]);

      if (usersRes.success && usersRes.data) {
        const transformedUsers = usersRes.data.map((user: any) => {
          if (user.college && !user.collegeId) {
            return {
              ...user,
              collegeId: user.college.id,
              collegeName: user.college.name,
              collegeCode: user.college.code,
            };
          }
          return user;
        });
        setUsers(transformedUsers);
      }

      if (collegesRes.success && collegesRes.data) {
        setColleges(collegesRes.data);
      }
    } catch (err: any) {
      // Error loading data
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure? This will permanently delete the user account.")) return;

    try {
      const response = await userManagementApi.deleteUser(userId);
      if (response.success) {
        fetchData();
      }
    } catch (err: any) {
      // Error deleting user
    }
  };

  const filteredUsers = users.filter((user) => {
    if (["SUPERADMIN", "ADMIN", "ROOTADMIN"].includes(user.type)) return false;

    const matchesSearch =
      filters.search === "" ||
      user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCollege = filters.college === "ALL" || user.collegeId?.toString() === filters.college;
    const matchesRole = filters.role === "ALL" || user.type === filters.role;
    const matchesStatus = filters.status === "ALL" || (filters.status === "ACTIVE" ? user.isActive : !user.isActive);

    return matchesSearch && matchesCollege && matchesRole && matchesStatus;
  });

  const stats = {
    total: filteredUsers.length,
    faculty: filteredUsers.filter((u) => u.type === "FACULTY").length,
    students: filteredUsers.filter((u) => u.type === "USER").length,
    active: filteredUsers.filter((u) => u.isActive).length,
  };

  const getRoleUI = (role: string) => {
    const isFaculty = role === "FACULTY";
    const Icon = isFaculty ? GraduationCap : UserIcon;
    return (
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border"
        style={{
          background: isFaculty ? 'var(--primary-light)' : 'var(--muted)',
          color: isFaculty ? 'var(--primary)' : 'var(--muted-foreground)',
          borderColor: isFaculty ? 'var(--primary)' : 'var(--border)'
        }}
      >
        <Icon className="w-3 h-3" />
        {isFaculty ? "Faculty" : "Student"}
      </div>
    );
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Synchronizing...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg text-white shadow-lg" style={{ background: 'var(--primary)' }}>
                <Users className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Staff & Student Directory</h1>
          </div>
          <p className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Global management of institutional personnel</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-xl"
          style={{ background: 'var(--foreground)', color: 'var(--background)' }}
        >
          <RefreshCw className="w-4 h-4" />
          Sync Data
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border shadow-sm flex items-center gap-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Faculty Members</p>
            <p className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>{stats.faculty}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl border shadow-sm flex items-center gap-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Enrolled Students</p>
            <p className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>{stats.students}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl shadow-xl flex items-center gap-6" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black opacity-70 uppercase tracking-widest">Active Sessions</p>
            <p className="text-3xl font-black">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="p-5 rounded-2xl border shadow-sm space-y-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder="Filter by name, email or college code..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-11 pr-4 py-3 border-transparent rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select
              value={filters.college}
              onChange={(e) => setFilters({ ...filters, college: e.target.value })}
              className="px-4 py-3 border-none rounded-xl text-xs font-bold transition-all"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              <option value="ALL">All Colleges</option>
              {colleges.map((c) => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
            </select>

            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-4 py-3 border-none rounded-xl text-xs font-bold transition-all"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              <option value="ALL">All Roles</option>
              <option value="FACULTY">Faculty</option>
              <option value="USER">Students</option>
            </select>

            <button 
              onClick={() => setFilters({ search: "", college: "ALL", role: "ALL", status: "ALL" })}
              className="p-3 rounded-xl transition-colors hover:opacity-70"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
            Showing {filteredUsers.length} of {users.length} Records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-lg transition-all"
              style={{
                background: viewMode === "list" ? 'var(--primary)' : 'var(--muted)',
                color: viewMode === "list" ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
              }}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className="p-2 rounded-lg transition-all"
              style={{
                background: viewMode === "card" ? 'var(--primary)' : 'var(--muted)',
                color: viewMode === "card" ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
              }}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DIRECTORY - LIST VIEW */}
      {viewMode === "list" && (
        <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Identity</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Affiliation</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Designation</th>
                <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Management</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                     <div className="flex flex-col items-center opacity-20">
                        <ShieldAlert className="w-12 h-12 mb-2" />
                        <p className="font-black uppercase tracking-tighter">No Personnel Matches</p>
                     </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-[var(--muted)] transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl text-white flex items-center justify-center font-black text-sm shadow-lg" style={{ background: 'var(--gradient-primary)' }}>
                          {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black" style={{ color: 'var(--foreground)' }}>{user.name || "System User"}</p>
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{user.collegeName || "Independent"}</p>
                          <p className="text-[10px] font-mono uppercase" style={{ color: 'var(--muted-foreground)' }}>{user.collegeCode || "---"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">{getRoleUI(user.type)}</td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-1 font-bold text-[10px] uppercase" style={{ color: user.isActive ? 'var(--success)' : 'var(--muted-foreground)' }}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'animate-pulse' : ''}`} style={{ background: user.isActive ? 'var(--success)' : 'var(--muted-foreground)' }} />
                        {user.isActive ? "Active" : "Locked"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2.5 rounded-xl transition-all hover:shadow-md"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DIRECTORY - CARD VIEW */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full rounded-3xl border shadow-sm p-20" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex flex-col items-center opacity-20">
                <ShieldAlert className="w-12 h-12 mb-2" />
                <p className="font-black uppercase tracking-tighter">No Personnel Matches</p>
              </div>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="group rounded-3xl border shadow-sm hover:shadow-xl transition-all p-6 space-y-4"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                {/* User Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-lg shadow-lg" style={{ background: 'var(--gradient-primary)' }}>
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-black" style={{ color: 'var(--foreground)' }}>{user.name || "System User"}</p>
                      <div className="inline-flex items-center gap-1 font-bold text-[10px] uppercase mt-1" style={{ color: user.isActive ? 'var(--success)' : 'var(--muted-foreground)' }}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'animate-pulse' : ''}`} style={{ background: user.isActive ? 'var(--success)' : 'var(--muted-foreground)' }} />
                        {user.isActive ? "Active" : "Locked"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 rounded-lg transition-all hover:bg-[var(--primary-light)]"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* User Details */}
                <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{user.collegeName || "Independent"}</p>
                      <p className="text-[10px] font-mono uppercase" style={{ color: 'var(--muted-foreground)' }}>{user.collegeCode || "---"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    {getRoleUI(user.type)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-2" style={{ color: 'var(--muted-foreground)' }}>
         <p>Secure Management Console v2.1</p>
      </div>
    </div>
  );
};

export default UserManagementPage;