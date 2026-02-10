import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { topicApi } from "../../../services/topicApi";
import type { TopicResponse } from "../../../types";

const TopicList: React.FC = () => {
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await topicApi.getMyTopics();
      if (response.success && response.data) {
        setTopics(response.data);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this topic and all its chapters?",
      )
    )
      return;
    try {
      await topicApi.deleteTopic(id);
      setTopics(topics.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete topic");
    }
  };

  const handlePublish = async (id: number) => {
    try {
      const response = await topicApi.publishTopic(id);
      if (response.success && response.data) {
        setTopics(topics.map((t) => (t.id === id ? response.data! : t)));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to publish topic");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-text">Loading topics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Topics</h1>
          <Link
            to="/dashboard/topics/create"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
          >
            + Create Topic
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {topics.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-border p-8 text-center">
            <h3 className="text-lg font-medium text-text mb-2">
              No topics yet
            </h3>
            <p className="text-text-secondary mb-4">
              Create your first topic to start organizing content for your
              students.
            </p>
            <Link
              to="/dashboard/topics/create"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium"
            >
              Create Topic
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-text truncate pr-2">
                    {topic.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                      topic.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {topic.published ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                  {topic.description || "No description"}
                </p>

                <div className="flex items-center text-sm text-text-secondary mb-4">
                  <span className="font-medium text-primary">
                    {topic.chapterCount}
                  </span>
                  <span className="ml-1">
                    {topic.chapterCount === 1 ? "chapter" : "chapters"}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/dashboard/topics/${topic.id}`}
                    className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-white border border-primary rounded-md transition-colors"
                  >
                    Manage
                  </Link>
                  {!topic.published && (
                    <button
                      onClick={() => handlePublish(topic.id)}
                      className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-600 hover:text-white border border-green-600 rounded-md transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600 hover:text-white border border-red-600 rounded-md transition-colors"
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
  );
};

export default TopicList;
