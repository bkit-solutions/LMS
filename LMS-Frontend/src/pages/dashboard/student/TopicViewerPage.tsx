import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Menu, FileText } from "lucide-react";
import { topicApi } from "../../../services/topicApi";
import type {
  TopicResponse,
  ChapterSummary,
  ChapterResponse,
} from "../../../types";

const TopicViewerPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const id = Number(topicId);

  const [topic, setTopic] = useState<TopicResponse | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [activeChapter, setActiveChapter] = useState<ChapterResponse | null>(
    null,
  );
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [topicRes, chaptersRes] = await Promise.all([
          topicApi.getTopicById(id),
          topicApi.getChaptersByTopic(id),
        ]);

        if (topicRes.success && topicRes.data) {
          setTopic(topicRes.data);
        } else {
          setError(topicRes.message);
          return;
        }

        if (chaptersRes.success && chaptersRes.data) {
          setChapters(chaptersRes.data);
          // Auto-select first chapter
          if (chaptersRes.data.length > 0) {
            loadChapter(chaptersRes.data[0].id);
          }
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }
        setError(err.response?.data?.message || "Failed to load topic");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, navigate]);

  const loadChapter = async (chapterId: number) => {
    try {
      setChapterLoading(true);
      setActiveChapterId(chapterId);
      const response = await topicApi.getChapterById(chapterId);
      if (response.success && response.data) {
        setActiveChapter(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load chapter");
    } finally {
      setChapterLoading(false);
    }
  };

  const currentIndex = chapters.findIndex((c) => c.id === activeChapterId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < chapters.length - 1;

  const goToPrev = () => {
    if (hasPrev) loadChapter(chapters[currentIndex - 1].id);
  };
  const goToNext = () => {
    if (hasNext) loadChapter(chapters[currentIndex + 1].id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-text">Loading topic...</div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-accent mb-4">{error || "Topic not found"}</div>
          <button
            onClick={() => navigate("/dashboard/topics")}
            className="text-primary hover:text-secondary font-medium"
          >
            ← Back to Topics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Topic Header */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/topics")}
          className="text-primary hover:text-secondary text-sm font-medium flex-shrink-0"
        >
          ← Topics
        </button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-semibold text-text truncate">
          {topic.title}
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto md:hidden p-2 text-text-secondary hover:text-text"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-border overflow-y-auto transition-transform duration-200 md:flex-shrink-0 pt-[105px] md:pt-0`}
        >
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-25 md:hidden z-[-1]"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Chapters
            </h2>
          </div>

          {chapters.length === 0 ? (
            <div className="p-4 text-center text-text-secondary text-sm">
              No chapters available yet.
            </div>
          ) : (
            <nav className="py-2">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    loadChapter(chapter.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    activeChapterId === chapter.id
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-text hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      activeChapterId === chapter.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-text-secondary"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {chapter.title}
                  </span>
                </button>
              ))}
            </nav>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {chapterLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-text-secondary">Loading chapter...</div>
            </div>
          ) : activeChapter ? (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-text mb-6">
                {activeChapter.title}
              </h2>

              {/* Chapter Content */}
              <div className="bg-white rounded-lg shadow-sm border border-border p-6 sm:p-8">
                <div
                  className="prose prose-sm sm:prose max-w-none text-text"
                  style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}
                >
                  {activeChapter.content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: activeChapter.content,
                      }}
                    />
                  ) : (
                    <p className="text-text-secondary italic">
                      No content available for this chapter yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={goToPrev}
                  disabled={!hasPrev}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasPrev
                      ? "bg-white border border-border text-text hover:bg-gray-50"
                      : "bg-gray-100 text-text-secondary cursor-not-allowed"
                  }`}
                >
                  ← Previous
                </button>
                <span className="text-sm text-text-secondary">
                  {currentIndex + 1} of {chapters.length}
                </span>
                <button
                  onClick={goToNext}
                  disabled={!hasNext}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    hasNext
                      ? "bg-primary text-white hover:bg-secondary"
                      : "bg-gray-100 text-text-secondary cursor-not-allowed"
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="w-16 h-16 text-text-secondary mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-text-secondary">
                  {chapters.length === 0
                    ? "This topic has no chapters yet."
                    : "Select a chapter from the sidebar to start reading."}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TopicViewerPage;
