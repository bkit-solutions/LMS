import React, { useEffect, useState } from "react";
import { collegeApi } from "../../../services/collegeApi";
import type { College, CreateCollegeRequest, CollegeStatistics } from "../../../types";
import { 
  Building2, Plus, Search, 
  Users, BookOpen, Globe,
  CheckCircle, XCircle, Eye, Upload, X, Edit2,
  TrendingUp, UserCheck, GraduationCap, FileText, Link as LinkIcon, Copy
} from "lucide-react";

const EnhancedCollegeManagement: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCollegeId, setEditingCollegeId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [collegeStats, setCollegeStats] = useState<CollegeStatistics | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<number | null>(null);

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
      if (editMode && editingCollegeId) {
        const response = await collegeApi.updateCollege(editingCollegeId, formData);
        if (response.success) {
          setSuccess("College updated successfully!");
          setShowForm(false);
          resetForm();
          fetchColleges();
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        const response = await collegeApi.createCollege(formData);
        if (response.success) {
          setSuccess("College created successfully!");
          setShowForm(false);
          resetForm();
          fetchColleges();
          setTimeout(() => setSuccess(null), 3000);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save college");
    }
  };

  const handleEdit = (college: College) => {
    setEditMode(true);
    setEditingCollegeId(college.id);
    setFormData({
      name: college.name,
      code: college.code,
      description: college.description || "",
      primaryColor: college.primaryColor || "#dc2626",
      secondaryColor: college.secondaryColor || "#991b1b",
      contactEmail: college.contactEmail || "",
      contactPhone: college.contactPhone || "",
      domain: college.domain || "",
      address: college.address || "",
      logoUrl: college.logoUrl,
      bannerUrl: college.bannerUrl,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ 
      name: "", code: "", description: "", 
      primaryColor: "#dc2626", secondaryColor: "#991b1b", 
      contactEmail: "", contactPhone: "", domain: "", address: "" 
    });
    setEditMode(false);
    setEditingCollegeId(null);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await collegeApi.toggleCollegeStatus(id);
      fetchColleges();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleViewStats = async (college: College) => {
    try {
      setSelectedCollege(college);
      setShowStatsModal(true);
      const response = await collegeApi.getCollegeStatistics(college.id);
      if (response.success && response.data) {
        setCollegeStats(response.data);
      }
    } catch (err: any) {
      setError("Failed to load statistics");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const response = await collegeApi.uploadLogo(file);
      if (response.success && response.data) {
        setFormData({ ...formData, logoUrl: response.data });
        setSuccess('Logo uploaded successfully!');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setUploadingBanner(true);
      const response = await collegeApi.uploadBanner(file);
      if (response.success && response.data) {
        setFormData({ ...formData, bannerUrl: response.data });
        setSuccess('Banner uploaded successfully!');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  const copyLoginUrl = (college: College) => {
    const url = `${window.location.origin}/login/${college.code}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(college.id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Filter Logic
  const filteredColleges = colleges.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.domain && c.domain.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === "ALL" || 
      (filterStatus === "ACTIVE" && c.isActive) || 
      (filterStatus === "INACTIVE" && !c.isActive);
    
    return matchesSearch && matchesStatus;
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
            <Building2 className="w-8 h-8 text-primary" />
            College Management
          </h1>
          <p className="text-text-secondary mt-1">Onboard and manage colleges across the platform</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-secondary transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {showForm ? "Cancel" : "Onboard College"}
        </button>
      </div>

      {/* Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Colleges</p>
              <p className="text-2xl font-bold text-text">{colleges.length}</p>
            </div>
            <Building2 className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {colleges.filter(c => c.isActive).length}
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
                {colleges.filter(c => !c.isActive).length}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Users</p>
              <p className="text-2xl font-bold text-text">
                {colleges.reduce((sum, c) => sum + c.totalUsers, 0)}
              </p>
            </div>
            <Users className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, code, or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "ALL" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("ACTIVE")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "ACTIVE" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("INACTIVE")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "INACTIVE" 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
            {editMode ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            {editMode ? "Edit College" : "Onboard New College"}
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
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

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Brief description about the college..."
              />
            </div>

            {/* Contact Info */}
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
                placeholder="contact@college.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Complete address"
              />
            </div>

            {/* Branding */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">College Logo</label>
              <div className="flex items-start gap-3">
                <label className="flex-1 border-2 border-dashed border-border rounded-lg px-4 py-3 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                  <Upload className={`w-5 h-5 mx-auto mb-1 ${uploadingLogo ? 'text-primary animate-pulse' : 'text-text-secondary'}`} />
                  <span className="text-sm text-text-secondary block">
                    {uploadingLogo ? "Uploading..." : formData.logoUrl ? "Change Logo" : "Upload Logo"}
                  </span>
                  <span className="text-xs text-text-secondary opacity-75 block mt-1">
                    Max 10MB, recommended 200x200px
                  </span>
                </label>
                {formData.logoUrl && (
                  <div className="relative group">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo Preview" 
                      className="w-20 h-20 object-contain rounded-lg border-2 border-border shadow-sm" 
                      onError={(e) => {
                        console.error('Logo failed to load:', formData.logoUrl);
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ELogo%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: undefined })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">College Banner</label>
              <div className="flex items-start gap-3">
                <label className="flex-1 border-2 border-dashed border-border rounded-lg px-4 py-3 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    disabled={uploadingBanner}
                  />
                  <Upload className={`w-5 h-5 mx-auto mb-1 ${uploadingBanner ? 'text-primary animate-pulse' : 'text-text-secondary'}`} />
                  <span className="text-sm text-text-secondary block">
                    {uploadingBanner ? "Uploading..." : formData.bannerUrl ? "Change Banner" : "Upload Banner"}
                  </span>
                  <span className="text-xs text-text-secondary opacity-75 block mt-1">
                    Max 10MB, recommended 1200x400px
                  </span>
                </label>
                {formData.bannerUrl && (
                  <div className="relative group">
                    <img 
                      src={formData.bannerUrl} 
                      alt="Banner Preview" 
                      className="w-32 h-20 object-cover rounded-lg border-2 border-border shadow-sm" 
                      onError={(e) => {
                        console.error('Banner failed to load:', formData.bannerUrl);
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EBanner%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, bannerUrl: undefined })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      title="Remove banner"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <span className="text-sm text-text-secondary font-mono">{formData.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <span className="text-sm text-text-secondary font-mono">{formData.secondaryColor}</span>
              </div>
            </div>

            {/* Actions */}
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
                {editMode ? "Update College" : "Onboard College"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleges.map((college) => (
          <div key={college.id} className="bg-white rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Header with color bar */}
            <div
              className="h-2"
              style={{ backgroundColor: college.primaryColor || "#dc2626" }}
            />
            
            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {college.logoUrl ? (
                      <img 
                        src={college.logoUrl} 
                        alt={college.name} 
                        className="w-10 h-10 object-contain rounded border border-border"
                        onError={(e) => {
                          console.error('College logo failed to load:', college.logoUrl);
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.nextElementSibling;
                          if (placeholder) placeholder.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center ${college.logoUrl ? 'hidden' : ''}`}>
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text leading-tight">{college.name}</h3>
                      <span className="text-xs font-mono bg-gray-100 text-text-secondary px-2 py-0.5 rounded mt-1 inline-block">
                        {college.code}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    college.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {college.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {college.description && (
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {college.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">{college.totalUsers} users</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-text-secondary" />
                  <span className="text-text-secondary">{college.totalCourses} courses</span>
                </div>
              </div>

              {/* Contact Info */}
              {college.domain && (
                <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="truncate">{college.domain}</span>
                </div>
              )}

              {/* Login URL */}
              <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="text-xs font-mono text-blue-700 truncate">
                      /login/{college.code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyLoginUrl(college)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition-colors"
                    title="Copy login URL"
                  >
                    {copiedUrl === college.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={() => handleEdit(college)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleViewStats(college)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Stats
                </button>
                <button
                  onClick={() => handleToggleStatus(college.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    college.isActive
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {college.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {college.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredColleges.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-lg border border-border">
          <Building2 className="w-16 h-16 mx-auto text-text-secondary opacity-50 mb-4" />
          <h3 className="text-xl font-semibold text-text mb-2">No colleges found</h3>
          <p className="text-text-secondary mb-4">
            {searchTerm || filterStatus !== "ALL" 
              ? "Try adjusting your search or filters" 
              : "Get started by onboarding your first college"}
          </p>
          {!searchTerm && filterStatus === "ALL" && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Onboard College
            </button>
          )}
        </div>
      )}

      {/* Statistics Modal */}
      {showStatsModal && selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-text">{selectedCollege.name}</h2>
                <p className="text-sm text-text-secondary">College Statistics & Analytics</p>
              </div>
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setCollegeStats(null);
                  setSelectedCollege(null);
                }}
                className="text-text-secondary hover:text-text"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {collegeStats ? (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <Users className="w-8 h-8 text-blue-600 mb-2" />
                      <p className="text-sm text-blue-900 font-medium">Total Users</p>
                      <p className="text-2xl font-bold text-blue-600">{collegeStats.totalUsers}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <BookOpen className="w-8 h-8 text-green-600 mb-2" />
                      <p className="text-sm text-green-900 font-medium">Courses</p>
                      <p className="text-2xl font-bold text-green-600">{collegeStats.totalCourses}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <FileText className="w-8 h-8 text-purple-600 mb-2" />
                      <p className="text-sm text-purple-900 font-medium">Tests</p>
                      <p className="text-2xl font-bold text-purple-600">{collegeStats.totalTests}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
                      <p className="text-sm text-orange-900 font-medium">Enrollments</p>
                      <p className="text-2xl font-bold text-orange-600">{collegeStats.totalEnrollments}</p>
                    </div>
                  </div>

                  {/* User Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-text mb-4">User Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">Admins</p>
                          <p className="text-xl font-bold text-text">{collegeStats.totalAdmins}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">Faculty</p>
                          <p className="text-xl font-bold text-text">{collegeStats.totalFaculty}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-text-secondary">Students</p>
                          <p className="text-xl font-bold text-text">{collegeStats.totalStudents}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Status */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-text mb-4">Activity Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-border">
                        <span className="text-text-secondary">Active Users</span>
                        <span className="text-lg font-bold text-green-600">{collegeStats.activeUsers}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-border">
                        <span className="text-text-secondary">Inactive Users</span>
                        <span className="text-lg font-bold text-red-600">{collegeStats.inactiveUsers}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCollegeManagement;
