import React, { useEffect, useState } from "react";
import { courseApi } from "@/services/courseApi";
import type { CourseResponse, CreateCourseRequest } from "@/types";

const CourseManagementPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateCourseRequest>({
    title: "",
    description: "",
    category: "",
    difficultyLevel: "BEGINNER",
    estimatedHours: undefined,
    published: false,
    enrollmentOpen: true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getMyCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await courseApi.createCourse(formData);
      if (response.success) {
        setShowForm(false);
        setFormData({ title: "", description: "", category: "", difficultyLevel: "BEGINNER", published: false, enrollmentOpen: true });
        fetchCourses();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create course");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseApi.deleteCourse(id);
      fetchCourses();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handleTogglePublish = async (course: CourseResponse) => {
    try {
      await courseApi.updateCourse(course.id, { published: !course.published });
      fetchCourses();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update course");
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
          <h1 className="text-3xl font-bold text-text">Course Management</h1>
          <p className="text-text-secondary mt-1">Create and manage courses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors font-medium"
        >
          {showForm ? "Cancel" : "Create Course"}
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
          <h2 className="text-xl font-semibold text-text mb-4">Create New Course</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Course Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
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
              <label className="block text-sm font-medium text-text-secondary mb-1">Estimated Hours</label>
              <input
                type="number"
                value={formData.estimatedHours || ""}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                min={1}
              />
            </div>
            <div className="flex items-center gap-6 pt-6">
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
            <div className="md:col-span-2 flex justify-end">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-text line-clamp-1">{course.title}</h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                    course.published
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {course.published ? "Published" : "Draft"}
                </span>
              </div>
              {course.description && (
                <p className="text-sm text-text-secondary mt-2 line-clamp-2">{course.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {course.category && (
                  <span className="text-xs bg-surface text-text-secondary px-2 py-1 rounded">
                    {course.category}
                  </span>
                )}
                {course.difficultyLevel && (
                  <span className="text-xs bg-surface text-text-secondary px-2 py-1 rounded">
                    {course.difficultyLevel}
                  </span>
                )}
                {course.estimatedHours && (
                  <span className="text-xs bg-surface text-text-secondary px-2 py-1 rounded">
                    {course.estimatedHours}h
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-text-secondary">
                <span>{course.topicCount} topics</span>
                <span>{course.testCount} tests</span>
                <span>{course.enrollmentCount} enrolled</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTogglePublish(course)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    course.published
                      ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {course.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg">No courses created yet.</p>
          <p className="text-text-secondary text-sm mt-1">Click "Create Course" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default CourseManagementPage;
