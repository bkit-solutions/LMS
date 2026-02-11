import React, { useEffect, useState } from "react";
import { X, Plus, FileText, CheckCircle, Pencil, PieChart, Calendar, ClipboardList, HelpCircle } from "lucide-react";
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
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load tests");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-medium">Loading tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8 max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text">Error Loading Tests</h3>
          </div>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">Test Management</h1>
              <p className="text-text-secondary">Create, manage, and monitor your assessments</p>
            </div>
            <Link
              to="create"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Test
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Total Tests</h3>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text">{tests.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Published</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text">{tests.filter(t => t.published).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Drafts</h3>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Pencil className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text">{tests.filter(t => !t.published).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-text-secondary">Total Marks</h3>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-text">{tests.reduce((acc, t) => acc + t.totalMarks, 0)}</p>
          </div>
        </div>

        {/* Tests Grid */}
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test.id} className="bg-white rounded-lg shadow-sm border border-border hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-text mb-1 line-clamp-1">{test.title}</h3>
                      <p className="text-sm text-text-secondary line-clamp-2">{test.description}</p>
                    </div>
                    <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${test.published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                      }`}>
                      {test.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-text-secondary">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(test.startTime).toLocaleDateString()} - {new Date(test.endTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-text-secondary">
                      <ClipboardList className="w-4 h-4 mr-2" />
                      <span>Max {test.maxAttempts} {test.maxAttempts === 1 ? 'attempt' : 'attempts'}</span>
                    </div>
                    <div className="flex items-center text-sm font-semibold text-primary">
                      <PieChart className="w-4 h-4 mr-2" />
                      <span>{test.totalMarks} Total Marks</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border px-6 py-4 bg-surface flex items-center justify-between">
                  <Link
                    to={`${test.id}`}
                    className="text-sm font-medium text-primary hover:text-secondary transition-colors"
                  >
                    View Details →
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`${test.id}/questions`}
                      className="p-2 text-text-secondary hover:text-primary hover:bg-red-50 rounded-lg transition-colors"
                      title="Manage Questions"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-border p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">No Tests Yet</h3>
              <p className="text-text-secondary mb-6">Get started by creating your first assessment</p>
              <Link
                to="create"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Test
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestList;