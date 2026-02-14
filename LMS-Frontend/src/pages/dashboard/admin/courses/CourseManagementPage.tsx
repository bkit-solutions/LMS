import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courseApi } from "@/services/courseApi";
import type { CourseResponse, CreateCourseRequest, DashboardStatsResponse } from "@/types";

const CourseManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = window.location;
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseResponse[]>([]);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(location.pathname.includes('/create'));
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("all");
  const [formData, setFormData] = useState<CreateCourseRequest>({
    title: "",
    courseCode: "",
    description: "",
    category: "",
    department: "",
    semester: "",
    credits: undefined,
    difficultyLevel: "BEGINNER",
    estimatedHours: undefined,
    prerequisites: "",
    learningObjectives: "",
    tags: "",
    published: false,
    enrollmentOpen: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, searchKeyword, filterCategory, filterDifficulty, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, statsRes] = await Promise.all([
        courseApi.getMyCourses(),
        courseApi.getDashboardStats(),
      ]);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...courses];
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(kw) ||
          c.description?.toLowerCase().includes(kw) ||
          c.tags?.toLowerCase().includes(kw)
      );
    }
    if (filterCategory) result = result.filter((c) => c.category === filterCategory);
    if (filterDifficulty) result = result.filter((c) => c.difficultyLevel === filterDifficulty);
    if (filterStatus === "PUBLISHED") result = result.filter((c) => c.status === "PUBLISHED" || c.published);
    if (filterStatus === "DRAFT") result = result.filter((c) => c.status === "DRAFT" || (!c.published && c.status !== "ARCHIVED"));
    if (filterStatus === "ARCHIVED") result = result.filter((c) => c.status === "ARCHIVED");
    setFilteredCourses(result);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await courseApi.createCourse(formData);
      if (response.success) {
        setShowForm(false);
        setFormData({
          title: "",
          courseCode: "",
          description: "",
          category: "",
          department: "",
          semester: "",
          credits: undefined,
          difficultyLevel: "BEGINNER",
          estimatedHours: undefined,
          maxEnrollment: undefined,
          prerequisites: "",
          learningObjectives: "",
          tags: "",
          published: false,
          enrollmentOpen: true,
        });
        setSuccess("Course created successfully!");
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
        // Navigate back to courses list if on /create route
        if (location.pathname.includes('/create')) {
          navigate(location.pathname.replace('/create', ''));
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create course");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      await courseApi.deleteCourse(id);
      setSuccess("Course deleted successfully");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handleTogglePublish = async (course: CourseResponse) => {
    try {
      if (course.published) {
        await courseApi.unpublishCourse(course.id);
      } else {
        await courseApi.publishCourse(course.id);
      }
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update course");
    }
  };

  const handleToggleEnrollment = async (course: CourseResponse) => {
    try {
      await courseApi.toggleEnrollment(course.id, !course.enrollmentOpen);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to toggle enrollment");
    }
  };

  const handleClone = async (id: number) => {
    try {
      await courseApi.cloneCourse(id);
      setSuccess("Course cloned successfully!");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to clone course");
    }
  };

  const categories = [...new Set(courses.map((c) => c.category).filter(Boolean))] as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] heading-font">Course Management</h1>
          <p className="text-[var(--muted-foreground)] mt-1">Create, manage, and organize your courses</p>
        </div>
        <button
          onClick={() => {
            if (showForm && location.pathname.includes('/create')) {
              navigate(location.pathname.replace('/create', ''));
            }
            setShowForm(!showForm);
          }}
          className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors font-medium shadow-md"
        >
          {showForm ? "Cancel" : "+ Create Course"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-[var(--primary)]">{stats.totalCourses}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Total Courses</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-[var(--success)]">{stats.publishedCourses}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Published</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-[var(--warning)]">{stats.draftCourses}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Drafts</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-[var(--muted-foreground)]">{stats.archivedCourses || 0}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Archived</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-[var(--info)]">{stats.totalEnrollments}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Enrollments</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-[var(--secondary)]">{stats.totalTopics}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Modules</p>
          </div>
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{stats.totalChapters}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Lessons</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)]"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)]"
          >
            <option value="">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)]"
          >
            <option value="all">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 shadow-md">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Create New Course</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">Course Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent bg-[var(--background)]"
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--muted-foreground)] mb-1">Course Code</label>
              <input
                type="text"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                placeholder="e.g., CS101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Computer Science"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Course description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Difficulty Level</label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Semester</label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Fall 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Credits</label>
              <input
                type="number"
                value={formData.credits || ""}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                min={0}
                placeholder="e.g., 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Estimated Hours</label>
              <input
                type="number"
                value={formData.estimatedHours || ""}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Max Enrollment</label>
              <input
                type="number"
                value={formData.maxEnrollment || ""}
                onChange={(e) => setFormData({ ...formData, maxEnrollment: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                min={1}
                placeholder="Unlimited if empty"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Prerequisites</label>
              <textarea
                value={formData.prerequisites}
                onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={2}
                placeholder="What students need to know before taking this course..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Learning Objectives</label>
              <textarea
                value={formData.learningObjectives}
                onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={2}
                placeholder="What students will learn from this course..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Comma-separated tags, e.g., programming, java, web"
              />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-text">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enrollmentOpen}
                  onChange={(e) => setFormData({ ...formData, enrollmentOpen: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-text">Enrollment Open</span>
              </label>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-8 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
              >
                Create Course
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
          >
            {/* Card Header */}
            <div className="p-5" onClick={() => navigate(`${course.id}`)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-text line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  {course.courseCode && (
                    <span className="text-xs font-mono text-text-secondary">{course.courseCode}</span>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      course.status === "PUBLISHED" || course.published
                        ? "bg-green-100 text-green-800"
                        : course.status === "ARCHIVED"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {course.status || (course.published ? "PUBLISHED" : "DRAFT")}
                  </span>
                  {course.enrollmentOpen && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Open
                    </span>
                  )}
                </div>
              </div>
              {course.description && (
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">{course.description}</p>
              )}

              {/* Meta Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {course.category && (
                  <span className="text-xs bg-surface text-text-secondary px-2 py-0.5 rounded">{course.category}</span>
                )}
                {course.difficultyLevel && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    course.difficultyLevel === "BEGINNER" ? "bg-green-50 text-green-700"
                    : course.difficultyLevel === "INTERMEDIATE" ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
                  }`}>
                    {course.difficultyLevel}
                  </span>
                )}
                {course.estimatedHours && (
                  <span className="text-xs bg-surface text-text-secondary px-2 py-0.5 rounded">
                    {course.estimatedHours}h
                  </span>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-text">{course.topicCount}</span> topics
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-text">{course.testCount}</span> tests
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-medium text-text">{course.enrollmentCount}</span> enrolled
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-border px-5 py-3 bg-gray-50 flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); handleTogglePublish(course); }}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    course.published
                      ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {course.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleEnrollment(course); }}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    course.enrollmentOpen
                      ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {course.enrollmentOpen ? "Close Enrollment" : "Open Enrollment"}
                </button>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); handleClone(course.id); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium"
                >
                  Clone
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-text-secondary text-lg font-medium">
            {searchKeyword || filterCategory || filterDifficulty || filterStatus !== "all"
              ? "No courses match your filters"
              : "No courses created yet"}
          </p>
          <p className="text-text-secondary text-sm mt-1">
            {searchKeyword || filterCategory || filterDifficulty || filterStatus !== "all"
              ? "Try adjusting your search criteria"
              : 'Click "+ Create Course" to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseManagementPage;
