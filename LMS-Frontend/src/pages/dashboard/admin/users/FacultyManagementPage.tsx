import React, { useEffect, useState } from "react";
import { userApi, userManagementApi, type UserResponse } from "../../../../services/authApi";
import { useAppSelector } from "../../../../app/hooks";
import { useCollegeTheme } from "../../../../hooks/useCollegeTheme";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";

interface CreateFacultyForm {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  bio?: string;
}

const FacultyManagementPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { applyTheme } = useCollegeTheme();
  const [faculty, setFaculty] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const [formData, setFormData] = useState<CreateFacultyForm>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    bio: "",
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getFaculty();
      if (response.success && response.data) {
        // Transform nested college object if likely returned from generic list
        const processedList = response.data.map((f: any) => {
          if (f.college && !f.collegeId) {
            return {
              ...f,
              collegeId: f.college.id,
              collegeName: f.college.name,
              collegeCode: f.college.code
            };
          }
          return f;
        });

        // Filter by college if admin
        let facultyList = processedList;
        if (user?.type === "ADMIN" && user.collegeId) {
          facultyList = facultyList.filter((f) => f.collegeId === user.collegeId);
        }
        setFaculty(facultyList);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load faculty");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await userManagementApi.createFaculty({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        collegeId: user?.collegeId,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
      });

      if (response.success) {
        setSuccess("Faculty member created successfully");
        setShowForm(false);
        resetForm();
        setTimeout(() => {
          fetchFaculty();
        }, 100);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create faculty");
    }
  };

  const handleToggleStatus = async (facultyId: number) => {
    try {
      const response = await userManagementApi.toggleUserStatus(facultyId);
      if (response.success) {
        setSuccess("Faculty status updated");
        fetchFaculty();
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (facultyId: number) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) {
      return;
    }

    try {
      await userManagementApi.deleteUser(facultyId);
      setSuccess("Faculty member deleted");
      fetchFaculty();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete faculty");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      bio: "",
    });
  };

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Users className="w-8 h-8 text-primary" />
            Faculty Management
          </h1>
          <p className="text-text-secondary mt-1">
            Manage teaching staff for your institution
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Cancel" : "Add Faculty"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}>
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
          <button onClick={() => setSuccess(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="text-3xl font-bold text-text">{faculty.length}</div>
          <div className="text-sm text-text-secondary">Total Faculty</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="text-3xl font-bold text-green-600">
            {faculty.filter((f) => f.isActive).length}
          </div>
          <div className="text-sm text-text-secondary">Active</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="text-3xl font-bold text-red-600">
            {faculty.filter((f) => !f.isActive).length}
          </div>
          <div className="text-sm text-text-secondary">Inactive</div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-text mb-4">Add New Faculty Member</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Dr. John Doe"
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
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="faculty@college.edu"
              />
            </div>
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
                placeholder="Brief description, qualifications, etc."
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-2 border border-border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary font-medium"
              >
                Create Faculty
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Faculty List */}
      <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                  Faculty Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {filteredFaculty.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-text">{f.name}</div>
                    {f.bio && (
                      <div className="text-sm text-text-secondary truncate max-w-xs">
                        {f.bio}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm text-text-secondary">
                        <Mail className="w-3.5 h-3.5" />
                        {f.email}
                      </div>
                      {f.phoneNumber && (
                        <div className="flex items-center gap-1 text-sm text-text-secondary">
                          <Phone className="w-3.5 h-3.5" />
                          {f.phoneNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        f.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {f.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(f.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          f.isActive
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={f.isActive ? "Deactivate" : "Activate"}
                      >
                        {f.isActive ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                      <button onClick={() => handleDelete(f.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
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
      {filteredFaculty.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-border mt-6">
          <Users className="w-16 h-16 mx-auto text-text-secondary opacity-50 mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">No faculty found</h3>
          <p className="text-text-secondary">
            {searchTerm ? "Try adjusting your search" : "Add your first faculty member"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FacultyManagementPage;
