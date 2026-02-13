import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, BookOpen, Clock, Trash2, ExternalLink } from "lucide-react";
import { topicApi } from "../../../services/topicApi";
import type { TopicResponse } from "../../../types";

interface BookmarkItem {
  id: number;
  topicId: number;
  topic: TopicResponse;
  bookmarkedAt: string;
  notes?: string;
}

const StudentBookmarksPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate bookmarks with localStorage
      // In a real implementation, this would be an API call
      const savedBookmarks = localStorage.getItem('studentBookmarks');
      if (savedBookmarks) {
        const bookmarkIds = JSON.parse(savedBookmarks);
        // Fetch topic details for bookmarked topics
        const bookmarkPromises = bookmarkIds.map(async (bookmarkData: any) => {
          try {
            const topicRes = await topicApi.getTopicById(bookmarkData.topicId);
            if (topicRes.success && topicRes.data) {
              return {
                id: bookmarkData.id,
                topicId: bookmarkData.topicId,
                topic: topicRes.data,
                bookmarkedAt: bookmarkData.bookmarkedAt,
                notes: bookmarkData.notes,
              };
            }
          } catch (err) {
            console.error(`Failed to fetch topic ${bookmarkData.topicId}:`, err);
          }
          return null;
        });

        const bookmarkResults = await Promise.all(bookmarkPromises);
        setBookmarks(bookmarkResults.filter(Boolean) as BookmarkItem[]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (bookmarkId: number) => {
    try {
      // Update localStorage
      const savedBookmarks = localStorage.getItem('studentBookmarks');
      if (savedBookmarks) {
        const bookmarks = JSON.parse(savedBookmarks);
        const updatedBookmarks = bookmarks.filter((b: any) => b.id !== bookmarkId);
        localStorage.setItem('studentBookmarks', JSON.stringify(updatedBookmarks));
      }

      // Update state
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  const handleViewTopic = (topicId: number) => {
    const collegeCode = window.location.pathname.split("/")[1];
    navigate(`/${collegeCode}/dashboard/topics/${topicId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BookmarkCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text">My Bookmarks</h1>
              <p className="text-text-secondary">Saved topics for quick access</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <Bookmark className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">No bookmarks yet</h3>
            <p className="text-text-secondary mb-6">
              Save topics you're interested in for quick access later
            </p>
            <button
              onClick={() => {
                const collegeCode = window.location.pathname.split("/")[1];
                navigate(`/${collegeCode}/dashboard/topics`);
              }}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium"
            >
              Browse Topics
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-text line-clamp-2 mb-1">
                        {bookmark.topic.title}
                      </h3>
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {bookmark.topic.description || "No description available"}
                      </p>
                    </div>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="ml-2 p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {bookmark.topic.chapterCount} chapters
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Bookmarked {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {bookmark.notes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> {bookmark.notes}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleViewTopic(bookmark.topicId)}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bookmark Tips */}
        {bookmarks.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Bookmark Tips</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Click the bookmark icon while viewing a topic to save it</li>
              <li>• Add personal notes to remember why you bookmarked it</li>
              <li>• Use bookmarks to create your personal learning path</li>
              <li>• Remove bookmarks when you've completed the topic</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBookmarksPage;