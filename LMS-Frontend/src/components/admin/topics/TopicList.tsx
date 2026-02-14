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

      }
      else {

        setError(response.message);

      }

    }
    catch (err: any) {

      setError(err.response?.data?.message || "Failed to load topics");

    }
    finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchTopics();

  }, []);



  const handleDelete = async (id: number) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this topic and all its chapters?"
      )
    ) return;

    try {

      await topicApi.deleteTopic(id);

      setTopics(topics.filter((t) => t.id !== id));

    }
    catch (err: any) {

      setError(err.response?.data?.message || "Failed to delete topic");

    }

  };



  const handlePublish = async (id: number) => {

    try {

      const response = await topicApi.publishTopic(id);

      if (response.success && response.data) {

        setTopics(
          topics.map((t) => (t.id === id ? response.data! : t))
        );

      }

    }
    catch (err: any) {

      setError(err.response?.data?.message || "Failed to publish topic");

    }

  };



  /* LOADING */

  if (loading) {

    return (

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--surface)" }}
      >

        <div style={{ color: "var(--text-secondary)" }}>
          Loading topics...
        </div>

      </div>

    );

  }



  return (

    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{ background: "var(--surface)" }}
    >

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--text)" }}
          >
            Topics
          </h1>


          <Link
            to="create"
            className="inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium"
            style={{ background: "var(--primary)" }}
          >
            + Create Topic
          </Link>

        </div>



        {/* ERROR */}

        {error && (

          <div
            className="px-4 py-3 rounded-lg border"
            style={{
              background: "var(--primary-soft)",
              borderColor: "var(--primary)",
              color: "var(--primary)"
            }}
          >

            {error}

          </div>

        )}



        {/* EMPTY STATE */}

        {topics.length === 0 ? (

          <div
            className="rounded-lg shadow-sm border p-8 text-center"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)"
            }}
          >

            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--text)" }}
            >
              No topics yet
            </h3>


            <p
              className="mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Create your first topic to start organizing content.
            </p>


            <Link
              to="create"
              className="inline-flex items-center px-4 py-2 text-white rounded-lg text-sm font-medium"
              style={{ background: "var(--primary)" }}
            >
              Create Topic
            </Link>

          </div>

        ) : (

          /* TOPIC GRID */

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {topics.map((topic) => (

              <div
                key={topic.id}
                className="rounded-lg shadow-sm border p-6"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)"
                }}
              >

                {/* TITLE */}

                <div className="flex items-start justify-between mb-3">

                  <h3
                    className="text-lg font-semibold truncate pr-2"
                    style={{ color: "var(--text)" }}
                  >
                    {topic.title}
                  </h3>


                  <span
                    className="px-2 py-1 text-xs rounded-full font-medium"
                    style={{
                      background: topic.published
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(245,158,11,0.15)",
                      color: topic.published
                        ? "#059669"
                        : "#B45309"
                    }}
                  >
                    {topic.published ? "Published" : "Draft"}
                  </span>

                </div>



                {/* DESCRIPTION */}

                <p
                  className="text-sm mb-4 line-clamp-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {topic.description || "No description"}
                </p>



                {/* CHAPTER COUNT */}

                <div
                  className="text-sm mb-4"
                  style={{ color: "var(--text-secondary)" }}
                >

                  <span
                    style={{
                      color: "var(--primary)",
                      fontWeight: 600
                    }}
                  >
                    {topic.chapterCount}
                  </span>

                  <span className="ml-1">
                    {topic.chapterCount === 1 ? "chapter" : "chapters"}
                  </span>

                </div>



                {/* ACTION BUTTONS */}

                <div className="flex items-center gap-2 flex-wrap">

                  {/* MANAGE */}

                  <Link
                    to={`${topic.id}`}
                    className="px-3 py-1.5 text-sm font-medium rounded-md border transition-colors"
                    style={{
                      color: "var(--primary)",
                      borderColor: "var(--primary)"
                    }}
                  >
                    Manage
                  </Link>



                  {/* PUBLISH */}

                  {!topic.published && (

                    <button
                      onClick={() => handlePublish(topic.id)}
                      className="px-3 py-1.5 text-sm font-medium rounded-md border transition-colors"
                      style={{
                        color: "#059669",
                        borderColor: "#059669"
                      }}
                    >
                      Publish
                    </button>

                  )}



                  {/* DELETE */}

                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="px-3 py-1.5 text-sm font-medium rounded-md border transition-colors"
                    style={{
                      color: "#DC2626",
                      borderColor: "#DC2626"
                    }}
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
