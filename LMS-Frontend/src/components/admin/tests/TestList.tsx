import React, { useEffect, useState } from "react";

import {
  X,
  Plus,
  FileText,
  CheckCircle,
  Pencil,
  PieChart,
  Calendar,
  ClipboardList,
  HelpCircle
} from "lucide-react";

import { Link } from "react-router-dom";

import { testApi } from "../../../services/testApi";

import type { Test } from "../../../types";



const TestList: React.FC = () => {

  const [tests, setTests] = useState<Test[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    const fetchTests = async () => {

      try {

        setLoading(true);

        const response = await testApi.getMyTests();

        if (response.success && response.data) {

          setTests(response.data);

        }
        else {

          setError(response.message);

        }

      }
      catch (err: any) {

        setError(err.response?.data?.message || "Failed to load tests");

      }
      finally {

        setLoading(false);

      }

    };

    fetchTests();

  }, []);



  /* LOADING STATE */

  if (loading) {

    return (

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--surface)" }}
      >

        <div className="flex flex-col items-center space-y-4">

          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
          />

          <p style={{ color: "var(--text-secondary)" }}>
            Loading tests...
          </p>

        </div>

      </div>

    );

  }



  /* ERROR STATE */

  if (error) {

    return (

      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--surface)" }}
      >

        <div
          className="rounded-lg shadow-lg border p-8 max-w-md"
          style={{
            background: "var(--card)",
            borderColor: "var(--primary)"
          }}
        >

          <div className="flex items-center space-x-3 mb-4">

            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--primary-soft)" }}
            >

              <X
                className="w-6 h-6"
                style={{ color: "var(--primary)" }}
              />

            </div>

            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text)" }}
            >
              Error Loading Tests
            </h3>

          </div>

          <p style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>

        </div>

      </div>

    );

  }



  /* MAIN UI */

  return (

    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{ background: "var(--surface)" }}
    >

      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}

        <div
          className="rounded-lg shadow-sm border p-6"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)"
          }}
        >

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--text)" }}
              >
                Test Management
              </h1>

              <p style={{ color: "var(--text-secondary)" }}>
                Create, manage, and monitor your assessments
              </p>

            </div>


            <Link
              to="create"
              className="inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg shadow-md"
              style={{ background: "var(--primary)" }}
            >

              <Plus className="w-5 h-5 mr-2" />

              Create New Test

            </Link>

          </div>

        </div>



        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* TOTAL */}

          <StatCard
            title="Total Tests"
            value={tests.length}
            icon={<FileText />}
          />



          {/* PUBLISHED */}

          <StatCard
            title="Published"
            value={tests.filter(t => t.published).length}
            icon={<CheckCircle />}
          />



          {/* DRAFT */}

          <StatCard
            title="Drafts"
            value={tests.filter(t => !t.published).length}
            icon={<Pencil />}
          />



          {/* MARKS */}

          <StatCard
            title="Total Marks"
            value={tests.reduce((acc, t) => acc + t.totalMarks, 0)}
            icon={<PieChart />}
          />

        </div>



        {/* TEST CARDS */}

        {tests.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {tests.map(test => (

              <div
                key={test.id}
                className="rounded-lg shadow-sm border transition-all"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)"
                }}
              >

                <div className="p-6">

                  <div className="flex items-start justify-between mb-4">

                    <div>

                      <h3
                        className="text-lg font-bold"
                        style={{ color: "var(--text)" }}
                      >
                        {test.title}
                      </h3>

                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {test.description}
                      </p>

                    </div>


                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: test.published
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(245,158,11,0.15)",
                        color: test.published
                          ? "#059669"
                          : "#B45309"
                      }}
                    >

                      {test.published ? "Published" : "Draft"}

                    </span>

                  </div>



                  {/* INFO */}

                  <div className="space-y-2">

                    <InfoRow
                      icon={<Calendar />}
                      text={`${new Date(test.startTime).toLocaleDateString()} - ${new Date(test.endTime).toLocaleDateString()}`}
                    />

                    <InfoRow
                      icon={<ClipboardList />}
                      text={`Max ${test.maxAttempts} Attempts`}
                    />

                    <InfoRow
                      icon={<PieChart />}
                      text={`${test.totalMarks} Total Marks`}
                      highlight
                    />

                  </div>

                </div>



                {/* FOOTER */}

                <div
                  className="border-t px-6 py-4 flex justify-between"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)"
                  }}
                >

                  <Link
                    to={`${test.id}`}
                    style={{ color: "var(--primary)" }}
                  >
                    View Details →
                  </Link>


                  <Link
                    to={`${test.id}/questions`}
                    className="p-2 rounded-lg"
                    style={{ color: "var(--primary)" }}
                  >

                    <HelpCircle className="w-5 h-5" />

                  </Link>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <EmptyState />

        )}

      </div>

    </div>

  );

};



/* STAT CARD */

const StatCard = ({
  title,
  value,
  icon
}: {
  title: string,
  value: number,
  icon: React.ReactNode
}) => (

  <div
    className="rounded-lg shadow-sm border p-6"
    style={{
      background: "var(--card)",
      borderColor: "var(--border)"
    }}
  >

    <div className="flex justify-between mb-2">

      <h3 style={{ color: "var(--text-secondary)" }}>
        {title}
      </h3>

      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          background: "var(--primary-soft)",
          color: "var(--primary)"
        }}
      >
        {icon}
      </div>

    </div>

    <p
      className="text-2xl font-bold"
      style={{ color: "var(--text)" }}
    >
      {value}
    </p>

  </div>

);



/* INFO ROW */

const InfoRow = ({
  icon,
  text,
  highlight
}: {
  icon: React.ReactNode,
  text: string,
  highlight?: boolean
}) => (

  <div
    className="flex items-center text-sm"
    style={{
      color: highlight
        ? "var(--primary)"
        : "var(--text-secondary)"
    }}
  >
    <span className="mr-2">{icon}</span>
    {text}
  </div>

);



/* EMPTY */

const EmptyState = () => (

  <div
    className="rounded-lg shadow-sm border p-12 text-center"
    style={{
      background: "var(--card)",
      borderColor: "var(--border)"
    }}
  >

    <FileText
      className="w-12 h-12 mx-auto mb-4"
      style={{ color: "var(--text-secondary)" }}
    />

    <h3
      className="text-xl font-semibold mb-2"
      style={{ color: "var(--text)" }}
    >
      No Tests Yet
    </h3>

    <p style={{ color: "var(--text-secondary)" }}>
      Create your first test
    </p>

  </div>

);



export default TestList;
