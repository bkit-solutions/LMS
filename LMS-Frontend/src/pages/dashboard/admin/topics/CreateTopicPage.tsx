import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { topicApi } from "../../../../services/topicApi";
import { courseApi } from "../../../../services/courseApi";
import type { CourseResponse } from "../../../../types";

const CreateTopicPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get("courseId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [courseId, setCourseId] = useState<number | "">(preselectedCourseId ? Number(preselectedCourseId) : "");
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getMyCourses();
        if (res.success && res.data) {
          setCourses(res.data);
          if (!preselectedCourseId && res.data.length > 0) {
            setCourseId(res.data[0].id);
          }
        }
      } catch {
        setError("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!courseId) {
      setError("Please select a course");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await topicApi.createTopic({
        title: title.trim(),
        description: description.trim() || undefined,
        published,
        courseId: Number(courseId),
      });
      if (response.success) {
        navigate("../topics");
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create topic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("../topics")}
            className="text-primary hover:text-secondary text-sm font-medium"
          >
            ← Back to Topics
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <h1 className="text-2xl font-bold text-text mb-6">Create Topic</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Course *
              </label>
              {loadingCourses ? (
                <div className="flex items-center gap-2 text-sm text-text-secondary py-2">
                  <Loader2 className="animate-spin h-4 w-4" /> Loading courses...
                </div>
              ) : courses.length === 0 ? (
                <div className="text-sm text-red-600 py-2">
                  No courses found. Please create a course first.
                </div>
              ) : (
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Select a course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode ? `[${c.courseCode}] ` : ""}{c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., Python Programming"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="A brief description of this topic..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <label
                htmlFor="published"
                className="text-sm font-medium text-text"
              >
                Publish immediately (visible to students)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Topic"}
              </button>
              <button
                type="button"
                onClick={() => navigate("../topics")}
                className="px-6 py-2 border border-border text-text rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTopicPage;
