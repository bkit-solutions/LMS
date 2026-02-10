import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { topicApi } from "../../../../services/topicApi";
import type {
  TopicResponse,
  ChapterSummary,
  ChapterResponse,
  UpdateTopicRequest,
} from "../../../../types";

const TopicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const topicId = Number(id);

  const [topic, setTopic] = useState<TopicResponse | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit topic state
  const [editingTopic, setEditingTopic] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Add chapter state
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterContent, setNewChapterContent] = useState("");
  const [addingChapter, setAddingChapter] = useState(false);

  // Edit chapter state
  const [editingChapter, setEditingChapter] = useState<ChapterResponse | null>(
    null,
  );
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterContent, setEditChapterContent] = useState("");
  const [loadingChapter, setLoadingChapter] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicRes, chaptersRes] = await Promise.all([
        topicApi.getTopicById(topicId),
        topicApi.getChaptersByTopic(topicId),
      ]);
      if (topicRes.success && topicRes.data) {
        setTopic(topicRes.data);
        setEditTitle(topicRes.data.title);
        setEditDescription(topicRes.data.description || "");
      }
      if (chaptersRes.success && chaptersRes.data) {
        setChapters(chaptersRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load topic");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) fetchData();
  }, [topicId]);

  const handleUpdateTopic = async () => {
    try {
      const req: UpdateTopicRequest = {};
      if (editTitle.trim() !== topic?.title) req.title = editTitle.trim();
      if (editDescription.trim() !== (topic?.description || ""))
        req.description = editDescription.trim();
      const response = await topicApi.updateTopic(topicId, req);
      if (response.success && response.data) {
        setTopic(response.data);
        setEditingTopic(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update topic");
    }
  };

  const handlePublish = async () => {
    try {
      const response = await topicApi.publishTopic(topicId);
      if (response.success && response.data) {
        setTopic(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to publish topic");
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    try {
      setAddingChapter(true);
      const response = await topicApi.createChapter(topicId, {
        title: newChapterTitle.trim(),
        content: newChapterContent.trim() || undefined,
        displayOrder: chapters.length,
      });
      if (response.success && response.data) {
        setChapters([
          ...chapters,
          {
            id: response.data.id,
            title: response.data.title,
            displayOrder: response.data.displayOrder,
          },
        ]);
        setNewChapterTitle("");
        setNewChapterContent("");
        setShowAddChapter(false);
        // Update chapter count
        if (topic) setTopic({ ...topic, chapterCount: topic.chapterCount + 1 });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create chapter");
    } finally {
      setAddingChapter(false);
    }
  };

  const handleEditChapter = async (chapterId: number) => {
    try {
      setLoadingChapter(true);
      const response = await topicApi.getChapterById(chapterId);
      if (response.success && response.data) {
        setEditingChapter(response.data);
        setEditChapterTitle(response.data.title);
        setEditChapterContent(response.data.content || "");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load chapter");
    } finally {
      setLoadingChapter(false);
    }
  };

  const handleSaveChapter = async () => {
    if (!editingChapter) return;
    try {
      setLoadingChapter(true);
      const response = await topicApi.updateChapter(editingChapter.id, {
        title: editChapterTitle.trim() || undefined,
        content: editChapterContent,
      });
      if (response.success && response.data) {
        setChapters(
          chapters.map((c) =>
            c.id === editingChapter.id
              ? { ...c, title: response.data!.title }
              : c,
          ),
        );
        setEditingChapter(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update chapter");
    } finally {
      setLoadingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId: number) => {
    if (!window.confirm("Are you sure you want to delete this chapter?"))
      return;
    try {
      await topicApi.deleteChapter(chapterId);
      setChapters(chapters.filter((c) => c.id !== chapterId));
      if (topic) setTopic({ ...topic, chapterCount: topic.chapterCount - 1 });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete chapter");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-text">Loading topic...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-accent">Topic not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard/topics")}
          className="text-primary hover:text-secondary text-sm font-medium"
        >
          ← Back to Topics
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Topic Info */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          {editingTopic ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateTopic}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingTopic(false);
                    setEditTitle(topic.title);
                    setEditDescription(topic.description || "");
                  }}
                  className="px-4 py-2 border border-border text-text rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-text">
                    {topic.title}
                  </h1>
                  <p className="text-text-secondary mt-1">
                    {topic.description || "No description"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      topic.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {topic.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditingTopic(true)}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-white border border-primary rounded-md transition-colors"
                >
                  Edit
                </button>
                {!topic.published && (
                  <button
                    onClick={handlePublish}
                    className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-600 hover:text-white border border-green-600 rounded-md transition-colors"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chapters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-text">
              Chapters ({chapters.length})
            </h2>
            <button
              onClick={() => setShowAddChapter(!showAddChapter)}
              className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-secondary transition-colors"
            >
              + Add Chapter
            </button>
          </div>

          {/* Add Chapter Form */}
          {showAddChapter && (
            <div className="p-4 sm:p-6 bg-blue-50 border-b border-border">
              <form onSubmit={handleAddChapter} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Chapter Title *
                  </label>
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    placeholder="e.g., Introduction to Variables"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Content
                  </label>
                  <textarea
                    value={newChapterContent}
                    onChange={(e) => setNewChapterContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white font-mono text-sm"
                    placeholder="Write the chapter content here... (supports plain text and HTML)"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={addingChapter}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {addingChapter ? "Creating..." : "Create Chapter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddChapter(false);
                      setNewChapterTitle("");
                      setNewChapterContent("");
                    }}
                    className="px-4 py-2 border border-border text-text rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Chapter Modal */}
          {editingChapter && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-text">
                    Edit Chapter
                  </h3>
                  <button
                    onClick={() => setEditingChapter(null)}
                    className="text-text-secondary hover:text-text text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editChapterTitle}
                      onChange={(e) => setEditChapterTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Content
                    </label>
                    <textarea
                      value={editChapterContent}
                      onChange={(e) => setEditChapterContent(e.target.value)}
                      rows={15}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveChapter}
                      disabled={loadingChapter}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {loadingChapter ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => setEditingChapter(null)}
                      className="px-4 py-2 border border-border text-text rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chapter List */}
          {chapters.length === 0 ? (
            <div className="p-6 text-center text-text-secondary">
              No chapters yet. Add your first chapter to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-text font-medium">
                      {chapter.title}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditChapter(chapter.id)}
                      disabled={loadingChapter}
                      className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary hover:text-white border border-primary rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white border border-red-600 rounded-md transition-colors"
                    >
                      Delete
                    </button>
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

export default TopicDetailPage;
