import React, { useEffect, useState } from "react";
import { userApi, userManagementApi, type UserResponse } from "../../../services/authApi";
import { collegeApi } from "../../../services/collegeApi";
import type { College } from "../../../types";
import {
  ShieldCheck, Plus, Search, Phone,
  Building2, CheckCircle, XCircle,
  Trash2, UserPlus, X, AlertCircle, Edit
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Admin Management
          </h1>
          <p className="text-text-secondary mt-1">
            Manage college administrators across the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              console.log("🔄 Manual refresh triggered");
              fetchData();
            }}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            title="Refresh data from server"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
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
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {showForm ? "Cancel" : "Create Admin"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Admins</p>
              <p className="text-2xl font-bold text-text">{admins.length}</p>
            </div>
            <ShieldCheck className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {admins.filter((a) => a.isActive).length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Inactive</p>
              <p className="text-2xl font-bold text-red-600">
                {admins.filter((a) => !a.isActive).length}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Available Colleges</p>
              <p className="text-2xl font-bold text-text">{availableColleges.length}</p>
            </div>
            <Building2 className="w-10 h-10 text-purple-500 opacity-20" />
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

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, email, or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ALL">All Colleges</option>
            <option value="UNASSIGNED">Unassigned</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
            {editMode ? <Edit className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            {editMode ? "Edit Admin" : "Create New Admin"}
          </h2>
          <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={editMode}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="admin@example.com"
              />
            </div>
            {!editMode && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                College *
                {editMode && (
                  <span className="text-xs text-blue-600 font-normal">(Can reassign to any college)</span>
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
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent ${
                  formData.collegeId 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-border'
                }`}
              >
                <option value="">
                  {editMode 
                    ? "Select College (All available)" 
                    : availableColleges.length === 0 
                      ? "No colleges available" 
                      : "Select College"}
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
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Selected: {colleges.find(c => c.id === formData.collegeId)?.name}
                </p>
              )}
              {!editMode && availableColleges.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  All active colleges have admins assigned. Create a new college first.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Brief description..."
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium"
              >
                {editMode ? "Update Admin" : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-text">{admin.name}</div>
                      <div className="text-sm text-text-secondary">{admin.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {admin.collegeName ? (
                      <div>
                        <div className="text-sm font-medium text-text flex items-center gap-2">
                          {admin.collegeName}
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            ID: {admin.collegeId}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary font-mono">
                          {admin.collegeCode}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm text-red-600 italic font-medium">Not assigned</span>
                        {admin.collegeId && (
                          <div className="text-xs text-amber-600 mt-1">
                            ⚠️ Has collegeId: {admin.collegeId} but no name/code
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {admin.phoneNumber && (
                      <div className="flex items-center gap-1 text-sm text-text-secondary">
                        <Phone className="w-3.5 h-3.5" />
                        {admin.phoneNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        admin.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Admin"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(admin.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          admin.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={admin.isActive ? "Deactivate" : "Activate"}
                      >
                        {admin.isActive ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Admin"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAdmins.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-border mt-6">
          <ShieldCheck className="w-16 h-16 mx-auto text-text-secondary opacity-50 mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">No admins found</h3>
          <p className="text-text-secondary">
            {searchTerm || selectedCollege !== "ALL"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first admin"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
