import React, { useEffect, useState } from "react";
import { X, ChevronLeft, Plus, Loader2, Upload, CheckCircle, Pencil, Trash2, HelpCircle, Play } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { testApi } from "../../../../services/testApi";
import { useCollegeTheme } from "../../../../hooks/useCollegeTheme";
import type { Test, Question } from "../../../../types";
import QuestionFormModal from "../../../../components/admin/tests/QuestionFormModal";
import EditTestModal from "../../../../components/admin/tests/EditTestModal";
import dummyQuestions from "../../../../data/dummyQuestions.json";

const TestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applyTheme } = useCollegeTheme();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id || isNaN(parseInt(id))) {
      setError("Invalid test ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const testId = parseInt(id);
      const [testResponse, questionsResponse] = await Promise.all([
        testApi.getTest(testId),
        testApi.getQuestions(testId),
      ]);

      if (testResponse.success && testResponse.data) {
        setTest(testResponse.data);
      }

      if (questionsResponse.success && questionsResponse.data) {
        setQuestions(questionsResponse.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load test details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTest = (updatedTest: Test) => {
    setTest(updatedTest);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await testApi.deleteQuestion(questionId);
      if (response.success) {
        setQuestions(questions.filter(q => q.id !== questionId));
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  };

  const handleDeleteTest = async () => {
    if (!test || !confirm("Are you sure you want to delete this test? This will also delete all questions and results associated with it.")) return;

    try {
      setLoading(true);
      const response = await testApi.deleteTest(test.id);
      if (response.success) {
        navigate('../tests', { relative: 'path' });
      } else {
        setError(response.message || "Failed to delete test");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Delete test error:", err);
      if (err.response?.status === 200) {
        navigate('../tests', { relative: 'path' });
      } else {
        setError(err.response?.data?.message || "Failed to delete test");
        setLoading(false);
      }
    }
  };

  const handleImportDummyQuestions = async () => {
    if (!id) return;

    if (!confirm(`This will import ${dummyQuestions.length} dummy questions. Continue?`)) return;

    setImporting(true);
    setError(null);
    setImportProgress({ current: 0, total: dummyQuestions.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < dummyQuestions.length; i++) {
      const question = dummyQuestions[i];
      setImportProgress({ current: i + 1, total: dummyQuestions.length });

      try {
        const response = await testApi.createQuestion(parseInt(id), question as any);
        if (response.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err: any) {
        errorCount++;
      }
    }

    setImporting(false);
    await fetchData();

    if (errorCount > 0) {
      setError(`Import completed with ${successCount} successful and ${errorCount} failed questions.`);
    } else {
      alert(`Successfully imported ${successCount} questions!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-red-200 p-8 max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text">Test Not Found</h3>
          </div>
          <p className="text-text-secondary mb-6">{error || "The test you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('../tests', { relative: 'path' })}
            className="w-full px-4 py-2 bg-primary hover:bg-secondary text-white font-semibold rounded-lg transition-colors"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <div className="min-h-screen bg-surface">
      {/* Fixed Header */}
      <div className="bg-white border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('../tests', { relative: 'path' })}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-text">{test.title}</h1>
                <p className="text-sm text-text-secondary">{questions.length} questions · {totalMarks} marks</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${test.published ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                {test.published ? 'Published' : 'Draft'}
              </span>
              <button
                onClick={() => navigate('instructions')}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Preview Test
              </button>
              <button
                onClick={() => navigate('results')}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2 rotate-180" />
                View Results
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text hover:bg-surface rounded-lg transition-colors"
              >
                Edit Test
              </button>
              <button
                onClick={handleDeleteTest}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Test"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Test Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 sticky top-24">
              <h3 className="text-lg font-bold text-text mb-4">Test Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Description</label>
                  <p className="text-sm text-text mt-1">{test.description || 'No description provided'}</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Total Marks</label>
                      <p className="text-2xl font-bold text-primary mt-1">{test.totalMarks}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Questions</label>
                      <p className="text-2xl font-bold text-primary mt-1">{questions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Duration</label>
                  <p className="text-sm text-text mt-1">
                    <span className="block">{new Date(test.startTime).toLocaleDateString()} {new Date(test.startTime).toLocaleTimeString()}</span>
                    <span className="text-text-secondary">to</span>
                    <span className="block">{new Date(test.endTime).toLocaleDateString()} {new Date(test.endTime).toLocaleTimeString()}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Max Attempts</label>
                  <p className="text-sm text-text mt-1">{test.maxAttempts} {test.maxAttempts === 1 ? 'attempt' : 'attempts'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Questions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">Questions Bank</h2>
                  <p className="text-red-100 text-sm">Create and manage your test questions</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditingQuestion(null);
                      setShowQuestionForm(true);
                    }}
                    disabled={importing}
                    className="px-6 py-3 bg-white text-primary hover:bg-red-50 font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Question</span>
                  </button>
                  <button
                    onClick={handleImportDummyQuestions}
                    disabled={importing}
                    className="px-6 py-3 bg-white text-primary hover:bg-red-50 font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 text-primary" />
                        <span>Importing... ({importProgress.current}/{importProgress.total})</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Import Dummy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-all">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="flex items-center justify-center w-10 h-10 bg-primary text-white text-lg font-bold rounded-lg">
                              {index + 1}
                            </span>
                            <div className="flex items-center space-x-2">
                              {/* Type Badge */}
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${question.questionType === 'MCQ' ? 'bg-blue-100 text-blue-700' :
                                question.questionType === 'MAQ' ? 'bg-purple-100 text-purple-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                {question.questionType === 'MCQ' ? 'Single Choice' :
                                  question.questionType === 'MAQ' ? 'Multiple Choice' : 'Fill in Blank'}
                              </span>
                              <div className="flex items-center space-x-1 text-sm">
                                <span className="font-semibold text-primary">{question.marks}</span>
                                <span className="text-text-secondary">marks</span>
                                {question.negativeMarks > 0 && (
                                  <>
                                    <span className="text-text-secondary">·</span>
                                    <span className="text-red-600">-{question.negativeMarks}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-text font-medium text-lg mb-4">{question.questionText}</p>

                          {(question.questionType === 'MCQ' || question.questionType === 'MAQ') && (
                            <div className="space-y-2 ml-13">
                              {['A', 'B', 'C', 'D'].map((opt) => {
                                const optionText = question[`option${opt}` as keyof Question];
                                if (!optionText) return null;

                                const isCorrect = question.questionType === 'MCQ'
                                  ? question.correctOption === opt
                                  : question.correctOptionsCsv?.includes(opt);

                                return (
                                  <div key={opt} className={`flex items-center space-x-3 p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-surface'
                                    }`}>
                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-white text-text-secondary border border-border'
                                      }`}>
                                      {opt}
                                    </span>
                                    <span className={`flex-1 ${isCorrect ? 'font-medium text-green-900' : 'text-text'}`}>
                                      {optionText}
                                    </span>
                                    {isCorrect && (
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {question.questionType === 'FILL_BLANK' && (
                            <div className="ml-13 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <span className="text-sm font-semibold text-green-900">Answer: </span>
                              <span className="text-sm text-green-700">{question.correctAnswer}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingQuestion(question);
                              setShowQuestionForm(true);
                            }}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-border p-12 text-center">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-10 h-10 text-text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">No Questions Yet</h3>
                <p className="text-text-secondary mb-6">Start building your test by adding questions</p>
                <button
                  onClick={() => {
                    setEditingQuestion(null);
                    setShowQuestionForm(true);
                  }}
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Form Modal */}
      {showQuestionForm && (
        <QuestionFormModal
          testId={parseInt(id!)}
          question={editingQuestion}
          onSuccess={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
            fetchData();
          }}
          onCancel={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {/* Edit Test Modal */}
      {showEditModal && test && (
        <EditTestModal
          test={test}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleUpdateTest}
        />
      )}

      {/* Dummy Questions Modal */}
      {/* (If needed in future, logic is currently inline in handleImportDummyQuestions button) */}
    </div>
  );
};

export default TestDetailPage;