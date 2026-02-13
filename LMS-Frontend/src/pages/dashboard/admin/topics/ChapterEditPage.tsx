import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { topicApi } from "../../../../services/topicApi";
import RichTextEditor from "../../../../components/common/RichTextEditor";

const ChapterEditPage: React.FC = () => {
  const { courseId, topicId, chapterId } = useParams<{
    courseId: string;
    topicId: string;
    chapterId?: string;
  }>();
  const navigate = useNavigate();
  
  // Check if we're in "create" mode (chapterId is undefined or "create")
  const isNewChapter = !chapterId || chapterId === "create";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState<string>("TEXT");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  useEffect(() => {
    // Validate required params
    if (!courseId || !topicId) {
      setError("Missing course or topic information");
      return;
    }

    // Only fetch chapter data if editing an existing chapter (not creating)
    if (chapterId && chapterId !== "create") {
      fetchChapter();
    }
  }, [chapterId, courseId, topicId]);

  const fetchChapter = async () => {
    // Double check we have a valid numeric chapterId
    if (!chapterId || chapterId === "create" || isNaN(Number(chapterId))) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await topicApi.getChapterById(Number(chapterId));
      
      if (response.success && response.data) {
        const chapter = response.data;
        setTitle(chapter.title);
        setContent(chapter.content || "");
        setContentType(chapter.contentType || "TEXT");
        setEstimatedMinutes(chapter.estimatedMinutes?.toString() || "");
        setVideoUrl(chapter.videoUrl || "");
        setDocumentUrl(chapter.documentUrl || "");
      } else {
        setError("Failed to load chapter");
      }
    } catch (err: any) {
      console.error("Failed to load chapter:", err);
      setError(err.response?.data?.message || "Error loading chapter");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!topicId || !courseId) {
      setError("Missing required information");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const chapterData = {
        title: title.trim(),
        content: content.trim() || undefined,
        contentType: contentType as any,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
        videoUrl: videoUrl.trim() || undefined,
        documentUrl: documentUrl.trim() || undefined,
      };

      let response;
      if (isNewChapter) {
        response = await topicApi.createChapter(Number(topicId), chapterData);
      } else if (chapterId && !isNaN(Number(chapterId))) {
        response = await topicApi.updateChapter(Number(chapterId), chapterData);
      } else {
        setError("Invalid chapter ID");
        return;
      }

      if (response.success) {
        navigate(
          `/${window.location.pathname.split("/")[1]}/dashboard/courses/${courseId}/topics/${topicId}/edit`
        );
      } else {
        setError(response.message || "Failed to save lesson");
      }
    } catch (err: any) {
      console.error("Failed to save chapter:", err);
      setError(err.response?.data?.message || "Error saving lesson");
    } finally {
      setSaving(false);
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

  if (error && !isNewChapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-red-200 p-6">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-text mb-2">Error Loading Chapter</h2>
            <p className="text-text-secondary mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary"
            >
              Go Back
            </button>
          </div>
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
                <h1 className="text-2xl font-bold text-text">
                  {isNewChapter ? "Create New Lesson" : "Edit Lesson"}
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  {isNewChapter
                    ? "Add new learning content to this module"
                    : "Update lesson content and details"}
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
                disabled={saving || !title.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : isNewChapter
                  ? "Create Lesson"
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && isNewChapter && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4">
              Lesson Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                  placeholder="e.g., Introduction to Variables"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="TEXT">Text/Article</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document (PDF, PPT, etc.)</option>
                    <option value="QUIZ">Quiz/Assessment</option>
                    <option value="MIXED">Mixed Content</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., 15"
                    min="1"
                  />
                </div>
              </div>

              {contentType === "VIDEO" && (
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://youtube.com/... or https://vimeo.com/..."
                  />
                </div>
              )}

              {contentType === "DOCUMENT" && (
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Document URL
                  </label>
                  <input
                    type="url"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
              )}

              {contentType === "MIXED" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Video URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Document URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={documentUrl}
                      onChange={(e) => setDocumentUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://example.com/document.pdf"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-text">Lesson Content</h2>
              <p className="text-sm text-text-secondary mt-1">
                Write your lesson content using the rich text editor below
              </p>
            </div>
            <div className="prose max-w-none">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your lesson content here... Use the toolbar above to format text, add headings, lists, links, and images."
                height="500px"
              />
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 Content Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Use clear headings to organize your content</li>
              <li>• Break long paragraphs into smaller, digestible chunks</li>
              <li>• Add images and examples to illustrate concepts</li>
              <li>• Include code snippets for programming lessons</li>
              <li>• End with a summary or key takeaways</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChapterEditPage;
