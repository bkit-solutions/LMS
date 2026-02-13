import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { topicApi } from "../../../services/topicApi";
import type { TopicResponse } from "../../../types";

const TopicListPage: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await topicApi.getPublishedTopics();
        if (response.success && response.data) {
          setTopics(response.data);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }
        setError(err.response?.data?.message || "Failed to load topics");
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [navigate]);

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
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Learning Topics
        </h1>
        <p className="text-text-secondary">
          Explore topics and learn at your own pace.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {topics.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-border p-8 text-center">
            <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-text mb-2">
              No topics available yet
            </h3>
            <p className="text-text-secondary">
              Your instructor hasn't published any topics yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => {
              const collegeCode = window.location.pathname.split("/")[1];
              return (
                <button
                  key={topic.id}
                  onClick={() => navigate(`/${collegeCode}/dashboard/topics/${topic.id}`)}
                  className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-all hover:border-primary text-left group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold text-text mb-2 group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>

                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {topic.description || "No description available"}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">
                      <span className="font-medium text-primary">
                        {topic.chapterCount}
                      </span>{" "}
                      {topic.chapterCount === 1 ? "chapter" : "chapters"}
                    </span>
                    <span className="text-primary text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                      Start Learning →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicListPage;
