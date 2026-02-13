import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Menu, FileText, CheckCircle2, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { topicApi } from "../../../services/topicApi";
import { enrollmentApi } from "../../../services/enrollmentApi";
import { useCodeHighlight } from "../../../hooks/useCodeHighlight";
import 'prismjs/themes/prism-tomorrow.css';
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

  // Progress tracking
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(new Set());
  const [chapterStartTime, setChapterStartTime] = useState<Date | null>(null);

  // Ref for chapter content to apply syntax highlighting
  const chapterContentRef = useRef<HTMLDivElement>(null);
  
  // Apply syntax highlighting when content changes
  useCodeHighlight(chapterContentRef as React.RefObject<HTMLElement>);

  // Computed values for navigation
  const currentIndex = activeChapterId ? chapters.findIndex(ch => ch.id === activeChapterId) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < chapters.length - 1;

  // Bookmark functionality
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  // Cleanup: track time spent when component unmounts
  useEffect(() => {
    return () => {
      if (activeChapterId && chapterStartTime) {
        const timeSpentSeconds = Math.floor((new Date().getTime() - chapterStartTime.getTime()) / 1000);
        if (timeSpentSeconds > 0) {
          // Use sendBeacon or similar for cleanup to avoid async issues
          navigator.sendBeacon(
            `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/progress/chapters/${activeChapterId}/time`,
            JSON.stringify({ seconds: timeSpentSeconds })
          );
        }
      }
    };
  }, [activeChapterId, chapterStartTime]);

  // Helper for navigation
  const getNavigationPath = (path: string) => {
    const collegeCode = window.location.pathname.split("/")[1];
    return `/${collegeCode}/dashboard/${path}`;
  };

  const loadChapter = async (chapterId: number) => {
    try {
      // Track time spent on previous chapter
      if (activeChapterId && chapterStartTime) {
        const timeSpentSeconds = Math.floor((new Date().getTime() - chapterStartTime.getTime()) / 1000);
        if (timeSpentSeconds > 0) {
          await enrollmentApi.updateTimeSpent(activeChapterId, timeSpentSeconds);
        }
      }

      setChapterLoading(true);
      setActiveChapterId(chapterId);
      const response = await topicApi.getChapterById(chapterId);
      if (response.success && response.data) {
        setActiveChapter(response.data);
        setChapterStartTime(new Date());

        // Check if chapter is completed
        try {
          const statusResponse = await enrollmentApi.getChapterStatus(chapterId);
          if (statusResponse.success) {
            setCompletedChapters(prev => {
              const newSet = new Set(prev);
              if (statusResponse.data) {
                newSet.add(chapterId);
              } else {
                newSet.delete(chapterId);
              }
              return newSet;
            });
          }
        } catch (err) {
          // Chapter status might not be available, continue
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load chapter");
    } finally {
      setChapterLoading(false);
    }
  };

  const markChapterComplete = async (chapterId: number) => {
    try {
      const response = await enrollmentApi.markChapterComplete(chapterId);
      if (response.success) {
        setCompletedChapters(prev => new Set([...prev, chapterId]));
      }
    } catch (err: any) {
      console.error("Failed to mark chapter as complete:", err);
    }
  };

  const goToPrev = () => {
    if (hasPrev) loadChapter(chapters[currentIndex - 1].id);
  };
  const goToNext = () => {
    if (hasNext) loadChapter(chapters[currentIndex + 1].id);
  };

  // Bookmark functions
  const checkBookmarkStatus = () => {
    const savedBookmarks = localStorage.getItem('studentBookmarks');
    if (savedBookmarks) {
      const bookmarks = JSON.parse(savedBookmarks);
      const isBookmarked = bookmarks.some((b: any) => b.topicId === id);
      setIsBookmarked(isBookmarked);
    }
  };

  const toggleBookmark = () => {
    const savedBookmarks = localStorage.getItem('studentBookmarks') || '[]';
    let bookmarks = JSON.parse(savedBookmarks);

    if (isBookmarked) {
      // Remove bookmark
      bookmarks = bookmarks.filter((b: any) => b.topicId !== id);
    } else {
      // Add bookmark
      const newBookmark = {
        id: Date.now(),
        topicId: id,
        bookmarkedAt: new Date().toISOString(),
        notes: '',
      };
      bookmarks.push(newBookmark);
    }

    localStorage.setItem('studentBookmarks', JSON.stringify(bookmarks));
    setIsBookmarked(!isBookmarked);
  };

  // Check bookmark status when topic loads
  useEffect(() => {
    if (topic) {
      checkBookmarkStatus();
    }
  }, [topic, id]);

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
            onClick={() => navigate(getNavigationPath("topics"))}
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
          onClick={() => navigate(getNavigationPath("topics"))}
          className="text-primary hover:text-secondary text-sm font-medium flex-shrink-0"
        >
          ← Topics
        </button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-semibold text-text truncate">
          {topic.title}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                : 'text-text-secondary hover:text-yellow-600 hover:bg-yellow-50'
            }`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this topic"}
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
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
                        : completedChapters.has(chapter.id)
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-text-secondary"
                    }`}
                  >
                    {completedChapters.has(chapter.id) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className={`text-sm font-medium truncate ${
                    completedChapters.has(chapter.id) ? "text-green-700" : ""
                  }`}>
                    {chapter.title}
                  </span>
                  {completedChapters.has(chapter.id) && (
                    <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
                  )}
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
                <div className="chapter-content" ref={chapterContentRef}>
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

                {/* Mark as Complete Button */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span>Estimated time: {activeChapter.estimatedMinutes || 5} minutes</span>
                  </div>
                  {!completedChapters.has(activeChapter.id) ? (
                    <button
                      onClick={() => markChapterComplete(activeChapter.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Complete
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </div>
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
