import React, { useEffect, useState } from "react";
import { userApi, userManagementApi, type UserResponse } from "../../../services/authApi";
import { collegeApi } from "../../../services/collegeApi";
import type { College } from "../../../types";
import {
  ShieldCheck, Plus, Search, Phone,
  Building2, CheckCircle, XCircle,
  Trash2, UserPlus, X, AlertCircle, Edit, BarChart3
} from "lucide-react";

interface CreateAdminForm {
  name: string;
  email: string;
  password: string;
  collegeId: number | null;
  phoneNumber?: string;
  bio?: string;
}

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<UserResponse[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<string>("ALL");

  const [formData, setFormData] = useState<CreateAdminForm>({
    name: "",
    email: "",
    password: "",
    collegeId: null,
    phoneNumber: "",
    bio: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, collegesRes] = await Promise.all([
        userApi.getAllUsers(),
        collegeApi.getAllColleges(),
      ]);

      if (usersRes.success && usersRes.data) {
        const adminUsers = usersRes.data
          .filter((u) => u.type === "ADMIN")
          .map((admin: any) => {
            // Transform nested college object to flat properties
            if (admin.college && !admin.collegeId) {
              return {
                ...admin,
                collegeId: admin.college.id,
                collegeName: admin.college.name,
                collegeCode: admin.college.code
              };
            }
            return admin;
          });
        console.log("📊 Fetched admins:", adminUsers);
        setAdmins(adminUsers);
      }

      if (collegesRes.success && collegesRes.data) {
        setColleges(collegesRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.collegeId) {
      setError("Please select a college");
      return;
    }

    console.log("📝 Submitting form:", { 
      mode: editMode ? 'UPDATE' : 'CREATE',
      adminId: editingAdminId,
      formData 
    });

    try {
      if (editMode && editingAdminId) {
        // Update existing admin
        console.log(`🔄 Updating admin ${editingAdminId} with collegeId:`, formData.collegeId);
        
        const response = await userManagementApi.updateUser(editingAdminId, {
          name: formData.name,
          collegeId: formData.collegeId,
          phoneNumber: formData.phoneNumber,
          bio: formData.bio,
        });

        console.log("✅ Update response:", response);

        if (response.success && response.data) {
          console.log("📋 Updated admin data:", response.data);
          console.log("🏛️ College info in response:", {
            collegeId: response.data.collegeId,
            collegeName: response.data.collegeName,
            collegeCode: response.data.collegeCode
          });

          // Update the admin in local state immediately with the response data
          setAdmins(prevAdmins => 
            prevAdmins.map(admin => 
              admin.id === editingAdminId ? response.data! : admin
            )
          );

          setSuccess(`Admin updated successfully and assigned to ${colleges.find(c => c.id === formData.collegeId)?.name}`);
          setError(null);
          setShowForm(false);
          setEditMode(false);
          setEditingAdminId(null);
          resetForm();
          // Also refresh from backend to ensure consistency
          setTimeout(() => {
            fetchData();
          }, 200);
          setTimeout(() => setSuccess(null), 5000);
        }
      } else {
        // Create new admin
        console.log("➕ Creating new admin with collegeId:", formData.collegeId);
        
        const response = await userManagementApi.createAdmin({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          collegeId: formData.collegeId,
          phoneNumber: formData.phoneNumber,
          bio: formData.bio,
        });

        console.log("✅ Create response:", response);

        if (response.success && response.data) {
          console.log("📋 Created admin data:", response.data);
          console.log("🏛️ College info in response:", {
            collegeId: response.data.collegeId,
            collegeName: response.data.collegeName,
            collegeCode: response.data.collegeCode
          });

          // Add the new admin to local state immediately
          setAdmins(prevAdmins => [...prevAdmins, response.data!]);

          setSuccess(`Admin created successfully and assigned to ${colleges.find(c => c.id === formData.collegeId)?.name}`);
          setShowForm(false);
          resetForm();
          // Also refresh from backend to ensure consistency
          setTimeout(() => {
            fetchData();
          }, 200);
          setTimeout(() => setSuccess(null), 5000);
        }
      }
    } catch (err: any) {
      console.error("❌ Error:", err);
      setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} admin`);
    }
  };

  const handleEdit = (admin: UserResponse) => {
    setEditMode(true);
    setEditingAdminId(admin.id);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "", // Don't populate password
      collegeId: admin.collegeId || null,
      phoneNumber: admin.phoneNumber || "",
      bio: admin.bio || "",
    });
    setShowForm(true);
    setError(null);
  };

  const handleToggleStatus = async (adminId: number) => {
    try {
      const response = await userManagementApi.toggleUserStatus(adminId);
      if (response.success) {
        setSuccess("Admin status updated");
        fetchData();
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update admin status");
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (!window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
      return;
    }

    try {
      await userManagementApi.deleteUser(adminId);
      setSuccess("Admin deleted successfully");
      fetchData();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete admin");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      collegeId: null,
      phoneNumber: "",
      bio: "",
    });
    setEditMode(false);
    setEditingAdminId(null);
  };

  // Get colleges without admins
  const availableColleges = colleges.filter(
    (c) => c.isActive && !admins.some((a) => a.collegeId === c.id)
  );

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.collegeName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCollege =
      selectedCollege === "ALL" ||
      (selectedCollege === "UNASSIGNED" && !admin.collegeId) ||
      admin.collegeId?.toString() === selectedCollege;

    return matchesSearch && matchesCollege;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

      {/* HERO SECTION */}
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

        <div className="relative flex flex-col lg:flex-row justify-between gap-6">

          <div className="flex-1">
            <h1 className="text-4xl font-black heading-font bg-gradient-to-r from-[var(--foreground)] to-[var(--muted-foreground)] bg-clip-text text-transparent">
              Admin Management
            </h1>
            <p className="text-[var(--muted-foreground)] mt-3 text-lg">
              Manage college administrators across the entire LMS platform
            </p>

            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ background: 'var(--success)', color: 'white', opacity: 0.9 }}>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                System Online
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                {admins.length} total admins • {admins.filter(a => a.isActive).length} active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <button
              onClick={() => {
                console.log("🔄 Manual refresh triggered");
                fetchData();
              }}
              className="group relative px-6 py-3 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10 overflow-hidden"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
              title="Refresh data from server"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2 text-sm font-medium">
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </div>
            </button>

            <button
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
              disabled={availableColleges.length === 0 && !showForm && !editMode}
              className="group relative px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              style={{ background: "var(--primary)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                {showForm ? "Cancel" : "Create Admin"}
              </div>
            </button>

          </div>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="group relative rounded-xl border p-4 overflow-hidden"
             style={{
               background: "rgba(239, 68, 68, 0.05)",
               borderColor: "var(--error)",
             }}>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <AlertCircle className="w-5 h-5" style={{ color: 'var(--error)' }} />
              </div>
              <span className="font-medium" style={{ color: 'var(--error)' }}>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--error)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="group relative rounded-xl border p-4 overflow-hidden"
             style={{
               background: "rgba(34, 197, 94, 0.05)",
               borderColor: "var(--success)",
             }}>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />
              </div>
              <span className="font-medium" style={{ color: 'var(--success)' }}>{success}</span>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="p-1 rounded-lg transition-colors"
              style={{ color: 'var(--success)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW */}
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
          System Overview
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Total Admins */}
          <div
            className="group relative rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10 overflow-hidden"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <ShieldCheck className="w-full h-full" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-lg text-white shadow-md group-hover:scale-110 transition-transform duration-300"
                  style={{ background: "var(--primary)" }}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold group-hover:text-[var(--primary)] transition-colors duration-300">
                    {admins.length}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] font-medium">Total Admins</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Active</span>
                  <span className="font-medium text-green-600">
                    {admins.filter(a => a.isActive).length}
                  </span>
                </div>
                <div className="w-full bg-[var(--muted)] rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: admins.length > 0 ? `${(admins.filter(a => a.isActive).length / admins.length) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Admins */}
          <div
            className="group relative rounded-xl border p-6 transition-all duration-300 hover:shadow-lg overflow-hidden"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <CheckCircle className="w-full h-full" style={{ color: 'var(--success)' }} />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300" style={{ background: 'var(--success)', color: 'white' }}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--success)' }}>
                    {admins.filter(a => a.isActive).length}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] font-medium">Active</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">of total</span>
                  <span className="font-medium">
                    {admins.length > 0 ? Math.round((admins.filter(a => a.isActive).length / admins.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-[var(--muted)] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      background: 'var(--success)',
                      width: admins.length > 0 ? `${(admins.filter(a => a.isActive).length / admins.length) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Inactive Admins */}
          <div
            className="group relative rounded-xl border p-6 transition-all duration-300 hover:shadow-lg overflow-hidden"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <XCircle className="w-full h-full" style={{ color: 'var(--error)' }} />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300" style={{ background: 'var(--error)', color: 'white' }}>
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--error)' }}>
                    {admins.filter(a => !a.isActive).length}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] font-medium">Inactive</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">of total</span>
                  <span className="font-medium">
                    {admins.length > 0 ? Math.round((admins.filter(a => !a.isActive).length / admins.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-[var(--muted)] rounded-full h-1.5">
                  <div
                    className="bg-red-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: admins.length > 0 ? `${(admins.filter(a => !a.isActive).length / admins.length) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Available Colleges */}
          <div
            className="group relative rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <Building2 className="w-full h-full text-purple-500" />
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors duration-300">
                    {availableColleges.length}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] font-medium">Available</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Colleges</span>
                  <span className="font-medium">
                    {colleges.filter(c => c.isActive).length} total
                  </span>
                </div>
                <div className="w-full bg-[var(--muted)] rounded-full h-1.5">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: colleges.filter(c => c.isActive).length > 0 ? `${(availableColleges.length / colleges.filter(c => c.isActive).length) * 100}%` : '0%',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Message if no colleges available */}
      {availableColleges.length === 0 && !showForm && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">
            All active colleges have been assigned admins. Onboard new colleges to create more admins.
          </p>
        </div>
      )}

      {/* SEARCH & FILTERS */}
      <div
        className="rounded-xl border p-6"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex flex-col lg:flex-row gap-4">

          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-[var(--muted-foreground)]" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-[var(--muted-foreground)]" />
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 min-w-48"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <option value="ALL">All Colleges</option>
              <option value="UNASSIGNED">Unassigned</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCollege !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCollege("ALL");
              }}
              className="px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}

        </div>

        {/* Filter Summary */}
        {(searchTerm || selectedCollege !== "ALL") && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
              <span>Showing {filteredAdmins.length} of {admins.length} admins</span>
              {searchTerm && (
                <span className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  "{searchTerm}"
                </span>
              )}
              {selectedCollege !== "ALL" && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {selectedCollege === "UNASSIGNED"
                    ? "Unassigned"
                    : colleges.find(c => c.id.toString() === selectedCollege)?.name
                  }
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CREATE/EDIT FORM */}
      {showForm && (
        <div
          className="rounded-xl border p-8"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-3 rounded-lg text-white shadow-md"
              style={{ background: "var(--primary)" }}
            >
              {editMode ? <Edit className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {editMode ? "Edit Admin" : "Create New Admin"}
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                {editMode
                  ? "Update admin information and college assignment"
                  : "Add a new college administrator to the system"
                }
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                  placeholder="John Doe"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={editMode}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 disabled:bg-[var(--muted)] disabled:cursor-not-allowed"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                  placeholder="admin@example.com"
                />
                {editMode && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Email cannot be changed after creation
                  </p>
                )}
              </div>

              {/* Password Field (Create only) */}
              {!editMode && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                    placeholder="••••••••"
                  />
                </div>
              )}

              {/* College Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  College Assignment *
                  {editMode && (
                    <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Can reassign
                    </span>
                  )}
                </label>
                <select
                  required
                  value={formData.collegeId || ""}
                  onChange={(e) => {
                    const collegeId = Number(e.target.value);
                    setFormData({ ...formData, collegeId });
                    console.log("🏛️ College selected:", {
                      collegeId,
                      collegeName: colleges.find(c => c.id === collegeId)?.name
                    });
                  }}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 ${
                    formData.collegeId
                      ? 'border-green-300 bg-green-50/50'
                      : ''
                  }`}
                  style={{
                    background: "var(--surface)",
                    borderColor: formData.collegeId ? '#86efac' : "var(--border)",
                  }}
                >
                  <option value="">
                    {editMode
                      ? "Select College (All available)"
                      : availableColleges.length === 0
                        ? "No colleges available"
                        : "Choose a college"}
                  </option>
                  {editMode ? (
                    colleges.filter(c => c.isActive).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) {c.id === formData.collegeId && "✓ Current"}
                      </option>
                    ))
                  ) : (
                    availableColleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))
                  )}
                </select>
                {formData.collegeId && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">
                      Selected: {colleges.find(c => c.id === formData.collegeId)?.name}
                    </span>
                  </div>
                )}
                {!editMode && availableColleges.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>All active colleges have admins assigned. Create a new college first.</span>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                  placeholder="+1 234 567 8900"
                />
              </div>

            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[var(--foreground)]">
                Bio / Additional Information
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200 resize-none"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
                rows={4}
                placeholder="Brief description or additional information about this admin..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-3 rounded-lg border hover:bg-[var(--muted)] transition-all duration-200 font-medium"
                style={{
                  borderColor: "var(--border)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[var(--primary)]/25"
                style={{ background: "var(--primary)" }}
              >
                {editMode ? "Update Admin" : "Create Admin"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ADMINS LIST */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
            Administrators
          </h2>
          <div className="text-sm text-[var(--muted-foreground)]">
            {filteredAdmins.length} of {admins.length} admins
          </div>
        </div>

        {filteredAdmins.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl border-2 border-dashed"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--muted)]/50 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              {searchTerm || selectedCollege !== "ALL" ? "No admins found" : "No administrators yet"}
            </h3>
            <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
              {searchTerm || selectedCollege !== "ALL"
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : "Get started by creating your first college administrator to manage the LMS system."
              }
            </p>
            {(!searchTerm && selectedCollege === "ALL") && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[var(--primary)]/25"
                style={{ background: "var(--primary)" }}
              >
                <Plus className="w-4 h-4" />
                Create First Admin
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="group relative rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--primary)]/10 hover:-translate-y-1 overflow-hidden"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                  <ShieldCheck className="w-full h-full" />
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: admin.isActive ? 'var(--success)' : 'var(--error)',
                      color: 'white',
                      opacity: 0.9
                    }}
                  >
                    {admin.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>

                <div className="relative">

                  {/* Avatar and Basic Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-lg shadow-md"
                      style={{ background: "var(--primary)" }}
                    >
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-300 truncate">
                        {admin.name}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] truncate">
                        {admin.email}
                      </p>
                    </div>
                  </div>

                  {/* College Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">College</span>
                    </div>
                    {admin.collegeName ? (
                      <div className="bg-[var(--surface)] rounded-lg p-3 border border-[var(--border)]">
                        <p className="font-medium text-[var(--foreground)]">
                          {admin.collegeName}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] font-mono">
                          {admin.collegeCode}
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--error)', color: 'var(--error)' }}>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Not assigned
                        </p>
                        {admin.collegeId && (
                          <p className="text-xs mt-1">
                            ID: {admin.collegeId}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  {admin.phoneNumber && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
                        <Phone className="w-4 h-4" />
                        <span className="font-medium">Contact</span>
                      </div>
                      <p className="text-sm text-[var(--foreground)]">
                        {admin.phoneNumber}
                      </p>
                    </div>
                  )}

                  {/* Bio */}
                  {admin.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                        {admin.bio}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <span>ID: {admin.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{ color: 'var(--info)' }}
                        title="Edit Admin"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(admin.id)}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{
                          color: admin.isActive ? 'var(--error)' : 'var(--success)'
                        }}
                        title={admin.isActive ? "Deactivate" : "Activate"}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = admin.isActive
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(34, 197, 94, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {admin.isActive ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        style={{ color: 'var(--error)' }}
                        title="Delete Admin"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
