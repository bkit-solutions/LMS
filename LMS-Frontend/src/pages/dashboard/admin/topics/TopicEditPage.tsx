import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { topicApi } from "../../../../services/topicApi";
import type { TopicResponse, ChapterSummary } from "../../../../types";

const TopicEditPage: React.FC = () => {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<TopicResponse | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicRes, chaptersRes] = await Promise.all([
        topicApi.getTopicById(Number(topicId)),
        topicApi.getChaptersByTopic(Number(topicId)),
      ]);

      if (topicRes.success && topicRes.data) {
        setTopic(topicRes.data);
        setTitle(topicRes.data.title);
        setDescription(topicRes.data.description || "");
      }

      if (chaptersRes.success && chaptersRes.data) {
        setChapters(chaptersRes.data);
      }
    } catch (err) {
      console.error("Failed to load topic:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    try {
      setSaving(true);
      const response = await topicApi.updateTopic(topic.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (response.success) {
        alert("Topic updated successfully!");
        navigate(-1);
      } else {
        alert("Failed to update topic");
      }
    } catch (err) {
      console.error("Failed to save topic:", err);
      alert("Error updating topic");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!confirm("Delete this chapter? This cannot be undone.")) return;

    try {
      const response = await topicApi.deleteChapter(chapterId);
      if (response.success) {
        setChapters(chapters.filter((c) => c.id !== chapterId));
      } else {
        alert("Failed to delete chapter");
      }
    } catch (err) {
      console.error("Failed to delete chapter:", err);
      alert("Error deleting chapter");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-text">Topic not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-text-secondary hover:text-text"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-text">Edit Module</h1>
                <p className="text-sm text-text-secondary mt-1">
                  Update module details and manage lessons
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-border text-text rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Details Form */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-text mb-4">Module Details</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                placeholder="e.g., Introduction to Python"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Brief overview of what this module covers..."
              />
            </div>
          </form>
        </div>

        {/* Lessons Section */}
        <div className="bg-white rounded-xl border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text">
                Lessons ({chapters.length})
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Manage lesson content for this module
              </p>
            </div>
            <button
              onClick={() =>
                navigate(
                  `/${window.location.pathname.split("/")[1]}/dashboard/courses/${courseId}/topics/${topicId}/chapters/create`
                )
              }
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
            >
              + Add Lesson
            </button>
          </div>

          {/* Lessons List */}
          {chapters.length === 0 ? (
            <div className="p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">
                  No lessons yet
                </h3>
                <p className="text-text-secondary mb-4">
                  Add your first lesson to start building this module
                </p>
                <button
                  onClick={() =>
                    navigate(
                      `/${window.location.pathname.split("/")[1]}/dashboard/courses/${courseId}/topics/${topicId}/chapters/create`
                    )
                  }
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary"
                >
                  Create First Lesson
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center flex-shrink-0 font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-text mb-1">
                        {chapter.title}
                      </h3>
                      {chapter.contentType && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {chapter.contentType}
                          </span>
                          {chapter.estimatedMinutes && (
                            <span className="text-sm text-text-secondary">
                              {chapter.estimatedMinutes} min
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          navigate(
                            `/${window.location.pathname.split("/")[1]}/dashboard/courses/${courseId}/topics/${topicId}/chapters/${chapter.id}/edit`
                          )
                        }
                        className="px-4 py-2 text-sm border border-border text-text rounded-lg hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteChapter(chapter.id)}
                        className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicEditPage;
