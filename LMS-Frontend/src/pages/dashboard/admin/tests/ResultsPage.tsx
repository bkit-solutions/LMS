import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { testApi } from "../../../../services/testApi";
import type { Result } from "../../../../types";
import { Video } from "lucide-react";
import SessionReportModal from "../../../../components/admin/tests/SessionReportModal";

const ResultsPage: React.FC = () => {

  const { testId } = useParams<{ testId: string }>();

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {

    const fetchResults = async () => {

      try {

        setLoading(true);

        let response;

        if (testId)
          response = await testApi.getTestResults(parseInt(testId));
        else
          response = await testApi.getAdminResults();

        if (response.success && response.data)
          setResults(response.data);
        else
          setError(response.message);

      } catch (err: any) {

        setError(
          err.response?.data?.message ||
          "Failed to load results"
        );

      } finally {

        setLoading(false);

      }
    };

    fetchResults();

  }, [testId]);


  const handleDeleteResult = async (resultId: number) => {

    if (!confirm("Are you sure you want to delete this result?"))
      return;

    try {

      const response = await testApi.deleteResult(resultId);

      if (response.success)
        setResults(results.filter(r => r.id !== resultId));
      else
        alert(response.message || "Failed to delete result");

    } catch {

      alert("Failed to delete result");

    }
  };


  if (loading) {

    return (

      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div style={{ color: "var(--text)" }}>
          Loading results...
        </div>
      </div>

    );
  }


  if (error) {

    return (

      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div style={{ color: "var(--accent)" }}>
          {error}
        </div>
      </div>

    );
  }


  return (

    <div
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{ background: "var(--background)" }}
    >

      <div className="max-w-7xl mx-auto space-y-6">


        {/* HEADER */}

        <div>

          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--text)" }}
          >
            Test Results
          </h1>

        </div>



        {/* RESULTS TABLE */}

        <div
          className="rounded-lg border overflow-hidden"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)"
          }}
        >

          {results.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead
                  style={{
                    background: "var(--surface)",
                    borderBottom: "1px solid var(--border)"
                  }}
                >

                  <tr>

                    {[
                      "Test Title",
                      "Student",
                      "Score",
                      "Percentage",
                      "Submitted At",
                      "Status",
                      "Report",
                      "Actions"
                    ].map((heading) => (

                      <th
                        key={heading}
                        className="px-6 py-3 text-left text-xs font-medium uppercase"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {heading}
                      </th>

                    ))}

                  </tr>

                </thead>


                <tbody>

                  {results.map((result) => {

                    const percentage =
                      (
                        result.score /
                        result.test.totalMarks
                      ) * 100;

                    return (

                      <tr
                        key={result.id}
                        style={{
                          borderBottom:
                            "1px solid var(--border)"
                        }}
                      >

                        {/* TEST TITLE */}

                        <td
                          className="px-6 py-4 text-sm font-medium"
                          style={{ color: "var(--text)" }}
                        >
                          {result.test.title}
                        </td>


                        {/* STUDENT */}

                        <td
                          className="px-6 py-4 text-sm"
                          style={{
                            color:
                              "var(--text-secondary)"
                          }}
                        >
                          {result.student.name}
                          <br />
                          <span className="text-xs">
                            {result.student.email}
                          </span>
                        </td>


                        {/* SCORE */}

                        <td
                          className="px-6 py-4 text-sm"
                          style={{
                            color:
                              "var(--text-secondary)"
                          }}
                        >
                          {result.score} /
                          {result.test.totalMarks}
                        </td>


                        {/* PERCENTAGE */}

                        <td
                          className="px-6 py-4 text-sm font-medium"
                          style={{
                            color:
                              percentage >= 40
                                ? "var(--primary)"
                                : "var(--accent)"
                          }}
                        >
                          {percentage.toFixed(2)}%
                        </td>


                        {/* DATE */}

                        <td
                          className="px-6 py-4 text-sm"
                          style={{
                            color:
                              "var(--text-secondary)"
                          }}
                        >
                          {new Date(
                            result.submittedAt || ""
                          ).toLocaleString()}
                        </td>


                        {/* STATUS */}

                        <td
                          className="px-6 py-4 text-sm font-medium"
                          style={{
                            color:
                              result.isValidTest
                                ? "var(--primary)"
                                : "var(--accent)"
                          }}
                        >
                          {result.isValidTest
                            ? "Valid"
                            : "Invalid"}
                        </td>


                        {/* REPORT */}

                        <td className="px-6 py-4 text-sm">

                          <button
                            onClick={() => {

                              setSelectedAttemptId(
                                result.id
                              );

                              setIsReportModalOpen(true);

                            }}
                            className="flex items-center font-medium"
                            style={{
                              color: "var(--primary)"
                            }}
                          >
                            <Video className="w-4 h-4 mr-1" />
                            View
                          </button>

                        </td>


                        {/* DELETE */}

                        <td className="px-6 py-4 text-sm">

                          <button
                            onClick={() =>
                              handleDeleteResult(
                                result.id
                              )
                            }
                            style={{
                              color: "var(--accent)"
                            }}
                            className="font-medium"
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            </div>

          ) : (

            <div
              className="p-6 text-center"
              style={{
                color: "var(--text-secondary)"
              }}
            >
              No results yet
            </div>

          )}

        </div>

      </div>


      {/* REPORT MODAL */}

      <SessionReportModal
        attemptId={selectedAttemptId}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

    </div>

  );
};

export default ResultsPage;
