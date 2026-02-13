import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { testApi } from "../../../services/testApi";
import { useCollegeTheme } from "../../../hooks/useCollegeTheme";
import type { Test, Result } from "../../../types";
import {
  BookOpen,
  FileText,
  Award,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Clock,
  Play,
  Lock,
  BarChart3,
  XCircle,
  User,
  Search,
  Bookmark,
} from "lucide-react";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { applyTheme } = useCollegeTheme();
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [myResults, setMyResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [testsError, setTestsError] = useState<string | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setTestsError(null);
      setResultsError(null);

      const [testsResponse, resultsResponse] = await Promise.allSettled([
        testApi.getAvailableTests(),
        testApi.getMyResults(),
      ]);

      if (testsResponse.status === "fulfilled") {
        if (testsResponse.value.success && testsResponse.value.data) {
          setAvailableTests(testsResponse.value.data);
        } else {
          setTestsError(testsResponse.value.message || "Failed to load tests");
        }
      } else {
        const status = testsResponse.reason?.response?.status;
        // Only redirect to login on 401 (not authenticated), not on 403 (not authorized)
        if (status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }
        setTestsError(
          testsResponse.reason?.response?.data?.message || "Failed to load tests"
        );
      }

      if (resultsResponse.status === "fulfilled") {
        if (resultsResponse.value.success && resultsResponse.value.data) {
          console.log("📊 Results fetched:", resultsResponse.value.data.length, "total");
          console.log("✅ Completed:", resultsResponse.value.data.filter((r: any) => r.completed).length);
          console.log("⏳ Incomplete:", resultsResponse.value.data.filter((r: any) => !r.completed).length);
          setMyResults(resultsResponse.value.data);

          // Calculate average percentage only from completed tests
          const completedTests = resultsResponse.value.data.filter(
            (r: Result) => r.completed
          );
          const reducedPercentage =
            completedTests.length > 0
              ? completedTests.reduce(
                (sum: number, r: Result) =>
                  sum + ((r.score / r.test.totalMarks) * 100 || 0),
                0
              ) / completedTests.length
              : 0;
          setPercentage(reducedPercentage);
        } else {
          setResultsError(
            resultsResponse.value.message || "Failed to load results"
          );
        }
      } else {
        const status = resultsResponse.reason?.response?.status;
        // Only redirect to login on 401 (not authenticated), not on 403 (not authorized)
        if (status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }
        setResultsError(
          resultsResponse.reason?.response?.data?.message ||
          "Failed to load results"
        );
      }
    } catch (err: any) {
      const status = err?.response?.status;
      // Only redirect to login on 401, not 403
      if (status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }
      setTestsError(err.response?.data?.message || "Failed to load data");
      setResultsError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (test: Test) => {
    navigate(`tests/${test.id}/instructions`);
  };

  const handleResumeTest = (test: Test) => {
    navigate(`tests/${test.id}/instructions`, { state: { resume: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (testsError && resultsError && availableTests.length === 0 && myResults.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8 max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="shrink-0 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text">
              Error Loading Dashboard
            </h3>
          </div>
          <p className="text-text-secondary">{testsError || resultsError}</p>
          <button
            onClick={fetchData}
            className="mt-4 w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-secondary transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  const completedTests = myResults.length;
  const pendingTests = availableTests.length;

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">
                Student Dashboard
              </h1>
              <p className="text-text-secondary">
                Track your courses, tests, and performance
              </p>
            </div>
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <button
            onClick={() => navigate("courses")}
            className="bg-white rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text">My Courses</h3>
                <p className="text-xs text-text-secondary">Browse & enroll in courses</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate("topics")}
            className="bg-white rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Topics</h3>
                <p className="text-xs text-text-secondary">Study learning materials</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate("search")}
            className="bg-white rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Search</h3>
                <p className="text-xs text-text-secondary">Find courses & topics</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate("bookmarks")}
            className="bg-white rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Bookmarks</h3>
                <p className="text-xs text-text-secondary">Saved topics for later</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate("certificates")}
            className="bg-white rounded-lg shadow-sm border border-border p-5 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Certificates</h3>
                <p className="text-xs text-text-secondary">View earned certificates</p>
              </div>
            </div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">
                Available Tests
              </h3>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text">{pendingTests}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">
                Completed Tests
              </h3>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text">{completedTests}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">
                Average Score
              </h3>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-text">
              {percentage.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Available Tests */}
        <div className="bg-white rounded-lg shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border bg-surface">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text">Available Tests</h2>
                <p className="text-sm text-text-secondary">
                  {availableTests.length} tests ready to take
                </p>
              </div>
            </div>
          </div>

          {testsError ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {testsError}
              </div>
            </div>
          ) : availableTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {availableTests.map((test) => {
                return (
                  <div
                    key={test.id}
                    className="bg-surface rounded-lg border border-border hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-text line-clamp-2">
                          {test.title}
                        </h3>
                        <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap">
                          Active
                        </span>
                      </div>

                      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                        {test.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-text-secondary">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            Until {new Date(test.endTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm font-semibold text-primary">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          <span>{test.totalMarks} Marks</span>
                        </div>
                        <div className="flex items-center text-sm text-text-secondary">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          <span>
                            {test.maxAttempts}{" "}
                            {test.maxAttempts === 1 ? "Attempt" : "Attempts"}
                          </span>
                        </div>
                      </div>

                      {(() => {
                        const testAttempts = myResults.filter(r => r.test.id === test.id);
                        const attemptsUsed = testAttempts.length;
                        const maxAttempts = test.maxAttempts;
                        const currentAttempt = testAttempts.find(r => !r.completed);

                        // Logic:
                        // 1. If active attempt exists -> Resume
                        // 2. If no active attempt:
                        //    a. If attempts check passed -> "Start Test" (or "Retake Test" if >0 previous)
                        //    b. If attempts exhausted -> "Maximum Attempts Reached"

                        if (currentAttempt) {
                          return (
                            <button
                              onClick={() => handleResumeTest(test)}
                              className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                              <Play className="w-5 h-5" />
                              <span>Resume Test</span>
                            </button>
                          );
                        }

                        if (attemptsUsed >= maxAttempts) {
                          return (
                            <button
                              disabled
                              className="w-full px-4 py-3 bg-gray-200 text-gray-500 font-semibold rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed"
                            >
                              <Lock className="w-5 h-5" />
                              <span>Max Attempts Reached ({attemptsUsed}/{maxAttempts})</span>
                            </button>
                          );
                        }

                        // Check Time Window
                        const now = new Date();
                        const start = test.startTime ? new Date(test.startTime) : null;
                        const end = test.endTime ? new Date(test.endTime) : null;

                        if (start && now < start) {
                          return (
                            <button
                              disabled
                              className="w-full px-4 py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed"
                            >
                              <Clock className="w-5 h-5" />
                              <span>Starts: {start.toLocaleDateString()} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </button>
                          );
                        }

                        if (end && now > end) {
                          return (
                            <button
                              disabled
                              className="w-full px-4 py-3 bg-gray-100 text-gray-500 font-semibold rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed"
                            >
                              <Clock className="w-5 h-5" />
                              <span>Test Ended</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={() => handleStartTest(test)}
                            className="w-full px-4 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <Play className="w-5 h-5" />
                            <span>{attemptsUsed > 0 ? "Retake Test" : "Start Test"}</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                No Tests Available
              </h3>
              <p className="text-text-secondary">
                Check back later for new tests
              </p>
            </div>
          )}
        </div>

        {/* My Results */}
        <div className="bg-white rounded-lg shadow-sm border border-border">
          <div className="px-6 py-4 border-b border-border bg-surface">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text">My Results</h2>
                  <p className="text-sm text-text-secondary">
                    {myResults.filter((r) => r.completed).length} test
                    {myResults.filter((r) => r.completed).length !== 1
                      ? "s"
                      : ""}{" "}
                    completed{myResults.filter((r) => !r.completed).length > 0 && ` • ${myResults.filter((r) => !r.completed).length} incomplete`}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-secondary transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {resultsError ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {resultsError}
              </div>
            </div>
          ) : myResults.filter((r) => r.completed).length > 0 ? (
            <div className="divide-y divide-border">
              {myResults
                .filter((r) => r.completed)
                .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
                .map((result, index) => {
                  const percentage =
                    (result.score / result.test.totalMarks) * 100;
                  const isValid = result.isValidTest !== false;

                  return (
                    <div
                      key={index}
                      className="p-6 hover:bg-surface transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-text">
                              {result.test.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${isValid
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                            >
                              {isValid ? "Valid" : "Invalid"}
                            </span>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-text-secondary">
                            <div className="flex items-center">
                              <span className="font-medium mr-1">Attempt:</span>
                              #{result.attemptNumber}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {result.submittedAt &&
                                new Date(
                                  result.submittedAt
                                ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {result.submittedAt &&
                                new Date(
                                  result.submittedAt
                                ).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        <div className="ml-6 flex flex-col items-end">
                          <div className="text-3xl font-bold text-primary mb-1">
                            {percentage.toFixed(1)}%
                          </div>
                          <div className="text-sm text-text-secondary">
                            {result.score}/{result.test.totalMarks} marks
                          </div>
                          <div className="mt-2 w-32 bg-surface rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${percentage >= 75
                                ? "bg-green-500"
                                : percentage >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                                }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-10 h-10 text-text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                No Results Yet
              </h3>
              <p className="text-text-secondary">
                Complete a test to see your results here
              </p>
            </div>
          )}

          {/* Show Incomplete Attempts Warning */}
          {myResults.filter((r) => !r.completed).length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <span className="mr-2">⚠️</span> Incomplete Attempts Detected
              </h4>
              <p className="text-sm text-yellow-700 mb-3">
                {myResults.filter((r) => !r.completed).length} attempt(s) were started but not submitted.
                This usually happens when the test is interrupted due to connectivity issues, max violations, or browser closure.
              </p>
              <div className="space-y-2">
                {myResults.filter((r) => !r.completed).map((result, idx) => (
                  <div key={idx} className="text-sm bg-white p-3 rounded border border-yellow-300">
                    <div className="font-medium text-gray-800">{result.test.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Attempt #{result.attemptNumber} • Started: {result.startedAt && new Date(result.startedAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-red-600 mt-1 font-semibold">
                      Status: Not Submitted (Score: {result.score || 0} marks)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
