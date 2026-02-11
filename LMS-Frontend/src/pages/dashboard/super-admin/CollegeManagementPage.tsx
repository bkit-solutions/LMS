import React, { useEffect, useState } from "react";
import { collegeApi } from "../../../services/collegeApi";
import type { College, CreateCollegeRequest } from "../../../types";

const CollegeManagementPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<CreateCollegeRequest>({
    name: "",
    code: "",
    description: "",
    primaryColor: "#dc2626",
    secondaryColor: "#991b1b",
    contactEmail: "",
    contactPhone: "",
    domain: "",
    address: "",
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await collegeApi.getAllColleges();
      if (response.success && response.data) {
        setColleges(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await collegeApi.createCollege(formData);
      if (response.success) {
        setShowForm(false);
        setFormData({ name: "", code: "", description: "", primaryColor: "#dc2626", secondaryColor: "#991b1b", contactEmail: "", contactPhone: "", domain: "", address: "" });
        fetchColleges();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create college");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await collegeApi.toggleCollegeStatus(id);
      fetchColleges();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to toggle status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">College Management</h1>
          <p className="text-text-secondary mt-1">Onboard and manage colleges</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
        >
          {showForm ? "Cancel" : "Onboard College"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-text mb-4">Onboard New College</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">College Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., MIT College of Engineering"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">College Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., MITCOE"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Domain</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., mitcoe.edu.in"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-16 rounded cursor-pointer"
                />
                <span className="text-sm text-text-secondary">{formData.primaryColor}</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-primary text-white px-8 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
              >
                Onboard College
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colleges.map((college) => (
          <div key={college.id} className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
            <div
              className="h-3"
              style={{ backgroundColor: college.primaryColor || "#dc2626" }}
            />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text">{college.name}</h3>
                  <span className="text-xs font-mono bg-surface text-text-secondary px-2 py-0.5 rounded">
                    {college.code}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    college.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {college.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {college.description && (
                <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                  {college.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-text-secondary">
                <span>{college.totalUsers} users</span>
                <span>{college.totalCourses} courses</span>
              </div>
              {college.domain && (
                <p className="text-xs text-text-secondary mt-1">Domain: {college.domain}</p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleToggleStatus(college.id)}
                  className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${
                    college.isActive
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {college.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {colleges.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg">No colleges onboarded yet.</p>
          <p className="text-text-secondary text-sm mt-1">Click "Onboard College" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default CollegeManagementPage;
